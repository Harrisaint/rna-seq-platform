"""
Database initialization and management for Multi-Omics Biological Discovery Platform
"""
import sqlite3
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path: str = "data/platform.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize the database with schema"""
        schema_path = Path(__file__).parent / "schema.sql"
        
        with sqlite3.connect(self.db_path) as conn:
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
            conn.executescript(schema_sql)
            conn.commit()
    
    def add_study(self, study_data: Dict[str, Any]) -> int:
        """Add a new study to the database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Convert metadata to JSON string if it's a dict
            metadata = study_data.get('metadata', {})
            if isinstance(metadata, dict):
                metadata = json.dumps(metadata)
            
            cursor.execute("""
                INSERT INTO studies (
                    study_id, title, description, data_type, disease_focus, 
                    tissue_type, experimental_condition, organism, publication_date, 
                    sample_count, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                study_data['study_id'],
                study_data['title'],
                study_data.get('description', ''),
                study_data['data_type'],
                study_data.get('disease_focus', ''),
                study_data.get('tissue_type', ''),
                study_data.get('experimental_condition', ''),
                study_data.get('organism', 'Homo sapiens'),
                study_data.get('publication_date', ''),
                study_data.get('sample_count', 0),
                metadata
            ))
            
            return cursor.lastrowid
    
    def add_sample(self, sample_data: Dict[str, Any]) -> int:
        """Add a new sample to the database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Convert metadata to JSON string if it's a dict
            metadata = sample_data.get('metadata', {})
            if isinstance(metadata, dict):
                metadata = json.dumps(metadata)
            
            cursor.execute("""
                INSERT INTO samples (
                    sample_id, study_id, condition, tissue, organ, cell_type,
                    age_group, gender, ethnicity, disease_stage, treatment_status, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sample_data['sample_id'],
                sample_data['study_id'],
                sample_data['condition'],
                sample_data.get('tissue', ''),
                sample_data.get('organ', ''),
                sample_data.get('cell_type', ''),
                sample_data.get('age_group', ''),
                sample_data.get('gender', ''),
                sample_data.get('ethnicity', ''),
                sample_data.get('disease_stage', ''),
                sample_data.get('treatment_status', ''),
                metadata
            ))
            
            return cursor.lastrowid
    
    def add_data_file(self, file_data: Dict[str, Any]) -> int:
        """Add a data file record"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO data_files (
                    sample_id, file_type, file_path, file_format, file_size, checksum
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                file_data['sample_id'],
                file_data['file_type'],
                file_data['file_path'],
                file_data.get('file_format', ''),
                file_data.get('file_size', 0),
                file_data.get('checksum', '')
            ))
            
            return cursor.lastrowid
    
    def add_analysis_result(self, result_data: Dict[str, Any]) -> int:
        """Add analysis results"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Convert data to JSON string
            result_json = json.dumps(result_data['result_data'])
            parameters_json = json.dumps(result_data.get('parameters', {}))
            
            cursor.execute("""
                INSERT INTO analysis_results (
                    study_id, analysis_type, result_type, result_data, parameters
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                result_data['study_id'],
                result_data['analysis_type'],
                result_data['result_type'],
                result_json,
                parameters_json
            ))
            
            return cursor.lastrowid
    
    def log_discovery(self, discovery_data: Dict[str, Any]) -> int:
        """Log a discovery activity"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO discovery_log (
                    data_type, disease_focus, tissue_type, api_source, query_used,
                    samples_found, samples_processed, api_status, error_message, processing_time_seconds
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                discovery_data['data_type'],
                discovery_data.get('disease_focus', ''),
                discovery_data.get('tissue_type', ''),
                discovery_data.get('api_source', ''),
                discovery_data.get('query_used', ''),
                discovery_data.get('samples_found', 0),
                discovery_data.get('samples_processed', 0),
                discovery_data.get('api_status', 'success'),
                discovery_data.get('error_message', ''),
                discovery_data.get('processing_time_seconds', 0)
            ))
            
            return cursor.lastrowid
    
    def get_studies(self, data_type: Optional[str] = None, disease_focus: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get studies with optional filtering"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM study_summary"
            params = []
            
            conditions = []
            if data_type:
                conditions.append("data_type = ?")
                params.append(data_type)
            if disease_focus:
                conditions.append("disease_focus = ?")
                params.append(disease_focus)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_samples(self, study_id: Optional[str] = None, data_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get samples with optional filtering"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM sample_details"
            params = []
            
            conditions = []
            if study_id:
                conditions.append("study_id = ?")
                params.append(study_id)
            if data_type:
                conditions.append("data_type = ?")
                params.append(data_type)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_analysis_results(self, study_id: str, analysis_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get analysis results for a study"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM analysis_results WHERE study_id = ?"
            params = [study_id]
            
            if analysis_type:
                query += " AND analysis_type = ?"
                params.append(analysis_type)
            
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params)
            results = []
            for row in cursor.fetchall():
                result = dict(row)
                # Parse JSON fields
                result['result_data'] = json.loads(result['result_data'])
                result['parameters'] = json.loads(result['parameters'])
                results.append(result)
            
            return results
    
    def get_discovery_stats(self, days_back: int = 30) -> Dict[str, Any]:
        """Get discovery statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get discovery counts by data type
            cursor.execute("""
                SELECT data_type, COUNT(*) as count, SUM(samples_found) as total_samples
                FROM discovery_log 
                WHERE discovery_date >= datetime('now', '-{} days')
                GROUP BY data_type
            """.format(days_back))
            
            discovery_stats = {}
            for row in cursor.fetchall():
                discovery_stats[row[0]] = {
                    'discoveries': row[1],
                    'total_samples': row[2] or 0
                }
            
            # Get total studies and samples
            cursor.execute("SELECT COUNT(*) FROM studies")
            total_studies = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM samples")
            total_samples = cursor.fetchone()[0]
            
            return {
                'total_studies': total_studies,
                'total_samples': total_samples,
                'discovery_stats': discovery_stats,
                'period_days': days_back
            }
    
    def migrate_from_csv(self, csv_file: str, data_type: str = 'rna_seq'):
        """Migrate existing CSV data to database"""
        csv_path = Path(csv_file)
        if not csv_path.exists():
            print(f"CSV file not found: {csv_file}")
            return
        
        df = pd.read_csv(csv_path)
        
        # Create a study entry
        study_id = f"migrated_{data_type}_{csv_path.stem}"
        study_data = {
            'study_id': study_id,
            'title': f"Migrated {data_type} study from {csv_path.name}",
            'description': f"Data migrated from CSV file: {csv_path.name}",
            'data_type': data_type,
            'disease_focus': 'unknown',
            'tissue_type': 'unknown',
            'experimental_condition': 'unknown',
            'sample_count': len(df)
        }
        
        study_db_id = self.add_study(study_data)
        
        # Add samples
        for _, row in df.iterrows():
            sample_data = {
                'sample_id': row.get('sample', f"sample_{row.name}"),
                'study_id': study_id,
                'condition': row.get('condition', 'unknown'),
                'tissue': row.get('tissue', ''),
                'organ': row.get('organ', ''),
                'metadata': row.to_dict()
            }
            self.add_sample(sample_data)
        
        print(f"Migrated {len(df)} samples from {csv_file} to study {study_id}")

# Example usage and testing
if __name__ == "__main__":
    # Initialize database
    db = DatabaseManager("data/test_platform.db")
    
    # Add a test study
    study_data = {
        'study_id': 'TEST_STUDY_001',
        'title': 'Test Multi-Omics Study',
        'description': 'A test study for multi-omics data',
        'data_type': 'multi_omics',
        'disease_focus': 'cancer',
        'tissue_type': 'pancreas',
        'experimental_condition': 'disease_vs_control',
        'sample_count': 10
    }
    
    study_id = db.add_study(study_data)
    print(f"Added study with ID: {study_id}")
    
    # Add test samples
    for i in range(5):
        sample_data = {
            'sample_id': f'TEST_SAMPLE_{i:03d}',
            'study_id': 'TEST_STUDY_001',
            'condition': 'disease' if i < 3 else 'control',
            'tissue': 'pancreas',
            'organ': 'pancreas',
            'age_group': 'adult',
            'gender': 'mixed'
        }
        sample_id = db.add_sample(sample_data)
        print(f"Added sample with ID: {sample_id}")
    
    # Test queries
    studies = db.get_studies()
    print(f"Found {len(studies)} studies")
    
    samples = db.get_samples(study_id='TEST_STUDY_001')
    print(f"Found {len(samples)} samples for TEST_STUDY_001")
    
    stats = db.get_discovery_stats()
    print(f"Discovery stats: {stats}")
