RNA-seq Platform

End-to-end RNA-seq workflow and web app for PRJNA397172 (pancreatic cancer) and streaming ENA queries. Pipeline: download → QC → Salmon quant → DESeq2 → HTML report. Results exposed via FastAPI and visualized in a React dashboard.

Prerequisites
- Conda (Mambaforge/Miniforge recommended)
- Node.js 18+

Setup
```bash
conda install -c conda-forge mamba
mamba env create -f envs/py.yaml   # snakemake runs will auto-create as needed
cp config/project.yaml config/config.yaml
# Place transcripts.fa and PRJNA397172.tsv as described
make demo
```

Start backend
```bash
cd api && uvicorn app.main:app --reload --port 8000
```

Start frontend
```bash
cd web && npm i && npm run dev
```

Notes
- Demo vs stream modes via Makefile (`make demo` / `make stream`).
- Set conditions in `config/design.tsv`.
- Outputs in `results/` and final HTML under `results/outputs/`.







