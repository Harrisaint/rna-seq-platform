-- Multi-Omics Biological Discovery Platform Database Schema
-- Supports RNA-seq, Genomics, Proteomics, Metabolomics, and Single-Cell data

-- Studies table - Main study/project information
CREATE TABLE studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL,  -- 'rna_seq', 'genomics', 'proteomics', 'metabolomics', 'single_cell', 'multi_omics'
    disease_focus TEXT,  -- 'cancer', 'neurodegenerative', 'cardiovascular', 'metabolic', 'autoimmune', 'infectious', 'developmental'
    tissue_type TEXT,  -- 'brain', 'heart', 'liver', 'pancreas', 'lung', 'breast', 'blood', 'muscle', 'skin', 'gut'
    experimental_condition TEXT,  -- 'disease', 'control', 'treatment', 'drug_response', 'environmental', 'dietary'
    organism TEXT DEFAULT 'Homo sapiens',
    publication_date DATE,
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON  -- Flexible metadata storage for study-specific information
);

-- Samples table - Individual sample information
CREATE TABLE samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sample_id TEXT UNIQUE NOT NULL,
    study_id TEXT NOT NULL,
    condition TEXT NOT NULL,  -- 'disease', 'control', 'treatment', 'baseline', 'followup'
    tissue TEXT,
    organ TEXT,  -- More specific than tissue
    cell_type TEXT,  -- For single-cell studies
    age_group TEXT,  -- 'pediatric', 'adult', 'elderly', or specific age ranges
    gender TEXT,  -- 'male', 'female', 'mixed', 'unknown'
    ethnicity TEXT,
    disease_stage TEXT,  -- For disease studies: 'early', 'advanced', 'metastatic', etc.
    treatment_status TEXT,  -- 'naive', 'treated', 'resistant', 'responsive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,  -- Flexible metadata storage
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Data files table - Links samples to their data files
CREATE TABLE data_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sample_id TEXT NOT NULL,
    file_type TEXT NOT NULL,  -- 'fastq', 'bam', 'vcf', 'expression_matrix', 'protein_data', 'metabolite_data'
    file_path TEXT NOT NULL,
    file_format TEXT,  -- 'fastq.gz', 'bam', 'vcf', 'csv', 'tsv', 'h5ad'
    file_size INTEGER,  -- Size in bytes
    checksum TEXT,  -- MD5 or SHA256 checksum
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sample_id) REFERENCES samples(sample_id) ON DELETE CASCADE
);

-- Analysis results table - Stores analysis outputs
CREATE TABLE analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,  -- 'differential_expression', 'variant_calling', 'protein_quantification', 'metabolite_profiling', 'pathway_analysis'
    result_type TEXT NOT NULL,  -- 'genes', 'proteins', 'metabolites', 'variants', 'pathways'
    result_data JSON NOT NULL,  -- The actual analysis results
    parameters JSON,  -- Analysis parameters used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(study_id) ON DELETE CASCADE
);

-- Discovery log table - Tracks data discovery activities
CREATE TABLE discovery_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_type TEXT NOT NULL,
    disease_focus TEXT,
    tissue_type TEXT,
    api_source TEXT,  -- 'ena', 'geo', 'sra', 'custom'
    query_used TEXT,
    samples_found INTEGER DEFAULT 0,
    samples_processed INTEGER DEFAULT 0,
    api_status TEXT,  -- 'success', 'error', 'timeout'
    error_message TEXT,
    processing_time_seconds INTEGER
);

-- Gene annotations table - For RNA-seq and genomics
CREATE TABLE gene_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gene_id TEXT UNIQUE NOT NULL,
    gene_symbol TEXT,
    gene_name TEXT,
    chromosome TEXT,
    start_position INTEGER,
    end_position INTEGER,
    strand TEXT,  -- '+', '-', or 'unknown'
    gene_type TEXT,  -- 'protein_coding', 'lncRNA', 'miRNA', 'pseudogene', etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Protein annotations table - For proteomics
CREATE TABLE protein_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protein_id TEXT UNIQUE NOT NULL,
    protein_name TEXT,
    uniprot_id TEXT,
    gene_symbol TEXT,
    protein_family TEXT,
    molecular_function TEXT,
    biological_process TEXT,
    cellular_component TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metabolite annotations table - For metabolomics
