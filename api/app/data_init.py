"""
Data initialization script for RNA-seq Platform API
Downloads and processes demo data on startup
"""
import os
import json
import pandas as pd
from pathlib import Path
from typing import Dict, Any
import requests
import subprocess
import sys

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils import safe_path, ROOT

def download_file(url: str, local_path: Path) -> bool:
    """Download a file from URL to local path"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Downloaded: {url} -> {local_path}")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def create_demo_samples_csv():
    """Create the demo samples.csv file with PRJNA397172 data"""
    samples_data = {
        'sample': ['SRR5896247', 'SRR5896248'],
        'R1': [
            'ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR589/007/SRR5896247/SRR5896247.fastq.gz/SRR5896247.fastq.gz_1.fastq.gz',
            'ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR589/008/SRR5896248/SRR5896248.fastq.gz/SRR5896248.fastq.gz_1.fastq.gz'
        ],
        'R2': [
            'ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR589/007/SRR5896247/SRR5896247.fastq.gz/SRR5896247.fastq.gz_2.fastq.gz',
            'ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR589/008/SRR5896248/SRR5896248.fastq.gz/SRR5896248.fastq.gz_2.fastq.gz'
        ],
        'condition': ['normal', 'tumor'],
        'study': ['PRJNA397172', 'PRJNA397172']
    }
    
    df = pd.DataFrame(samples_data)
    samples_path = safe_path("data", "metadata", "samples.csv")
    samples_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(samples_path, index=False)
    print(f"Created samples.csv with {len(df)} samples")
    return samples_path

def create_demo_results():
    """Create demo analysis results for PRJNA397172"""
    results_dir = safe_path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # Create QC results
    qc_dir = results_dir / "qc"
    qc_dir.mkdir(exist_ok=True)
    
    multiqc_data = {
        "report_general_stats_data": {
            "SRR5896247": {
                "FastQC": {
                    "total_sequences": 1000000,
                    "percent_duplicates": 5.2,
                    "percent_gc": 45.8
                }
            },
            "SRR5896248": {
                "FastQC": {
                    "total_sequences": 950000,
                    "percent_duplicates": 4.8,
                    "percent_gc": 46.1
                }
            }
        },
        "report_saved_raw_data": True,
        "report_data_sources": ["FastQC"]
    }
    
    with open(qc_dir / "multiqc_data.json", 'w') as f:
        json.dump(multiqc_data, f, indent=2)
    
    # Create DE results
    de_dir = results_dir / "de"
    de_dir.mkdir(exist_ok=True)
    
    # Sample differential expression results - more comprehensive dataset
    de_results = [
        # Highly significant up-regulated genes
        {
            "feature": "ENSG00000000003",
            "baseMean": 1000.5,
            "log2FC": 2.1,
            "lfcSE": 0.3,
            "stat": 7.0,
            "pvalue": 1e-10,
            "padj": 1e-8,
            "gene_name": "TSPAN6"
        },
        {
            "feature": "ENSG00000000419",
            "baseMean": 2000.1,
            "log2FC": 1.8,
            "lfcSE": 0.2,
            "stat": 9.0,
            "pvalue": 1e-12,
            "padj": 1e-10,
            "gene_name": "DPM1"
        },
        {
            "feature": "ENSG00000000457",
            "baseMean": 1500.3,
            "log2FC": 1.5,
            "lfcSE": 0.25,
            "stat": 6.0,
            "pvalue": 1e-8,
            "padj": 1e-6,
            "gene_name": "SCYL3"
        },
        # Highly significant down-regulated genes
        {
            "feature": "ENSG00000000005",
            "baseMean": 500.2,
            "log2FC": -1.8,
            "lfcSE": 0.4,
            "stat": -4.5,
            "pvalue": 1e-5,
            "padj": 0.001,
            "gene_name": "TNMD"
        },
        {
            "feature": "ENSG00000000460",
            "baseMean": 800.7,
            "log2FC": -2.2,
            "lfcSE": 0.35,
            "stat": -6.3,
            "pvalue": 1e-9,
            "padj": 1e-7,
            "gene_name": "C1ORF112"
        },
        {
            "feature": "ENSG00000000938",
            "baseMean": 1200.4,
            "log2FC": -1.6,
            "lfcSE": 0.3,
            "stat": -5.3,
            "pvalue": 1e-7,
            "padj": 1e-5,
            "gene_name": "FGR"
        },
        # Moderately significant genes
        {
            "feature": "ENSG00000000971",
            "baseMean": 600.8,
            "log2FC": 1.2,
            "lfcSE": 0.4,
            "stat": 3.0,
            "pvalue": 0.002,
            "padj": 0.02,
            "gene_name": "CFH"
        },
        {
            "feature": "ENSG00000001036",
            "baseMean": 900.2,
            "log2FC": -1.1,
            "lfcSE": 0.35,
            "stat": -3.1,
            "pvalue": 0.001,
            "padj": 0.015,
            "gene_name": "FUCA2"
        },
        # Non-significant genes (for better plot visualization)
        {
            "feature": "ENSG00000001084",
            "baseMean": 400.5,
            "log2FC": 0.3,
            "lfcSE": 0.4,
            "stat": 0.75,
            "pvalue": 0.45,
            "padj": 0.8,
            "gene_name": "GCLC"
        },
        {
            "feature": "ENSG00000001167",
            "baseMean": 750.3,
            "log2FC": -0.4,
            "lfcSE": 0.3,
            "stat": -1.33,
            "pvalue": 0.18,
            "padj": 0.6,
            "gene_name": "NFYA"
        },
        {
            "feature": "ENSG00000001461",
            "baseMean": 1100.7,
            "log2FC": 0.2,
            "lfcSE": 0.25,
            "stat": 0.8,
            "pvalue": 0.42,
            "padj": 0.75,
            "gene_name": "STPG1"
        },
        {
            "feature": "ENSG00000001497",
            "baseMean": 650.9,
            "log2FC": -0.6,
            "lfcSE": 0.35,
            "stat": -1.71,
            "pvalue": 0.09,
            "padj": 0.4,
            "gene_name": "NIPAL3"
        }
    ]
    
    with open(de_dir / "deseq_results.json", 'w') as f:
        json.dump(de_results, f, indent=2)
    
    # Create PCA results
    pca_data = {
        "scores": [
            {"sample": "SRR5896247", "PC1": 0.5, "PC2": -0.3, "condition": "normal"},
            {"sample": "SRR5896248", "PC1": -0.5, "PC2": 0.3, "condition": "tumor"}
        ],
        "variance": {"PC1": 0.65, "PC2": 0.35}
    }
    
    with open(de_dir / "pca.json", 'w') as f:
        json.dump(pca_data, f, indent=2)
    
    # Create heatmap data
    heatmap_data = {
        "rows": ["ENSG00000000003", "ENSG00000000005", "ENSG00000000419"],
        "cols": ["SRR5896247", "SRR5896248"],
        "values": [
            [8.5, 10.6],  # TSPAN6 expression
            [6.2, 4.4],   # TNMD expression  
            [7.8, 8.3]    # DPM1 expression
        ]
    }
    
    with open(de_dir / "heatmap.json", 'w') as f:
        json.dump(heatmap_data, f, indent=2)
    
    # Create GSEA results
    gsea_dir = results_dir / "gsea"
    gsea_dir.mkdir(exist_ok=True)
    
    gsea_results = [
        {
            "pathway": "HALLMARK_APOPTOSIS",
            "description": "Apoptosis pathway",
            "size": 161,
            "es": 0.45,
            "nes": 1.8,
            "pvalue": 0.001,
            "padj": 0.01,
            "leading_edge": {"tags": 0.3, "list": 0.2, "signal": 0.4}
        },
        {
            "pathway": "KEGG_CELL_CYCLE",
            "description": "Cell cycle regulation",
            "size": 124,
            "es": -0.38,
            "nes": -1.6,
            "pvalue": 0.002,
            "padj": 0.015,
            "leading_edge": {"tags": 0.25, "list": 0.18, "signal": 0.35}
        },
        {
            "pathway": "GO_BP_DNA_REPAIR",
            "description": "DNA repair process",
            "size": 89,
            "es": 0.42,
            "nes": 1.7,
            "pvalue": 0.003,
            "padj": 0.02,
            "leading_edge": {"tags": 0.28, "list": 0.22, "signal": 0.38}
        },
        {
            "pathway": "REACTOME_SIGNALING_BY_RECEPTORS",
            "description": "Receptor signaling",
            "size": 156,
            "es": -0.35,
            "nes": -1.5,
            "pvalue": 0.004,
            "padj": 0.025,
            "leading_edge": {"tags": 0.24, "list": 0.20, "signal": 0.33}
        },
        {
            "pathway": "HALLMARK_OXIDATIVE_PHOSPHORYLATION",
            "description": "Oxidative phosphorylation",
            "size": 200,
            "es": 0.40,
            "nes": 1.6,
            "pvalue": 0.005,
            "padj": 0.03,
            "leading_edge": {"tags": 0.26, "list": 0.19, "signal": 0.36}
        }
    ]
    
    with open(gsea_dir / "gsea_results.json", 'w') as f:
        json.dump(gsea_results, f, indent=2)
    
    print("Created demo analysis results")
    return True

def initialize_demo_data():
    """Initialize demo data for PRJNA397172"""
    print("Initializing demo data for PRJNA397172...")
    
    # Create data directory structure
    data_dir = safe_path("data")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Create samples.csv
    create_demo_samples_csv()
    
    # Create demo results
    create_demo_results()
    
    print("Demo data initialization complete!")
    return True

if __name__ == "__main__":
    initialize_demo_data()
