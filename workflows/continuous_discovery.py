#!/usr/bin/env python3
"""
Continuous RNA-seq data discovery and processing pipeline.
This script runs periodically to discover new RNA-seq data and process it.
"""

import argparse
import datetime as dt
import json
import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any

import yaml
from discover_runs import discover_runs


def setup_logging() -> logging.Logger:
    """Set up logging for the continuous discovery process."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/continuous_discovery.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)


def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def run_discovery(config: Dict[str, Any], logger: logging.Logger) -> int:
    """Run the discovery process and return number of new samples found."""
    discover_config = config['discover']
    
    logger.info("Starting RNA-seq data discovery...")
    
    try:
        # Run discovery
        df = discover_runs(
            mode=discover_config['mode'],
            tsv=discover_config.get('tsv'),
            query_url=discover_config.get('query_url'),
            days=discover_config.get('days'),
            condition_default=discover_config.get('condition_default', 'unknown'),
            out_csv='data/metadata/samples.csv'
        )
        
        new_samples = len(df)
        logger.info(f"Discovered {new_samples} new RNA-seq samples")
        
        if new_samples > 0:
            logger.info(f"New samples: {df['sample'].tolist()}")
            
            # Update design file if needed
            update_design_file(df, logger)
            
        return new_samples
        
    except Exception as e:
        logger.error(f"Error during discovery: {e}")
        return 0


def update_design_file(df, logger: logging.Logger) -> None:
    """Update the design file with new samples."""
    design_path = Path('config/design.tsv')
    
    # Read existing design
    if design_path.exists():
        existing_design = pd.read_csv(design_path, sep='\t')
        existing_samples = set(existing_design['sample'].tolist())
    else:
        existing_design = pd.DataFrame(columns=['sample', 'condition'])
        existing_samples = set()
    
    # Add new samples
    new_samples = df[~df['sample'].isin(existing_samples)][['sample', 'condition']]
    
    if not new_samples.empty:
        updated_design = pd.concat([existing_design, new_samples], ignore_index=True)
        updated_design.to_csv(design_path, sep='\t', index=False)
        logger.info(f"Updated design file with {len(new_samples)} new samples")


def run_analysis_pipeline(config: Dict[str, Any], logger: logging.Logger) -> bool:
    """Run the complete analysis pipeline."""
    logger.info("Starting analysis pipeline...")
    
    try:
        # Run Snakemake pipeline
        cmd = ['snakemake', '-j4', '--use-conda', '--quiet']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("Analysis pipeline completed successfully")
            return True
        else:
            logger.error(f"Analysis pipeline failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Error running analysis pipeline: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Continuous RNA-seq data discovery and processing")
    parser.add_argument("--config", default="config/stream.yaml", help="Configuration file path")
    parser.add_argument("--discover-only", action="store_true", help="Only run discovery, skip analysis")
    parser.add_argument("--analysis-only", action="store_true", help="Only run analysis, skip discovery")
    
    args = parser.parse_args()
    
    # Setup
    Path('logs').mkdir(exist_ok=True)
    logger = setup_logging()
    
    logger.info("=== Starting Continuous RNA-seq Pipeline ===")
    
    # Load configuration
    config = load_config(args.config)
    logger.info(f"Loaded configuration: {config['project_name']}")
    
    new_samples = 0
    
    # Run discovery (unless analysis-only)
    if not args.analysis_only:
        new_samples = run_discovery(config, logger)
    
    # Run analysis pipeline (if new samples found or analysis-only)
    if (new_samples > 0 or args.analysis_only) and not args.discover_only:
        success = run_analysis_pipeline(config, logger)
        if success:
            logger.info("=== Pipeline completed successfully ===")
        else:
            logger.error("=== Pipeline failed ===")
            sys.exit(1)
    else:
        logger.info(f"No new samples found ({new_samples}), skipping analysis")
    
    logger.info("=== Continuous Pipeline Finished ===")


if __name__ == "__main__":
    import pandas as pd
    main()
