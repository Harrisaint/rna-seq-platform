"""
Enhanced API endpoints for Multi-Omics Biological Discovery Platform
Supports RNA-seq, Genomics, Proteomics, Metabolomics, and Single-Cell data
"""
from __future__ import annotations
from typing import List, Optional, Dict, Any
import os
import json
from pathlib import Path

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import schemas
from .utils import load_samples, load_multiqc, load_de, load_pca, load_heatmap, load_gsea, list_files_under, safe_path
from .live_discovery import discovery_service
from .multi_omics_discovery import MultiOmicsDiscoveryService
from data_types.framework import DataType, DiseaseFocus, TissueType, DataProcessorFactory
from database.manager import DatabaseManager

# Create router for multi-omics endpoints
router = APIRouter()

# Initialize enhanced discovery service
multi_omics_discovery = MultiOmicsDiscoveryService()
db_manager = DatabaseManager()

# Enhanced schemas for multi-omics data
class MultiOmicsStudy(BaseModel):
    study_id: str
    title: str
    description: Optional[str] = None
    data_type: str
    disease_focus: str
    tissue_type: Optional[str] = None
    sample_count: int
    created_at: str

class MultiOmicsSample(BaseModel):
    sample_id: str
    study_id: str
    condition: str
    tissue: Optional[str] = None
    organ: Optional[str] = None
    data_type: str
    disease_focus: str
    metadata: Optional[Dict[str, Any]] = None

class DiscoveryRequest(BaseModel):
    data_type: str
    disease_focus: str
    tissue_type: Optional[str] = None
    days_back: int = 30
    max_samples: int = 100

class AnalysisRequest(BaseModel):
    study_id: str
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = None

class CrossOmicsRequest(BaseModel):
    study_ids: List[str]
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = None

# Multi-omics API endpoints
@router.get("/multi-omics/studies", response_model=List[MultiOmicsStudy])
def get_multi_omics_studies(
    data_type: Optional[str] = Query(None, description="Filter by data type"),
    disease_focus: Optional[str] = Query(None, description="Filter by disease focus"),
    tissue_type: Optional[str] = Query(None, description="Filter by tissue type")
) -> List[MultiOmicsStudy]:
    """Get studies across all data types with optional filtering"""
    try:
        studies = db_manager.get_studies(data_type=data_type, disease_focus=disease_focus)
        
        # Convert to MultiOmicsStudy format
        multi_omics_studies = []
        for study in studies:
            multi_omics_studies.append(MultiOmicsStudy(
                study_id=study['study_id'],
                title=study['title'],
                description=study.get('description', ''),
                data_type=study['data_type'],
                disease_focus=study['disease_focus'],
                tissue_type=study['tissue_type'],
                sample_count=study['actual_samples'],
                created_at=study['created_at']
            ))
        
        return multi_omics_studies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving studies: {str(e)}")

@router.get("/multi-omics/samples", response_model=List[MultiOmicsSample])
def get_multi_omics_samples(
    study_id: Optional[str] = Query(None, description="Filter by study ID"),
    data_type: Optional[str] = Query(None, description="Filter by data type"),
    disease_focus: Optional[str] = Query(None, description="Filter by disease focus")
) -> List[MultiOmicsSample]:
    """Get samples across all data types with optional filtering"""
    try:
        samples = db_manager.get_samples(study_id=study_id, data_type=data_type)
        
        # Convert to MultiOmicsSample format
        multi_omics_samples = []
        for sample in samples:
            multi_omics_samples.append(MultiOmicsSample(
                sample_id=sample['sample_id'],
                study_id=sample['study_id'],
                condition=sample['condition'],
                tissue=sample['tissue'],
                organ=sample['organ'],
                data_type=sample['data_type'],
                disease_focus=sample['disease_focus'],
                metadata=sample.get('metadata', {})
            ))
        
        return multi_omics_samples
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving samples: {str(e)}")

