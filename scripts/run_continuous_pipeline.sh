#!/bin/bash

# Continuous RNA-seq Pipeline Runner
# This script runs the continuous discovery and processing pipeline

# Set working directory to project root
cd "$(dirname "$0")/.."

# Activate conda environment (adjust path as needed)
# source /path/to/conda/etc/profile.d/conda.sh
# conda activate rna-seq-platform

# Run the continuous discovery pipeline
echo "$(date): Starting continuous RNA-seq pipeline..."
python workflows/continuous_discovery.py --config config/stream.yaml

# Check if we need to restart the API to pick up new data
if [ $? -eq 0 ]; then
    echo "$(date): Pipeline completed successfully"
    
    # Optional: Restart API to pick up new data
    # This would depend on how your API is deployed
    # For local development:
    # pkill -f "uvicorn app.main:app"
    # cd api && uvicorn app.main:app --reload --port 8000 &
    
else
    echo "$(date): Pipeline failed"
    exit 1
fi
