#!/usr/bin/env Rscript
suppressPackageStartupMessages({
  library(optparse)
  library(tximport)
  library(DESeq2)
  library(jsonlite)
  library(ggplot2)
  library(pheatmap)
})

option_list <- list(
  make_option(c("--design"), type="character", help="Path to design.tsv (sample\tcondition)"),
  make_option(c("--quants_dir"), type="character", help="Directory with Salmon quant/ subdirs"),
  make_option(c("--out_prefix"), type="character", help="Output prefix under results/de/")
)
opt <- parse_args(OptionParser(option_list=option_list))

design <- read.table(opt$design, header=TRUE, sep='\t', stringsAsFactors=FALSE)
colnames(design) <- c('sample','condition')
rownames(design) <- design$sample

quant_files <- file.path(opt$quants_dir, design$sample, 'quant.sf')
names(quant_files) <- design$sample

# Try tximport; if gene mapping unavailable, keep transcript-level with lengthScaledTPM
txi <- tryCatch({
  tximport(quant_files, type='salmon', txOut=TRUE)
}, error=function(e) {
  stop(e)
})

dds <- DESeqDataSetFromTximport(txi, colData=design, design=~condition)
dds$condition <- factor(dds$condition)
dds <- dds[rowSums(counts(dds)) > 1, ]
dds <- DESeq(dds)
res <- lfcShrink(dds, coef=2, type='apeglm')
res_df <- as.data.frame(res)
res_df$feature <- rownames(res_df)
res_df <- res_df[, c('feature','baseMean','log2FoldChange','padj')]
colnames(res_df) <- c('feature','baseMean','log2FC','padj')

out_dir <- dirname(opt$out_prefix)
dir.create(out_dir, showWarnings=FALSE, recursive=TRUE)

# Write DE results
tsv_path <- paste0(opt$out_prefix, '_deseq_results.tsv')
json_path <- paste0(opt$out_prefix, '_deseq_results.json')
write.table(res_df, file=tsv_path, sep='\t', quote=FALSE, row.names=FALSE)
write(toJSON(res_df, dataframe='rows', auto_unbox=TRUE, digits=6), file=json_path)

# PCA
vsd <- vst(dds, blind=FALSE)
pca <- prcomp(t(assay(vsd)))
pca_scores <- as.data.frame(pca$x)
pca_scores$sample <- rownames(pca_scores)
pca_scores$condition <- design[pca_scores$sample, 'condition']
var_explained <- (pca$sdev^2) / sum(pca$sdev^2)

pca_tsv <- paste0(opt$out_prefix, '_pca.tsv')
pca_json <- paste0(opt$out_prefix, '_pca.json')
write.table(pca_scores[, c('sample','condition','PC1','PC2')], file=pca_tsv, sep='\t', quote=FALSE, row.names=FALSE)
pca_payload <- list(
  scores = pca_scores[, c('sample','condition','PC1','PC2')],
  variance = list(PC1 = var_explained[1], PC2 = var_explained[2])
)
write(toJSON(pca_payload, dataframe='rows', auto_unbox=TRUE, digits=6), file=pca_json)

# Heatmap of top variable features
rv <- rowVars(assay(vsd))
select <- order(rv, decreasing=TRUE)[seq_len(min(50, length(rv)))]
mat <- assay(vsd)[select, ]
mat <- mat - rowMeans(mat)
heatmap_tsv <- paste0(opt$out_prefix, '_topvar_heatmap.tsv')
write.table(mat, file=heatmap_tsv, sep='\t', quote=FALSE, col.names=NA)
heatmap_json <- paste0(opt$out_prefix, '_heatmap.json')
heatmap_payload <- list(
  rows = rownames(mat),
  cols = colnames(mat),
  values = unname(as.data.frame(mat))
)
write(toJSON(heatmap_payload, dataframe='rows', auto_unbox=TRUE, digits=6), file=heatmap_json)

# Optional PNGs for report assets
assets_dir <- file.path('results', 'report_assets')
dir.create(assets_dir, showWarnings=FALSE, recursive=TRUE)

# Volcano
png(file.path(assets_dir, 'volcano.png'), width=900, height=700)
ggplot(res_df, aes(x=log2FC, y=-log10(padj))) + geom_point(alpha=0.5) + theme_minimal()
dev.off()

# MA plot
png(file.path(assets_dir, 'ma.png'), width=900, height=700)
plotMA(res, ylim=c(-5,5))
dev.off()




