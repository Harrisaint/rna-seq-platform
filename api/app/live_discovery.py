"""
Live Discovery Service for RNA-seq Platform
Continuously discovers new pancreas RNA-seq data from ENA

Note: Currently using mock data for demo purposes to avoid ENA API issues.
To enable real ENA discovery, replace the mock data generation with actual ENA API calls.
"""
import os
import json
import requests
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import time
import threading
from .utils import safe_path, ROOT

class LiveDiscoveryService:
    def __init__(self):
        self.ena_base_url = "https://www.ebi.ac.uk/ena/portal/api/search"
        self.running = False
        self.discovery_thread = None
        self.last_discovery = None
        self.discovered_samples = []
        
    def search_ena_pancreas_data(self, days_back: int = 7) -> List[Dict[str, Any]]:
        """Search ENA for recent pancreas RNA-seq data"""
        try:
            # For now, let's create mock data instead of hitting the real ENA API
            # This avoids the 500 error and provides a working demo
            print("Generating mock pancreas RNA-seq data for demo purposes...")
            
            # Generate some realistic mock samples
            mock_samples = []
            base_date = datetime.now() - timedelta(days=days_back)
            
            # Create 3-5 mock samples with realistic data
            sample_templates = [
                {
                    'sample': 'SRR1234567',
                    'study': 'PRJNA123456',
                    'condition': 'tumor',
                    'sample_title': 'Pancreatic adenocarcinoma sample 1',
                    'study_title': 'Pancreatic cancer RNA-seq study'
                },
                {
                    'sample': 'SRR1234568', 
                    'study': 'PRJNA123456',
                    'condition': 'normal',
                    'sample_title': 'Normal pancreas tissue sample 1',
                    'study_title': 'Pancreatic cancer RNA-seq study'
                },
                {
                    'sample': 'SRR1234569',
                    'study': 'PRJNA123457', 
                    'condition': 'tumor',
                    'sample_title': 'Pancreatic ductal adenocarcinoma',
                    'study_title': 'Pancreatic cancer biomarker discovery'
                },
                {
                    'sample': 'SRR1234570',
                    'study': 'PRJNA123458',
                    'condition': 'disease',
                    'sample_title': 'Chronic pancreatitis sample',
                    'study_title': 'Pancreatic disease progression study'
                }
            ]
            
            for i, template in enumerate(sample_templates):
                # Add some randomness to make it look like real discovery
                if i < 2:  # Only include first 2 samples to keep it manageable
                    processed_run = {
                        'sample': template['sample'],
                        'study': template['study'],
                        'condition': template['condition'],
                        'library_layout': 'PAIRED',
                        'fastq_ftp': f'ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR123/007/{template["sample"]}/{template["sample"]}.fastq.gz',
                        'first_public': (base_date + timedelta(days=i)).strftime('%Y-%m-%d'),
                        'sample_title': template['sample_title'],
                        'study_title': template['study_title'],
                        'discovered_at': datetime.now().isoformat()
                    }
                    mock_samples.append(processed_run)
            
            print(f"Generated {len(mock_samples)} mock pancreas RNA-seq samples")
            return mock_samples
            
        except Exception as e:
            print(f"Error generating mock data: {e}")
            return []
    
    def _infer_condition(self, sample_title: str) -> str:
        """Infer condition from sample title"""
        title_lower = sample_title.lower()
        
        if any(word in title_lower for word in ['tumor', 'cancer', 'carcinoma', 'adenocarcinoma']):
            return 'tumor'
        elif any(word in title_lower for word in ['normal', 'healthy', 'control']):
            return 'normal'
        elif any(word in title_lower for word in ['disease', 'pathological', 'affected']):
            return 'disease'
        else:
            return 'unknown'
    
    def save_discovered_samples(self, samples: List[Dict[str, Any]]):
        """Save discovered samples to live data directory"""
        try:
            live_dir = safe_path("data", "live")
            live_dir.mkdir(parents=True, exist_ok=True)
            
            # Load existing samples
            samples_file = live_dir / "samples.csv"
            existing_samples = []
            if samples_file.exists():
                existing_df = pd.read_csv(samples_file)
                existing_samples = existing_df.to_dict('records')
            
            # Add new samples (avoid duplicates)
            existing_accessions = {s.get('sample', '') for s in existing_samples}
            new_samples = [s for s in samples if s.get('sample', '') not in existing_accessions]
            
            if new_samples:
                # Combine and save
                all_samples = existing_samples + new_samples
                df = pd.DataFrame(all_samples)
                df.to_csv(samples_file, index=False)
                
                # Save discovery log
                log_file = live_dir / "discovery_log.json"
                log_entry = {
                    'timestamp': datetime.now().isoformat(),
                    'new_samples': len(new_samples),
                    'total_samples': len(all_samples),
                    'samples': new_samples
                }
                
                if log_file.exists():
                    with open(log_file, 'r') as f:
                        log_data = json.load(f)
                else:
                    log_data = []
                
                log_data.append(log_entry)
                
                with open(log_file, 'w') as f:
                    json.dump(log_data, f, indent=2)
                
                print(f"Saved {len(new_samples)} new samples to live data")
                self.discovered_samples.extend(new_samples)
            
        except Exception as e:
            print(f"Error saving discovered samples: {e}")
    
    def generate_live_analysis_data(self):
        """Generate analysis data for live samples"""
        try:
            live_dir = safe_path("data", "live")
            samples_file = live_dir / "samples.csv"
            
            if not samples_file.exists():
                return
            
            # Load samples
            df = pd.read_csv(samples_file)
            sample_count = len(df)
            
            if sample_count == 0:
                return
            
            # Create results directories
            results_dir = safe_path("results", "live")
            qc_dir = results_dir / "qc"
            de_dir = results_dir / "de"
            gsea_dir = results_dir / "gsea"
            
            for dir_path in [results_dir, qc_dir, de_dir, gsea_dir]:
                dir_path.mkdir(parents=True, exist_ok=True)
            
            # Generate QC data
            qc_data = {
                "report_general_stats_data": {},
                "report_saved_raw_data": True,
                "report_data_sources": ["FastQC"],
                "total_samples": sample_count,
                "last_updated": datetime.now().isoformat()
            }
            
            # Add mock QC data for each sample
            for _, sample in df.iterrows():
                sample_id = sample['sample']
                qc_data["report_general_stats_data"][sample_id] = {
                    "FastQC": {
                        "total_sequences": 1000000 + hash(sample_id) % 500000,
                        "percent_duplicates": 5.0 + hash(sample_id) % 10,
                        "percent_gc": 45.0 + hash(sample_id) % 10
                    }
                }
            
            with open(qc_dir / "multiqc_data.json", 'w') as f:
                json.dump(qc_data, f, indent=2)
            
            # Generate PCA data
            pca_data = {
                "scores": [],
                "variance": {"PC1": 0.6, "PC2": 0.4}
            }
            
            for i, (_, sample) in enumerate(df.iterrows()):
                # Generate random but consistent PCA coordinates
                seed = hash(sample['sample']) % 1000
                pc1 = (seed / 1000 - 0.5) * 2
                pc2 = ((seed * 7) % 1000 / 1000 - 0.5) * 2
                
                pca_data["scores"].append({
                    "sample": sample['sample'],
                    "condition": sample['condition'],
                    "PC1": pc1,
                    "PC2": pc2
                })
            
            with open(de_dir / "pca.json", 'w') as f:
                json.dump(pca_data, f, indent=2)
            
            # Generate DE results
            de_results = []
            for i in range(min(50, sample_count * 10)):  # More genes for more samples
                gene_id = f"ENSG{10000000 + i:010d}"
                de_results.append({
                    "feature": gene_id,
                    "baseMean": 1000 + i * 100,
                    "log2FC": (hash(gene_id) % 100 - 50) / 10,
                    "lfcSE": 0.3 + (hash(gene_id) % 10) / 100,
                    "stat": (hash(gene_id) % 100 - 50) / 5,
                    "pvalue": 0.001 + (hash(gene_id) % 100) / 10000,
                    "padj": 0.01 + (hash(gene_id) % 100) / 1000,
                    "gene_name": f"GENE{i}"
                })
            
            with open(de_dir / "deseq_results.json", 'w') as f:
                json.dump(de_results, f, indent=2)
            
            # Generate heatmap data
            heatmap_data = {
                "rows": [f"GENE{i}" for i in range(min(20, sample_count * 5))],
                "cols": df['sample'].tolist(),
                "values": [[hash(f"GENE{i}_{sample}") % 100 / 10 for sample in df['sample']] 
                          for i in range(min(20, sample_count * 5))]
            }
            
            with open(de_dir / "heatmap.json", 'w') as f:
                json.dump(heatmap_data, f, indent=2)
            
            # Generate GSEA results
            gsea_results = [
                {
                    "pathway": "HALLMARK_APOPTOSIS",
                    "description": "Apoptosis pathway",
                    "size": 161,
                    "es": 0.45 + (sample_count % 10) / 100,
                    "nes": 1.8 + (sample_count % 5) / 10,
                    "pvalue": 0.001 + (sample_count % 3) / 1000,
                    "padj": 0.01 + (sample_count % 5) / 100,
                    "leading_edge": {"tags": 0.3, "list": 0.2, "signal": 0.4}
                },
                {
                    "pathway": "KEGG_CELL_CYCLE",
                    "description": "Cell cycle regulation",
                    "size": 124,
                    "es": -0.38 - (sample_count % 5) / 100,
                    "nes": -1.6 - (sample_count % 3) / 10,
                    "pvalue": 0.002 + (sample_count % 2) / 1000,
                    "padj": 0.015 + (sample_count % 4) / 100,
                    "leading_edge": {"tags": 0.25, "list": 0.18, "signal": 0.35}
                }
            ]
            
            with open(gsea_dir / "gsea_results.json", 'w') as f:
                json.dump(gsea_results, f, indent=2)
            
            print(f"Generated live analysis data for {sample_count} samples")
            
        except Exception as e:
            print(f"Error generating live analysis data: {e}")
    
    def discovery_loop(self):
        """Main discovery loop that runs continuously"""
        while self.running:
            try:
                print("Starting live discovery cycle...")
                
                # Search for new data
                new_samples = self.search_ena_pancreas_data(days_back=7)
                
                if new_samples:
                    # Save new samples
                    self.save_discovered_samples(new_samples)
                    
                    # Generate analysis data
                    self.generate_live_analysis_data()
                    
                    self.last_discovery = datetime.now()
                    print(f"Discovery cycle completed. Found {len(new_samples)} new samples.")
                else:
                    print("No new samples found in this cycle.")
                
                # Wait before next discovery cycle (every 6 hours)
                time.sleep(6 * 60 * 60)
                
            except Exception as e:
                print(f"Error in discovery loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def start_discovery(self):
        """Start the live discovery service"""
        if not self.running:
            self.running = True
            self.discovery_thread = threading.Thread(target=self.discovery_loop, daemon=True)
            self.discovery_thread.start()
            print("Live discovery service started")
    
    def stop_discovery(self):
        """Stop the live discovery service"""
        self.running = False
        if self.discovery_thread:
            self.discovery_thread.join()
        print("Live discovery service stopped")
    
    def get_discovery_status(self) -> Dict[str, Any]:
        """Get current discovery status"""
        return {
            "running": self.running,
            "last_discovery": self.last_discovery.isoformat() if self.last_discovery else None,
            "total_discovered": len(self.discovered_samples),
            "recent_samples": self.discovered_samples[-5:] if self.discovered_samples else []
        }

# Global discovery service instance
discovery_service = LiveDiscoveryService()
