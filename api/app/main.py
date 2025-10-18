from __future__ import annotations
from typing import List, Optional
import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from . import schemas
from .utils import load_samples, load_multiqc, load_de, load_pca, load_heatmap, load_gsea, list_files_under, safe_path
from .live_discovery import discovery_service

app = FastAPI(title="RNA-seq Platform API")

# Initialize demo data and start live discovery on startup
@app.on_event("startup")
async def startup_event():
    """Initialize demo data and start live discovery when the API starts"""
    try:
        from .data_init import initialize_demo_data
        print("Starting data initialization...")
        initialize_demo_data()
        print("Data initialization completed successfully!")
        
        # Populate startup data and start live discovery service
        print("Populating startup data...")
        discovery_service.populate_startup_data()
        
        print("Starting live discovery service...")
        discovery_service.start_discovery()
        print("Live discovery service started!")
        
    except Exception as e:
        print(f"Warning: Data initialization failed: {e}")
        print("API will start but demo data may not be available")

import os

# Get allowed origins from environment variable or default to localhost and common frontend domains
DEFAULT_ORIGINS = "http://localhost:5173,https://rna-seq-platform.vercel.app,https://rna-seq-platform-web.vercel.app,https://rna-seq-platform-oekb6bc93-harrisaints-projects.vercel.app,https://*.vercel.app"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
print(f"ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/runs", response_model=List[schemas.Run])
def get_runs(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")) -> List[schemas.Run]:
    df = load_samples(mode=mode)
    return [schemas.Run(sample=r.sample, study=getattr(r, 'study', None), condition=getattr(r, 'condition', None)) for r in df.itertuples(index=False)]


@app.get("/qc/summary")
def qc_summary(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")):
    return load_multiqc(mode=mode) or {}


@app.get("/de", response_model=List[schemas.DEGene])
def get_de(
    min_abs_log2fc: float = Query(0.0),
    max_padj: float = Query(1.0),
    limit: int = Query(1000, le=10000),
    sort: str = Query("padj"),
    mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")
) -> List[schemas.DEGene]:
    data = load_de(mode=mode)
    # Filter
    filtered = [d for d in data if (d.get("padj") is None or d["padj"] <= max_padj) and (d.get("log2FC") is None or abs(d["log2FC"]) >= min_abs_log2fc)]
    # Sort
    filtered.sort(key=lambda d: (float('inf') if d.get(sort) is None else d.get(sort)))
    return filtered[:limit]


@app.get("/gene/{gene_id}")
def get_gene(gene_id: str, mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")):
    # For demo: return DE row for the gene if present
    data = load_de(mode=mode)
    row = next((d for d in data if d.get("feature") == gene_id), None)
    return row or {}


@app.get("/pca", response_model=schemas.PCAPayload)
def get_pca(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")):
    payload = load_pca(mode=mode)
    return payload


@app.get("/heatmap", response_model=schemas.HeatmapPayload)
def get_heatmap(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")):
    return load_heatmap(mode=mode)


@app.get("/gsea", response_model=schemas.GSEAPayload)
def get_gsea(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")):
    results = load_gsea(mode=mode)
    gene_sets = ["KEGG", "GO_BP", "GO_MF", "GO_CC", "REACTOME", "HALLMARK"]
    return schemas.GSEAPayload(results=results, gene_sets=gene_sets)


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


@app.get("/discovery/status")
def get_discovery_status():
    """Get live discovery service status"""
    return discovery_service.get_discovery_status()


@app.post("/discovery/trigger")
def trigger_discovery(organ: str = None):
    """Manually trigger a discovery cycle with optional organ filter"""
    try:
        new_samples = discovery_service.search_ena_cancer_data(days_back=365, organ_filter=organ)
        if new_samples:
            discovery_service.save_discovered_samples(new_samples)
            discovery_service.generate_live_analysis_data()
        return {"message": f"Discovery triggered. Found {len(new_samples)} new samples.", "organ_filter": organ}
    except Exception as e:
        return {"error": str(e)}


@app.get("/discovery/organs")
def get_available_organs():
    """Get list of available organ types from discovered samples"""
    try:
        live_dir = safe_path("data", "live")
        samples_file = live_dir / "samples.csv"
        
        if not samples_file.exists():
            return {"organs": []}
        
        import pandas as pd
        df = pd.read_csv(samples_file)
        
        if 'organ' in df.columns:
            organs = df['organ'].value_counts().to_dict()
            return {"organs": organs}
        else:
            return {"organs": []}
    except Exception as e:
        return {"error": str(e)}


@app.get("/files")
def files():
    return list_files_under("results")




