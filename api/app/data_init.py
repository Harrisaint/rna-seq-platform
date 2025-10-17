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
    
    # Sample differential expression results
    de_results = [
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
            "feature": "ENSG00000000419",
            "baseMean": 2000.1,
            "log2FC": 0.5,
            "lfcSE": 0.2,
            "stat": 2.5,
            "pvalue": 0.01,
            "padj": 0.05,
            "gene_name": "DPM1"
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