@router.post("/multi-omics/discovery/trigger")
def trigger_multi_omics_discovery(request: DiscoveryRequest):
    """Trigger discovery for specific data type and disease focus"""
    try:
        # For now, return a simple response without complex database operations
        # This will help us test the endpoint without database issues
        
        return {
            "message": f"Discovery triggered for {request.data_type} {request.disease_focus}",
            "samples_found": 0,
            "study_id": None,
            "status": "success",
            "note": "Discovery endpoint is working - database integration in progress"
        }
        
    except Exception as e:
        print(f"Discovery trigger error: {str(e)}")
        return {
            "message": f"Discovery error: {str(e)}",
            "samples_found": 0,
            "study_id": None,
            "status": "error"
        }

@router.post("/multi-omics/discovery/comprehensive")
def trigger_comprehensive_discovery(
    disease_focus: str = Query(..., description="Disease focus for comprehensive discovery"),
    tissue_type: Optional[str] = Query(None, description="Optional tissue type filter"),
    days_back: int = Query(30, description="Days back to search")
):
    """Trigger comprehensive discovery across all data types for a disease focus"""
    try:
        disease_focus_enum = DiseaseFocus(disease_focus)
        tissue_type_enum = TissueType(tissue_type) if tissue_type else None
        
        # Discover all data types
        results = multi_omics_discovery.discover_all_data_types(
            disease_focus=disease_focus_enum,
            tissue_type=tissue_type_enum,
            days_back=days_back
        )
        
        # Save all discovered data
        total_samples = 0
        studies_created = []
        
        for data_type_str, samples in results.items():
            if samples:
                data_type = DataType(data_type_str)
                study_id = f"{data_type_str}_{disease_focus}_{len(samples)}"
                
                # Create study
                study_data = {
                    'study_id': study_id,
                    'title': f"{disease_focus.title()} {data_type_str.title()} Comprehensive Study",
                    'description': f"Comprehensive discovery of {len(samples)} samples",
                    'data_type': data_type_str,
                    'disease_focus': disease_focus,
                    'tissue_type': tissue_type or 'unknown',
                    'sample_count': len(samples)
                }
                
                db_manager.add_study(study_data)
                studies_created.append(study_id)
                
                # Add samples
                for sample in samples:
                    sample_data = {
                        'sample_id': sample['sample'],
                        'study_id': study_id,
                        'condition': sample['condition'],
                        'tissue': sample['tissue'],
                        'organ': sample['organ'],
                        'metadata': sample
                    }
                    db_manager.add_sample(sample_data)
                
                total_samples += len(samples)
        
        return {
            "message": f"Comprehensive discovery completed for {disease_focus}",
            "data_types_discovered": list(results.keys()),
            "total_samples": total_samples,
            "studies_created": studies_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive discovery error: {str(e)}")

@router.post("/multi-omics/analysis/{study_id}")
def run_multi_omics_analysis(study_id: str, request: AnalysisRequest):
    """Run analysis on a specific study"""
    try:
        # Get study information
        studies = db_manager.get_studies()
        study = next((s for s in studies if s['study_id'] == study_id), None)
        
        if not study:
            raise HTTPException(status_code=404, detail="Study not found")
        
        # Get samples for the study
        samples = db_manager.get_samples(study_id=study_id)
        
        if not samples:
            raise HTTPException(status_code=404, detail="No samples found for study")
        
        # Create data processor
        data_type = DataType(study['data_type'])
        processor = DataProcessorFactory.create_processor(data_type)
        
        # Convert samples to DataFrame for processing
        import pandas as pd
        df = pd.DataFrame(samples)
        
        # Run analysis
        analysis_result = processor.run_analysis(request.analysis_type, df)
        
        # Save analysis results
        result_data = {
            'study_id': study_id,
            'analysis_type': request.analysis_type,
            'result_type': 'analysis_results',
            'result_data': analysis_result,
            'parameters': request.parameters or {}
        }
        
        db_manager.add_analysis_result(result_data)
        
        return {
            "message": f"Analysis completed for study {study_id}",
            "analysis_type": request.analysis_type,
            "results": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/multi-omics/cross-omics-analysis")
def run_cross_omics_analysis(request: CrossOmicsRequest):
    """Run cross-omics analysis across multiple studies"""
    try:
        from data_types.framework import MultiOmicsIntegrator
        
        # Get studies
        studies = db_manager.get_studies()
        selected_studies = [s for s in studies if s['study_id'] in request.study_ids]
        
        if not selected_studies:
            raise HTTPException(status_code=404, detail="No studies found")
        
        # Create multi-omics integrator
        integrator = MultiOmicsIntegrator()
        
        # Add data from each study
        for study in selected_studies:
            samples = db_manager.get_samples(study_id=study['study_id'])
            if samples:
                data_type = DataType(study['data_type'])
                import pandas as pd
                df = pd.DataFrame(samples)
                integrator.add_data(data_type, df)
        
        # Run cross-omics analysis
        cross_omics_result = integrator.run_cross_omics_analysis(request.analysis_type)
        
        return {
            "message": f"Cross-omics analysis completed",
            "analysis_type": request.analysis_type,
            "studies_analyzed": request.study_ids,
            "results": cross_omics_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cross-omics analysis error: {str(e)}")

@router.get("/multi-omics/discovery/statistics")
def get_discovery_statistics():
    """Get comprehensive discovery statistics"""
    try:
        stats = multi_omics_discovery.get_discovery_statistics()
        db_stats = db_manager.get_discovery_stats()
        
        # Combine statistics
        combined_stats = {
            **stats,
            'database_stats': db_stats,
            'supported_data_types': [dt.value for dt in DataType],
            'supported_diseases': [df.value for df in DiseaseFocus],
            'supported_tissues': [tt.value for tt in TissueType]
        }
        
        return combined_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics error: {str(e)}")

@router.get("/multi-omics/data-types")
def get_supported_data_types():
    """Get list of supported data types and their capabilities"""
    try:
        data_types_info = {}
        
        for data_type in DataType:
            if data_type == DataType.MULTI_OMICS:
                continue
            
            processor = DataProcessorFactory.create_processor(data_type)
            data_types_info[data_type.value] = {
                'name': data_type.value.replace('_', ' ').title(),
                'description': f"{data_type.value.replace('_', ' ')} data analysis",
                'analysis_types': processor.get_analysis_types(),
                'supported_formats': ['CSV', 'TSV', 'JSON']
            }
        
        return {
            'data_types': data_types_info,
            'cross_omics_analyses': [
                'multi_omics_correlation',
                'pathway_integration',
                'biomarker_discovery',
                'disease_subtyping',
                'drug_response_prediction'
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data types info error: {str(e)}")

@router.get("/multi-omics/analysis-results/{study_id}")
def get_analysis_results(
    study_id: str,
    analysis_type: Optional[str] = Query(None, description="Filter by analysis type")
):
    """Get analysis results for a specific study"""
    try:
        results = db_manager.get_analysis_results(study_id, analysis_type)
        return {
            'study_id': study_id,
            'analysis_type': analysis_type,
            'results': results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis results error: {str(e)}")

@router.get("/multi-omics/health")
def health_check():
    """Health check endpoint for multi-omics services"""
    try:
        # Check database connection
        db_stats = db_manager.get_discovery_stats()
        
        # Check discovery service
        discovery_status = multi_omics_discovery.get_discovery_status()
        
        return {
            'status': 'healthy',
            'database': 'connected',
            'discovery_service': discovery_status['running'],
            'last_discovery': discovery_status['last_discovery'],
            'total_studies': db_stats['total_studies'],
            'total_samples': db_stats['total_samples']
        }
        
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

# Legacy endpoints for backward compatibility
@router.get("/runs", response_model=List[schemas.Run])
def get_runs(mode: str = Query("demo", description="Data mode: 'demo' for curated bioproject, 'live' for continuous discovery")) -> List[schemas.Run]:
    """Legacy endpoint - redirects to multi-omics samples"""
    if mode == "demo":
        # Return demo data
        df = load_samples(mode=mode)
        return [schemas.Run(sample=r.sample, study=getattr(r, 'study', None), condition=getattr(r, 'condition', None)) for r in df.itertuples(index=False)]
    else:
        # Return live data from database
        samples = db_manager.get_samples()
        return [schemas.Run(sample=s['sample_id'], study=s['study_id'], condition=s['condition']) for s in samples[:50]]  # Limit to 50 for performance

# CORS is handled by the main app