CREATE TABLE metabolite_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metabolite_id TEXT UNIQUE NOT NULL,
    metabolite_name TEXT,
    hmdb_id TEXT,
    kegg_id TEXT,
    chebi_id TEXT,
    molecular_formula TEXT,
    molecular_weight REAL,
    metabolite_class TEXT,
    pathway TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pathways table - For pathway analysis across all data types
CREATE TABLE pathways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pathway_id TEXT UNIQUE NOT NULL,
    pathway_name TEXT NOT NULL,
    pathway_source TEXT NOT NULL,  -- 'kegg', 'reactome', 'go', 'hallmark', 'custom'
    pathway_type TEXT,  -- 'metabolic', 'signaling', 'disease', 'biological_process'
    description TEXT,
    gene_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table - For future user authentication
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    preferred_data_types JSON,  -- Array of preferred data types
    preferred_diseases JSON,  -- Array of preferred disease focuses
    preferred_tissues JSON,  -- Array of preferred tissue types
    analysis_preferences JSON,  -- Analysis parameters and preferences
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_studies_data_type ON studies(data_type);
CREATE INDEX idx_studies_disease_focus ON studies(disease_focus);
CREATE INDEX idx_studies_tissue_type ON studies(tissue_type);
CREATE INDEX idx_samples_study_id ON samples(study_id);
CREATE INDEX idx_samples_condition ON samples(condition);
CREATE INDEX idx_samples_tissue ON samples(tissue);
CREATE INDEX idx_samples_organ ON samples(organ);
CREATE INDEX idx_data_files_sample_id ON data_files(sample_id);
CREATE INDEX idx_data_files_file_type ON data_files(file_type);
CREATE INDEX idx_analysis_results_study_id ON analysis_results(study_id);
CREATE INDEX idx_analysis_results_analysis_type ON analysis_results(analysis_type);
CREATE INDEX idx_discovery_log_date ON discovery_log(discovery_date);
CREATE INDEX idx_discovery_log_data_type ON discovery_log(data_type);

-- Create views for common queries
CREATE VIEW study_summary AS
SELECT 
    s.id,
    s.study_id,
    s.title,
    s.data_type,
    s.disease_focus,
    s.tissue_type,
    s.sample_count,
    COUNT(sa.id) as actual_samples,
    s.created_at
FROM studies s
LEFT JOIN samples sa ON s.study_id = sa.study_id
GROUP BY s.id, s.study_id, s.title, s.data_type, s.disease_focus, s.tissue_type, s.sample_count, s.created_at;

CREATE VIEW sample_details AS
SELECT 
    s.sample_id,
    s.study_id,
    st.title as study_title,
    st.data_type,
    st.disease_focus,
    s.condition,
    s.tissue,
    s.organ,
    s.cell_type,
    s.age_group,
    s.gender,
    s.disease_stage,
    s.treatment_status,
    s.created_at
FROM samples s
JOIN studies st ON s.study_id = st.study_id;

-- Insert some initial pathway data
INSERT INTO pathways (pathway_id, pathway_name, pathway_source, pathway_type, description, gene_count) VALUES
('KEGG_00010', 'Glycolysis / Gluconeogenesis', 'kegg', 'metabolic', 'Core metabolic pathway for glucose breakdown', 65),
('KEGG_00020', 'Citrate cycle (TCA cycle)', 'kegg', 'metabolic', 'Central metabolic cycle for energy production', 30),
('KEGG_00030', 'Pentose phosphate pathway', 'kegg', 'metabolic', 'Alternative glucose metabolism pathway', 30),
('KEGG_04010', 'MAPK signaling pathway', 'kegg', 'signaling', 'Mitogen-activated protein kinase signaling', 267),
('KEGG_04014', 'Ras signaling pathway', 'kegg', 'signaling', 'Ras protein signaling cascade', 226),
('REACTOME_R-HSA-73857', 'RNA Polymerase II Transcription', 'reactome', 'biological_process', 'Transcription of protein-coding genes', 500),
('REACTOME_R-HSA-74160', 'Gene Expression', 'reactome', 'biological_process', 'Complete gene expression process', 1000),
('GO_0006412', 'Translation', 'go', 'biological_process', 'Protein synthesis from mRNA', 200),
('GO_0006414', 'Translational elongation', 'go', 'biological_process', 'Elongation phase of translation', 50),
('HALLMARK_H1', 'HALLMARK_G1_S_CHECKPOINT', 'hallmark', 'disease', 'Cell cycle G1/S checkpoint genes', 200);
