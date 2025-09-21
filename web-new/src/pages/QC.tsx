import React from 'react'
import { Typography, Box, Alert } from '@mui/material'
import AnalysisLayout from '../components/AnalysisLayout'
import { Api } from '../components/apiClient'

interface QCProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  title: string
}

const QC: React.FC<QCProps> = ({ mode, onModeChange, title }) => {
  const [qc, setQc] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => { 
    setLoading(true)
    setError(null)
    Api.qc(mode)
      .then(setQc)
      .catch((err) => {
        setError(err.message)
        setQc(null)
      })
      .finally(() => setLoading(false))
  }, [mode])
  
  const getStatus = (): 'ready' | 'processing' | 'error' | 'no-data' => {
    if (error) return 'error'
    if (loading) return 'processing'
    if (!qc) return 'no-data'
    return 'ready'
  }

  const getLastUpdated = (): string => {
    if (mode === 'demo') {
      return 'Static dataset - no updates'
    }
    return new Date().toLocaleString()
  }

  return (
    <AnalysisLayout 
      mode={mode} 
      onModeChange={onModeChange} 
      title={title}
      status={getStatus()}
      lastUpdated={getLastUpdated()}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quality Control Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {mode === 'demo' 
            ? 'Comprehensive QC analysis of curated bioproject PRJNA397172 samples with known quality metrics.'
            : 'Real-time QC monitoring of newly discovered samples with automated quality assessment.'
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">QC Data Error: {error}</Typography>
          <Typography variant="body2">Unable to load quality control data</Typography>
        </Alert>
      )}

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">Loading quality control data...</Typography>
        </Alert>
      )}

      {qc && (
        <Box>
          <Typography variant="h6" gutterBottom>
            QC Report Summary
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1, 
            border: 1, 
            borderColor: 'divider',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {JSON.stringify(qc?.report_general_stats_data || qc, null, 2)}
            </pre>
          </Box>
        </Box>
      )}

      {!qc && !loading && !error && (
        <Alert severity="info">
          <Typography variant="body2">
            No QC data available yet. {mode === 'demo' 
              ? 'Demo data needs to be processed first.' 
              : 'Live discovery will populate QC data as new samples are processed.'
            }
          </Typography>
        </Alert>
      )}

      {mode === 'demo' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1, opacity: 0.1 }}>
          <Typography variant="h6" gutterBottom>
            Demo QC Analysis
          </Typography>
          <Typography variant="body2" paragraph>
            Quality control metrics from the curated PRJNA397172 dataset provide baseline 
            expectations for RNA-seq data quality and help establish quality thresholds 
            for the live discovery stream.
          </Typography>
        </Box>
      )}

      {mode === 'live' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'secondary.light', borderRadius: 1, opacity: 0.1 }}>
          <Typography variant="h6" gutterBottom>
            Live QC Monitoring
          </Typography>
          <Typography variant="body2" paragraph>
            Continuous quality assessment of newly discovered samples ensures data integrity 
            and identifies potential issues in real-time as new pancreas RNA-seq data is 
            processed from the European Nucleotide Archive.
          </Typography>
        </Box>
      )}
    </AnalysisLayout>
  )
}

export default QC


