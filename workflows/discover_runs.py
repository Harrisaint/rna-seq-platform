#!/usr/bin/env python3
import argparse
import datetime as dt
import io
import os
from pathlib import Path
from typing import List, Optional, Tuple

import pandas as pd
import pyarrow as pa  # noqa: F401  # ensure pyarrow is present for parquet
import requests


def _parse_fastq_ftp(cell: str) -> Tuple[Optional[str], Optional[str]]:
    if not isinstance(cell, str) or cell.strip() == "":
        return None, None
    # ENA provides either `file1;file2` or a directory path
    val = cell.strip()
    if ";" in val:
        parts = [p.strip() for p in val.split(";") if p.strip()]
        if len(parts) >= 2:
            return f"ftp://{parts[0] if not parts[0].startswith(('ftp://','http')) else parts[0]}", \
                   f"ftp://{parts[1] if not parts[1].startswith(('ftp://','http')) else parts[1]}"
        return None, None
    # directory style: e.g. ftp.sra.ebi.ac.uk/vol1/fastq/SRR.../SRR... -> construct _1/_2
    dir_path = val
    base = dir_path.rstrip("/").split("/")[-1]
    r1 = f"ftp://{dir_path}/{base}_1.fastq.gz" if not dir_path.startswith(("ftp://","http")) else f"{dir_path}/{base}_1.fastq.gz"
    r2 = f"ftp://{dir_path}/{base}_2.fastq.gz" if not dir_path.startswith(("ftp://","http")) else f"{dir_path}/{base}_2.fastq.gz"
    return r1, r2


def _load_tsv_local_or_remote(tsv_path: Optional[str], query_url: Optional[str]) -> pd.DataFrame:
    if tsv_path:
        return pd.read_csv(tsv_path, sep="\t")
    assert query_url, "Either --tsv or --query-url must be provided"
    resp = requests.get(query_url, timeout=60)
    resp.raise_for_status()
    buf = io.StringIO(resp.text)
    return pd.read_csv(buf, sep="\t")


def _apply_days_filter(df: pd.DataFrame, days: Optional[int]) -> pd.DataFrame:
    if not days or days <= 0 or "first_public" not in df.columns:
        return df
    cutoff = dt.date.today() - dt.timedelta(days=days)
    def to_date(x: str) -> Optional[dt.date]:
        try:
            return dt.date.fromisoformat(str(x)[:10])
        except Exception:
            return None
    dates = df["first_public"].map(to_date)
    mask = dates.apply(lambda d: (d is not None) and (d >= cutoff))
    return df[mask].copy()


def discover_runs(mode: str, tsv: Optional[str], query_url: Optional[str], days: Optional[int],
                  condition_default: str, out_csv: str, registry_path: str = "data/metadata/registry.parquet") -> pd.DataFrame:
    df = _load_tsv_local_or_remote(tsv if mode == "project" else None, query_url if mode == "query" else None)
    # Normalize expected columns
    rename_map = {
        "run_accession": "sample",
        "study_accession": "study",
        "fastq_ftp": "fastq_ftp",
        "library_layout": "library_layout",
        "first_public": "first_public",
    }
    df = df.rename(columns=rename_map)
    required = ["sample", "study", "fastq_ftp", "library_layout"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in input TSV: {missing}")

    df = df[df["library_layout"].str.upper() == "PAIRED"].copy()
    if days:
        df = _apply_days_filter(df, int(days))

    r1_list: List[Optional[str]] = []
    r2_list: List[Optional[str]] = []
    for x in df["fastq_ftp"].fillna(""):
        r1, r2 = _parse_fastq_ftp(x)
        r1_list.append(r1)
        r2_list.append(r2)
    df["R1"] = r1_list
    df["R2"] = r2_list
    df["condition"] = condition_default
    df = df.dropna(subset=["R1", "R2"]).copy()
    df = df[["sample", "R1", "R2", "condition", "study"]].drop_duplicates("sample")

    # De-dup using registry
    reg_file = Path(registry_path)
    if reg_file.exists():
        try:
            reg = pd.read_parquet(reg_file)
            known = set(reg.get("sample", pd.Series(dtype=str)).astype(str).tolist())
            df = df[~df["sample"].astype(str).isin(known)]
        except Exception:
            pass

    out_path = Path(out_csv)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    # Update registry by appending new entries
    if not df.empty:
        reg_new = df[["sample", "study"]].copy()
        reg_new["timestamp"] = pd.Timestamp.utcnow()
        if reg_file.exists():
            try:
                reg_old = pd.read_parquet(reg_file)
                reg_all = pd.concat([reg_old, reg_new], ignore_index=True).drop_duplicates("sample")
            except Exception:
                reg_all = reg_new
        else:
            reg_all = reg_new
        reg_file.parent.mkdir(parents=True, exist_ok=True)
        reg_all.to_parquet(reg_file, index=False)

    return df


def main() -> None:
    p = argparse.ArgumentParser(description="Discover ENA runs and write samples.csv")
    p.add_argument("--mode", required=True, choices=["project", "query"])    
    p.add_argument("--tsv")
    p.add_argument("--query-url")
    p.add_argument("--days")
    p.add_argument("--condition-default", default="unknown")
    p.add_argument("--out", required=True)
    args = p.parse_args()

    days = int(args.days) if args.days else None
    discover_runs(
        mode=args.mode,
        tsv=args.tsv,
        query_url=args.query_url,
        days=days,
        condition_default=args.condition_default,
        out_csv=args.out,
    )


if __name__ == "__main__":
    main()





