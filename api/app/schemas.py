from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class Run(BaseModel):
    sample: str
    study: Optional[str] = None
    condition: Optional[str] = None


class Sample(BaseModel):
    sample: str
    R1: Optional[str] = None
    R2: Optional[str] = None
    condition: Optional[str] = None
    study: Optional[str] = None


class QCStat(BaseModel):
    sample: str
    metrics: Dict[str, Any]


class DEGene(BaseModel):
    feature: str
    baseMean: Optional[float]
    log2FC: Optional[float]
    padj: Optional[float]


class PCAScore(BaseModel):
    sample: str
    condition: Optional[str]
    PC1: float
    PC2: float


class PCAVariance(BaseModel):
    PC1: float
    PC2: float


class PCAPayload(BaseModel):
    scores: List[PCAScore]
    variance: PCAVariance


class HeatmapPayload(BaseModel):
    rows: List[str]
    cols: List[str]
    values: List[List[float]] | List[Dict[str, float]]


class Provenance(BaseModel):
    project_name: str
    config_path: str
    timestamps: Dict[str, Optional[str]]





