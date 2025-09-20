import os
import yaml

configfile: "config/config.yaml"

with open(configfile, 'r') as fh:
    CFG = yaml.safe_load(fh)

PROJECT = CFG.get('project_name', 'project')
REF_FASTA = CFG.get('reference_fasta')
DISC = CFG.get('discover', {})

SAMPLES_CSV = "data/metadata/samples.csv"

rule all:
    input:
        SAMPLES_CSV,
        "results/qc/multiqc_report.html",
        expand("results/quant/{sample}/quant.sf", sample=lambda: [s.strip() for s in open(SAMPLES_CSV).read().splitlines()[1:]] if os.path.exists(SAMPLES_CSV) else []),
        "results/de/deseq_results.tsv",
        f"results/outputs/{PROJECT}_report.html",

rule discover_runs:
    output:
        SAMPLES_CSV
    conda:
        "envs/py.yaml"
    shell:
        (
            "python workflows/discover_runs.py --mode {DISC[mode]} "
            + ("--tsv {DISC[tsv]} " if DISC.get('mode') == 'project' else "")
            + ("--query-url '{DISC[query_url]}' " if DISC.get('mode') == 'query' else "")
            + (f"--days {DISC.get('days', '')} " if DISC.get('mode') == 'query' and DISC.get('days') else "")
            + f"--condition-default {DISC.get('condition_default','unknown')} --out {SAMPLES_CSV}"
        )

rule download_fastq:
    input:
        SAMPLES_CSV
    output:
        R1 = "data/raw/{sample}_R1.fastq.gz",
        R2 = "data/raw/{sample}_R2.fastq.gz"
    conda:
        "envs/net.yaml"
    run:
        import pandas as pd
        df = pd.read_csv(input[0])
        row = df[df['sample'] == wildcards.sample].iloc[0]
        urls = [row['R1'], row['R2']]
        outs = [output.R1, output.R2]
        for u, o in zip(urls, outs):
            shell(f"curl -L --retry 3 -o {o} {u}")

rule fastqc:
    input:
        R1 = "data/raw/{sample}_R1.fastq.gz",
        R2 = "data/raw/{sample}_R2.fastq.gz"
    output:
        "results/qc/fastqc/{sample}_R1_fastqc.html",
        "results/qc/fastqc/{sample}_R2_fastqc.html"
    conda:
        "envs/fastqc.yaml"
    shell:
        "fastqc -o results/qc/fastqc {input.R1} {input.R2}"

rule multiqc:
    input:
        expand("results/qc/fastqc/{{sample}}_R1_fastqc.html", sample=lambda: [s.strip() for s in open(SAMPLES_CSV).read().splitlines()[1:]] if os.path.exists(SAMPLES_CSV) else [])
    output:
        html = "results/qc/multiqc_report.html"
    conda:
        "envs/multiqc.yaml"
    shell:
        "multiqc results/qc -o results/qc"

rule salmon_index:
    input:
        REF_FASTA
    output:
        directory("results/salmon/index")
    conda:
        "envs/salmon.yaml"
    shell:
        "salmon index -t {input} -i {output}"

rule salmon_quant:
    input:
        idx = rules.salmon_index.output,
        R1 = "data/raw/{sample}_R1.fastq.gz",
        R2 = "data/raw/{sample}_R2.fastq.gz"
    output:
        "results/quant/{sample}/quant.sf"
    conda:
        "envs/salmon.yaml"
    shell:
        "salmon quant -i {input.idx} -l A -1 {input.R1} -2 {input.R2} -p 4 -o results/quant/{wildcards.sample}"

rule deseq2:
    input:
        quants = expand("results/quant/{{sample}}/quant.sf", sample=lambda: [s.strip() for s in open(SAMPLES_CSV).read().splitlines()[1:]] if os.path.exists(SAMPLES_CSV) else []),
        design = "config/design.tsv"
    output:
        tsv = "results/de/deseq_results.tsv",
        json = "results/de/deseq_results.json",
        pca_tsv = "results/de/pca.tsv",
        pca_json = "results/de/pca.json",
        heatmap_tsv = "results/de/topvar_heatmap.tsv",
        heatmap_json = "results/de/heatmap.json"
    conda:
        "envs/r.yaml"
    shell:
        (
            "Rscript workflows/deseq2.R "
            "--design {input.design} --quants_dir results/quant --out_prefix results/de/deseq"
            " && cp results/de/deseq_deseq_results.tsv {output.tsv}"
            " && cp results/de/deseq_deseq_results.json {output.json}"
            " && cp results/de/deseq_pca.tsv {output.pca_tsv}"
            " && cp results/de/deseq_pca.json {output.pca_json}"
            " && cp results/de/deseq_topvar_heatmap.tsv {output.heatmap_tsv}"
            " && cp results/de/deseq_heatmap.json {output.heatmap_json}"
        )

rule report:
    input:
        tsv = rules.deseq2.output.tsv
    output:
        html = f"results/outputs/{PROJECT}_report.html"
    conda:
        "envs/r.yaml"
    shell:
        f"Rscript -e \"rmarkdown::render('workflows/report.Rmd', params=list(project_name='{PROJECT}'), output_file='{output.html}')\""





