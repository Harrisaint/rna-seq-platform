import React from 'react'
import { Box, Container, Typography, Paper } from '@mui/material'
import DataModeSelector from './DataModeSelector'
import DataStatusIndicator from './DataStatusIndicator'

interface AnalysisLayoutProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  children: React.ReactNode
  title: string
  status?: 'ready' | 'processing' | 'error' | 'no-data'
  lastUpdated?: string
  sampleCount?: number
}

const AnalysisLayout: React.FC<AnalysisLayoutProps> = ({
  mode,
  onModeChange,
  children,
  title,
  status = 'no-data',
  lastUpdated,
  sampleCount
}) => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <DataModeSelector mode={mode} onModeChange={onModeChange} />
      
      <DataStatusIndicator 
        mode={mode}
        status={status}
        lastUpdated={lastUpdated}
        sampleCount={sampleCount}
      />
      
      <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: mode === 'demo' ? 'primary.main' : 'secondary.main',
          fontWeight: 'bold'
        }}>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {mode === 'demo' 
            ? 'Analysis of curated bioproject PRJNA397172 with controlled experimental design and known outcomes.'
            : 'Real-time analysis of newly discovered pancreas RNA-seq data from the European Nucleotide Archive.'
          }
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      </Paper>
    </Container>
  )
}

export default AnalysisLayout
