from __future__ import annotations
import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, Any, List, Optional

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]


def safe_path(*parts: str) -> Path:
    p = (ROOT / Path(*parts)).resolve()
    if not str(p).startswith(str(ROOT)):
        raise ValueError("Unsafe path traversal detected")
    return p


@lru_cache(maxsize=1)
def load_samples() -> pd.DataFrame:
    fp = safe_path("data", "metadata", "samples.csv")
    if fp.exists():
        return pd.read_csv(fp)
    return pd.DataFrame(columns=["sample", "R1", "R2", "condition", "study"])


def _read_json(path: Path) -> Optional[Dict[str, Any] | List[Dict[str, Any]]]:
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


@lru_cache(maxsize=1)
def load_multiqc() -> Optional[Dict[str, Any]]:
    # MultiQC writes multiqc_data.json in the same directory as report
    p = safe_path("results", "qc", "multiqc_data.json")
    return _read_json(p)


@lru_cache(maxsize=1)
def load_de() -> List[Dict[str, Any]]:
    p = safe_path("results", "de", "deseq_results.json")
    data = _read_json(p)
    return data or []


@lru_cache(maxsize=1)
def load_pca() -> Dict[str, Any]:
    p = safe_path("results", "de", "pca.json")
    return _read_json(p) or {"scores": [], "variance": {"PC1": 0.0, "PC2": 0.0}}


@lru_cache(maxsize=1)
def load_heatmap() -> Dict[str, Any]:
    p = safe_path("results", "de", "heatmap.json")
    return _read_json(p) or {"rows": [], "cols": [], "values": []}


def list_files_under(*sub: str) -> List[Dict[str, Any]]:
    base = safe_path(*sub)
    items: List[Dict[str, Any]] = []
    if base.exists():
        for p in base.rglob("*"):
            if p.is_file():
                items.append({"path": str(p.relative_to(ROOT)), "size": p.stat().st_size})
    return items




