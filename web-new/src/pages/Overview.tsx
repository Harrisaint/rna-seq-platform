import React from 'react'
import { Grid, Typography, Box, Alert } from '@mui/material'
import StatCard from '../components/StatCard'
import AnalysisLayout from '../components/AnalysisLayout'
import { Api } from '../components/apiClient'

interface OverviewProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  title: string
}

const Overview: React.FC<OverviewProps> = ({ mode, onModeChange, title }) => {
  const [runs, setRuns] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => { 
    setLoading(true)
    Api.runs(mode)
      .then(setRuns)
      .catch((err) => {
        console.error('API Error:', err)
        setError(err.message)
        setRuns([])
      })
      .finally(() => setLoading(false))
  }, [mode])
  
  const getStatus = (): 'ready' | 'processing' | 'error' | 'no-data' => {
    if (error) return 'error'
    if (loading) return 'processing'
    if (runs.length === 0) return 'no-data'
    return 'ready'
  }

  const getLastUpdated = (): string => {
    if (mode === 'demo') {
      return 'Static dataset - no updates'
    }
    return new Date().toLocaleString()
  }
  
  if (error) {
    return (
      <AnalysisLayout 
        mode={mode} 
        onModeChange={onModeChange} 
        title={title}
        status="error"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">API Error: {error}</Typography>
          <Typography variant="body2">Make sure the backend is running on port 8000</Typography>
        </Alert>
      </AnalysisLayout>
    )
  }
  
  return (
    <AnalysisLayout 
      mode={mode} 
      onModeChange={onModeChange} 
      title={title}
      status={getStatus()}
      lastUpdated={getLastUpdated()}
      sampleCount={runs.length}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dataset Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {mode === 'demo' 
            ? 'Comprehensive analysis of bioproject PRJNA397172 with curated samples and controlled experimental design.'
            : 'Real-time discovery of pancreas RNA-seq data with continuous processing and analysis updates.'
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Samples" 
            value={runs.length}
            subtitle={mode === 'demo' ? 'Curated samples' : 'Discovered samples'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Studies" 
            value={new Set(runs.map(r => r.study)).size}
            subtitle={mode === 'demo' ? 'Single bioproject' : 'Multiple studies'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Conditions" 
            value={new Set(runs.map(r => r.condition)).size}
            subtitle={mode === 'demo' ? 'Controlled conditions' : 'Diverse conditions'}
          />
        </Grid>
      </Grid>

      {mode === 'demo' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.main', borderRadius: 1, color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Demo Dataset: PRJNA397172
          </Typography>
          <Typography variant="body2" paragraph>
            This curated dataset provides a controlled environment for demonstrating the platform's 
            analytical capabilities. All samples come from the same research study with known 
            experimental design and expected outcomes.
          </Typography>
        </Box>
      )}

      {mode === 'live' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'secondary.light', borderRadius: 1, opacity: 0.1 }}>
          <Typography variant="h6" gutterBottom>
            Live Discovery Stream
          </Typography>
          <Typography variant="body2" paragraph>
            Continuously discovering new pancreas RNA-seq data from the European Nucleotide Archive. 
            New samples are automatically processed and integrated into the analysis pipeline as they 
            become available.
          </Typography>
        </Box>
      )}
    </AnalysisLayout>
  )
}

export default Overview


