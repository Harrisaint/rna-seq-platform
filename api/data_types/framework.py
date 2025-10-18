"""
Extensible Framework for Multi-Omics Biological Data Types
Supports RNA-seq, Genomics, Proteomics, Metabolomics, and Single-Cell data
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Union
from enum import Enum
import pandas as pd
import json
from pathlib import Path
from datetime import datetime

class DataType(Enum):
    """Supported biological data types"""
    RNA_SEQ = "rna_seq"
    GENOMICS = "genomics"
    PROTEOMICS = "proteomics"
    METABOLOMICS = "metabolomics"
    SINGLE_CELL = "single_cell"
    MULTI_OMICS = "multi_omics"

class DiseaseFocus(Enum):
    """Disease categories for biological studies"""
    CANCER = "cancer"
    NEURODEGENERATIVE = "neurodegenerative"
    CARDIOVASCULAR = "cardiovascular"
    METABOLIC = "metabolic"
    AUTOIMMUNE = "autoimmune"
    INFECTIOUS = "infectious"
    DEVELOPMENTAL = "developmental"
    PSYCHIATRIC = "psychiatric"
    RESPIRATORY = "respiratory"
    GASTROINTESTINAL = "gastrointestinal"

class TissueType(Enum):
    """Tissue and organ types"""
    BRAIN = "brain"
    HEART = "heart"
    LIVER = "liver"
    PANCREAS = "pancreas"
    LUNG = "lung"
    BREAST = "breast"
    BLOOD = "blood"
    MUSCLE = "muscle"
    SKIN = "skin"
    GUT = "gut"
    KIDNEY = "kidney"
    PROSTATE = "prostate"
    OVARY = "ovary"
    BONE = "bone"
    THYROID = "thyroid"

class BaseDataProcessor(ABC):
    """Abstract base class for biological data processors"""
    
    def __init__(self, data_type: DataType):
        self.data_type = data_type
        self.metadata = {}
    
    @abstractmethod
    def validate_data(self, data: Any) -> bool:
        """Validate input data format"""
        pass
    
    @abstractmethod
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process raw data into standardized format"""
        pass
    
    @abstractmethod
    def get_analysis_types(self) -> List[str]:
        """Get available analysis types for this data type"""
        pass
    
    @abstractmethod
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run specific analysis on the data"""
        pass

class RNASeqProcessor(BaseDataProcessor):
    """Processor for RNA-seq data"""
    
    def __init__(self):
        super().__init__(DataType.RNA_SEQ)
        self.gene_annotations = {}
    
    def validate_data(self, data: Any) -> bool:
        """Validate RNA-seq data format"""
        if isinstance(data, pd.DataFrame):
            required_cols = ['sample', 'condition']
            return all(col in data.columns for col in required_cols)
        return False
    
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process RNA-seq data"""
        if not self.validate_data(data):
            raise ValueError("Invalid RNA-seq data format")
        
        processed = {
            'data_type': self.data_type.value,
            'samples': data.to_dict('records'),
            'sample_count': len(data),
            'conditions': data['condition'].unique().tolist(),
            'processed_at': datetime.now().isoformat()
        }
        
        return processed
    
    def get_analysis_types(self) -> List[str]:
        """Get available RNA-seq analysis types"""
        return [
            'differential_expression',
            'pathway_enrichment',
            'pca_analysis',
            'heatmap_clustering',
            'quality_control'
        ]
    
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run RNA-seq analysis"""
        if analysis_type not in self.get_analysis_types():
            raise ValueError(f"Unknown analysis type: {analysis_type}")
        
        # Mock analysis results - in real implementation, these would call actual analysis tools
        if analysis_type == 'differential_expression':
            return self._run_differential_expression(data)
        elif analysis_type == 'pathway_enrichment':
            return self._run_pathway_enrichment(data)
        elif analysis_type == 'pca_analysis':
            return self._run_pca_analysis(data)
        elif analysis_type == 'heatmap_clustering':
            return self._run_heatmap_clustering(data)
        elif analysis_type == 'quality_control':
            return self._run_quality_control(data)
    
    def _run_differential_expression(self, data: Any) -> Dict[str, Any]:
        """Mock differential expression analysis"""
        return {
            'analysis_type': 'differential_expression',
            'results': [
                {'gene': 'GENE1', 'log2fc': 2.5, 'padj': 0.001},
                {'gene': 'GENE2', 'log2fc': -1.8, 'padj': 0.01},
                {'gene': 'GENE3', 'log2fc': 3.2, 'padj': 0.0001}
            ],
            'parameters': {'method': 'DESeq2', 'threshold': 0.05}
        }
    
    def _run_pathway_enrichment(self, data: Any) -> Dict[str, Any]:
        """Mock pathway enrichment analysis"""
        return {
            'analysis_type': 'pathway_enrichment',
            'results': [
                {'pathway': 'KEGG_00010', 'name': 'Glycolysis', 'pvalue': 0.001, 'genes': 15},
                {'pathway': 'KEGG_04010', 'name': 'MAPK signaling', 'pvalue': 0.01, 'genes': 25}
            ],
            'parameters': {'method': 'GSEA', 'gene_sets': 'KEGG'}
        }
    
    def _run_pca_analysis(self, data: Any) -> Dict[str, Any]:
        """Mock PCA analysis"""
        return {
            'analysis_type': 'pca_analysis',
            'results': {
                'scores': [
                    {'sample': 'S1', 'PC1': 0.5, 'PC2': -0.3},
                    {'sample': 'S2', 'PC1': -0.2, 'PC2': 0.8}
                ],
                'variance': {'PC1': 0.6, 'PC2': 0.3}
            }
        }
    
    def _run_heatmap_clustering(self, data: Any) -> Dict[str, Any]:
        """Mock heatmap clustering"""
        return {
            'analysis_type': 'heatmap_clustering',
            'results': {
                'rows': ['GENE1', 'GENE2', 'GENE3'],
                'cols': ['S1', 'S2', 'S3'],
                'values': [[1.2, 0.8, 1.5], [0.5, 1.1, 0.9], [1.8, 0.3, 1.2]]
            }
        }
    
    def _run_quality_control(self, data: Any) -> Dict[str, Any]:
        """Mock quality control analysis"""
        return {
            'analysis_type': 'quality_control',
            'results': {
                'total_reads': 50000000,
                'mapped_reads': 45000000,
                'mapping_rate': 0.9,
                'duplication_rate': 0.15
            }
        }

class GenomicsProcessor(BaseDataProcessor):
    """Processor for genomics data (WGS, Exome, ChIP-seq, ATAC-seq)"""
    
    def __init__(self):
        super().__init__(DataType.GENOMICS)
    
    def validate_data(self, data: Any) -> bool:
        """Validate genomics data format"""
        if isinstance(data, pd.DataFrame):
            # Different genomics data types have different requirements
            return True  # Simplified for now
        return False
    
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process genomics data"""
        processed = {
            'data_type': self.data_type.value,
            'samples': data.to_dict('records'),
            'sample_count': len(data),
            'processed_at': datetime.now().isoformat()
        }
        return processed
    
    def get_analysis_types(self) -> List[str]:
        """Get available genomics analysis types"""
        return [
            'variant_calling',
            'peak_calling',
            'motif_analysis',
            'chromatin_accessibility',
            'copy_number_variation'
        ]
    
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run genomics analysis"""
        if analysis_type == 'variant_calling':
            return {
                'analysis_type': 'variant_calling',
                'results': [
                    {'chromosome': 'chr1', 'position': 12345, 'ref': 'A', 'alt': 'T', 'quality': 50},
                    {'chromosome': 'chr2', 'position': 67890, 'ref': 'G', 'alt': 'C', 'quality': 45}
                ]
            }
        # Add other analysis types as needed
        return {'analysis_type': analysis_type, 'results': []}

class ProteomicsProcessor(BaseDataProcessor):
    """Processor for proteomics data"""
    
    def __init__(self):
        super().__init__(DataType.PROTEOMICS)
    
    def validate_data(self, data: Any) -> bool:
        """Validate proteomics data format"""
        return isinstance(data, pd.DataFrame)
    
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process proteomics data"""
        processed = {
            'data_type': self.data_type.value,
            'samples': data.to_dict('records'),
            'sample_count': len(data),
            'processed_at': datetime.now().isoformat()
        }
        return processed
    
    def get_analysis_types(self) -> List[str]:
        """Get available proteomics analysis types"""
        return [
            'protein_quantification',
            'protein_protein_interaction',
            'post_translational_modification',
            'protein_pathway_analysis'
        ]
    
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run proteomics analysis"""
        if analysis_type == 'protein_quantification':
            return {
                'analysis_type': 'protein_quantification',
                'results': [
                    {'protein': 'PROTEIN1', 'abundance': 1500, 'fold_change': 2.5},
                    {'protein': 'PROTEIN2', 'abundance': 800, 'fold_change': 0.4}
                ]
            }
        return {'analysis_type': analysis_type, 'results': []}

class MetabolomicsProcessor(BaseDataProcessor):
    """Processor for metabolomics data"""
    
    def __init__(self):
        super().__init__(DataType.METABOLOMICS)
    
    def validate_data(self, data: Any) -> bool:
        """Validate metabolomics data format"""
        return isinstance(data, pd.DataFrame)
    
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process metabolomics data"""
        processed = {
            'data_type': self.data_type.value,
            'samples': data.to_dict('records'),
            'sample_count': len(data),
            'processed_at': datetime.now().isoformat()
        }
        return processed
    
    def get_analysis_types(self) -> List[str]:
        """Get available metabolomics analysis types"""
        return [
            'metabolite_profiling',
            'metabolic_pathway_analysis',
            'lipidomics_analysis',
            'metabolite_identification'
        ]
    
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run metabolomics analysis"""
        if analysis_type == 'metabolite_profiling':
            return {
                'analysis_type': 'metabolite_profiling',
                'results': [
                    {'metabolite': 'GLUCOSE', 'concentration': 5.5, 'unit': 'mM'},
                    {'metabolite': 'LACTATE', 'concentration': 1.2, 'unit': 'mM'}
                ]
            }
        return {'analysis_type': analysis_type, 'results': []}

class SingleCellProcessor(BaseDataProcessor):
    """Processor for single-cell data"""
    
    def __init__(self):
        super().__init__(DataType.SINGLE_CELL)
    
    def validate_data(self, data: Any) -> bool:
        """Validate single-cell data format"""
        return isinstance(data, pd.DataFrame)
    
    def process_data(self, data: Any) -> Dict[str, Any]:
        """Process single-cell data"""
        processed = {
            'data_type': self.data_type.value,
            'samples': data.to_dict('records'),
            'sample_count': len(data),
            'processed_at': datetime.now().isoformat()
        }
        return processed
    
    def get_analysis_types(self) -> List[str]:
        """Get available single-cell analysis types"""
        return [
            'cell_type_annotation',
            'trajectory_analysis',
            'differential_expression',
            'cell_cell_interaction',
            'spatial_analysis'
        ]
    
    def run_analysis(self, analysis_type: str, data: Any) -> Dict[str, Any]:
        """Run single-cell analysis"""
        if analysis_type == 'cell_type_annotation':
            return {
                'analysis_type': 'cell_type_annotation',
                'results': [
                    {'cell_id': 'CELL1', 'cell_type': 'T_cell', 'confidence': 0.95},
                    {'cell_id': 'CELL2', 'cell_type': 'B_cell', 'confidence': 0.88}
                ]
            }
        return {'analysis_type': analysis_type, 'results': []}

class DataProcessorFactory:
    """Factory for creating data processors"""
    
    _processors = {
        DataType.RNA_SEQ: RNASeqProcessor,
        DataType.GENOMICS: GenomicsProcessor,
        DataType.PROTEOMICS: ProteomicsProcessor,
        DataType.METABOLOMICS: MetabolomicsProcessor,
        DataType.SINGLE_CELL: SingleCellProcessor
    }
    
    @classmethod
    def create_processor(cls, data_type: DataType) -> BaseDataProcessor:
        """Create a processor for the specified data type"""
        if data_type not in cls._processors:
            raise ValueError(f"Unsupported data type: {data_type}")
        
        processor_class = cls._processors[data_type]
        return processor_class()
    
    @classmethod
    def get_supported_types(cls) -> List[DataType]:
        """Get list of supported data types"""
        return list(cls._processors.keys())

class MultiOmicsIntegrator:
    """Integrates multiple omics data types for cross-omics analysis"""
    
    def __init__(self):
        self.data_processors = {}
        self.integrated_data = {}
    
    def add_data(self, data_type: DataType, data: Any) -> None:
        """Add data of a specific type"""
        processor = DataProcessorFactory.create_processor(data_type)
        processed_data = processor.process_data(data)
        
        self.data_processors[data_type] = processor
        self.integrated_data[data_type] = processed_data
    
    def get_cross_omics_analyses(self) -> List[str]:
        """Get available cross-omics analysis types"""
        return [
            'multi_omics_correlation',
            'pathway_integration',
            'biomarker_discovery',
            'disease_subtyping',
            'drug_response_prediction'
        ]
    
    def run_cross_omics_analysis(self, analysis_type: str) -> Dict[str, Any]:
        """Run cross-omics analysis"""
        if analysis_type not in self.get_cross_omics_analyses():
            raise ValueError(f"Unknown cross-omics analysis: {analysis_type}")
        
        # Mock cross-omics analysis
        if analysis_type == 'multi_omics_correlation':
            return {
                'analysis_type': 'multi_omics_correlation',
                'results': {
                    'rna_protein_correlation': 0.75,
                    'protein_metabolite_correlation': 0.65,
                    'rna_metabolite_correlation': 0.58
                }
            }
        
        return {'analysis_type': analysis_type, 'results': {}}

# Example usage
if __name__ == "__main__":
    # Create sample RNA-seq data
    rna_data = pd.DataFrame({
        'sample': ['S1', 'S2', 'S3'],
        'condition': ['disease', 'control', 'disease'],
        'tissue': ['pancreas', 'pancreas', 'pancreas']
    })
    
    # Process RNA-seq data
    rna_processor = DataProcessorFactory.create_processor(DataType.RNA_SEQ)
    processed_rna = rna_processor.process_data(rna_data)
    print(f"Processed RNA-seq data: {processed_rna}")
    
    # Run differential expression analysis
    de_results = rna_processor.run_analysis('differential_expression', rna_data)
    print(f"Differential expression results: {de_results}")
    
    # Create multi-omics integrator
    integrator = MultiOmicsIntegrator()
    integrator.add_data(DataType.RNA_SEQ, rna_data)
    
    # Run cross-omics analysis
    cross_omics_results = integrator.run_cross_omics_analysis('multi_omics_correlation')
    print(f"Cross-omics results: {cross_omics_results}")
