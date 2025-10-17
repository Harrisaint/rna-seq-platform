import React from 'react'
import { Container, Typography, Box, Alert } from '@mui/material'
import AnalysisLayout from '../components/AnalysisLayout'
import GSEATable from '../components/GSEATable'
import { Api } from '../components/apiClient'

interface GSEAProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  title: string
}

const GSEA: React.FC<GSEAProps> = ({ mode, onModeChange, title }) => {
  const [gseaData, setGseaData] = React.useState<{ results: any[]; gene_sets: string[] } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => { 
    setLoading(true)
    setError(null)
    Api.gsea(mode)
      .then(setGseaData)
      .catch((err) => {
        setError(err.message)
        setGseaData(null)
      })
      .finally(() => setLoading(false))
  }, [mode])
  
  const getStatus = (): 'ready' | 'processing' | 'error' | 'no-data' => {
    if (error) return 'error'
    if (loading) return 'processing'
    if (!gseaData || gseaData.results.length === 0) return 'no-data'
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
          Gene Set Enrichment Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {mode === 'demo' 
            ? 'Pathway enrichment analysis of curated bioproject PRJNA397172 identifying biological processes and pathways significantly associated with the observed gene expression changes.'
            : 'Real-time pathway enrichment analysis of newly discovered samples identifying biological processes and molecular pathways.'
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">GSEA Error: {error}</Typography>
          <Typography variant="body2">Unable to load pathway enrichment data</Typography>
        </Alert>
      )}

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">Loading pathway enrichment analysis...</Typography>
        </Alert>
      )}

      {gseaData && gseaData.results.length > 0 && (
        <GSEATable 
          results={gseaData.results} 
          geneSets={gseaData.gene_sets}
        />
      )}

      {!gseaData && !loading && !error && (
        <Alert severity="info">
          <Typography variant="body2">
            No GSEA data available yet. {mode === 'demo' 
              ? 'Demo data needs to be processed first.' 
              : 'Live discovery will populate pathway data as new samples are processed.'
            }
          </Typography>
        </Alert>
      )}

      {mode === 'demo' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#90caf9', borderRadius: 1, color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Demo Pathway Analysis
          </Typography>
          <Typography variant="body2" paragraph>
            Gene Set Enrichment Analysis of the curated PRJNA397172 dataset reveals 
            key biological pathways associated with the normal vs. tumor comparison, 
            providing insights into the molecular mechanisms underlying the observed 
            gene expression differences.
          </Typography>
        </Box>
      )}

      {mode === 'live' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'secondary.light', borderRadius: 1, opacity: 0.1 }}>
          <Typography variant="h6" gutterBottom>
            Live Pathway Discovery
          </Typography>
          <Typography variant="body2" paragraph>
            Continuous pathway enrichment analysis of newly discovered samples enables 
            real-time identification of biological processes and molecular pathways 
            associated with pancreas RNA-seq data from the European Nucleotide Archive.
          </Typography>
        </Box>
      )}
    </AnalysisLayout>
  )
}

export default GSEA
