from __future__ import annotations
from typing import List, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from . import schemas
from .utils import load_samples, load_multiqc, load_de, load_pca, load_heatmap, list_files_under, safe_path

app = FastAPI(title="RNA-seq Platform API")

import os

# Get allowed origins from environment variable or default to localhost
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/runs", response_model=List[schemas.Run])
def get_runs() -> List[schemas.Run]:
    df = load_samples()
    return [schemas.Run(sample=r.sample, study=getattr(r, 'study', None), condition=getattr(r, 'condition', None)) for r in df.itertuples(index=False)]


@app.get("/qc/summary")
def qc_summary():
    return load_multiqc() or {}


@app.get("/de", response_model=List[schemas.DEGene])
def get_de(
    min_abs_log2fc: float = Query(0.0),
    max_padj: float = Query(1.0),
    limit: int = Query(1000, le=10000),
    sort: str = Query("padj")
) -> List[schemas.DEGene]:
    data = load_de()
    # Filter
    filtered = [d for d in data if (d.get("padj") is None or d["padj"] <= max_padj) and (d.get("log2FC") is None or abs(d["log2FC"]) >= min_abs_log2fc)]
    # Sort
    filtered.sort(key=lambda d: (float('inf') if d.get(sort) is None else d.get(sort)))
    return filtered[:limit]


@app.get("/gene/{gene_id}")
def get_gene(gene_id: str):
    # For demo: return DE row for the gene if present
    data = load_de()
    row = next((d for d in data if d.get("feature") == gene_id), None)
    return row or {}


@app.get("/pca", response_model=schemas.PCAPayload)
def get_pca():
    payload = load_pca()
    return payload


@app.get("/heatmap", response_model=schemas.HeatmapPayload)
def get_heatmap():
    return load_heatmap()


@app.get("/provenance", response_model=schemas.Provenance)
def provenance():
    import yaml  # lazy import
    cfg_path = safe_path("config", "config.yaml")
    project_name = "project"
    if cfg_path.exists():
        with open(cfg_path, "r", encoding="utf-8") as fh:
            cfg = yaml.safe_load(fh)
            project_name = cfg.get("project_name", project_name)
    timestamps = {
        "samples_csv": str(safe_path("data", "metadata", "samples.csv")) if safe_path("data", "metadata", "samples.csv").exists() else None,
        "de_results": str(safe_path("results", "de", "deseq_results.tsv")) if safe_path("results", "de", "deseq_results.tsv").exists() else None,
        "report_html": str(safe_path("results", "outputs", f"{project_name}_report.html")) if safe_path("results", "outputs", f"{project_name}_report.html").exists() else None,
    }
    return schemas.Provenance(project_name=project_name, config_path=str(cfg_path), timestamps=timestamps)


@app.get("/files")
def files():
    return list_files_under("results")




