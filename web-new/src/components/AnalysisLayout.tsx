import React from 'react'
import { Box, Container, Typography, Paper } from '@mui/material'
import MultiOmicsSelector from './MultiOmicsSelector'
import MultiOmicsDiscoveryStatus from './MultiOmicsDiscoveryStatus'

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
  const [selectedDataType, setSelectedDataType] = React.useState('rna_seq')
  const [selectedDiseaseFocus, setSelectedDiseaseFocus] = React.useState('cancer')
  const [selectedTissueType, setSelectedTissueType] = React.useState('all')
  const [discoveryStats, setDiscoveryStats] = React.useState(null)
  const [isDiscovering, setIsDiscovering] = React.useState(false)

  const handleTriggerDiscovery = async (dataType: string, diseaseFocus: string, tissueType: string) => {
    setIsDiscovering(true)
    try {
      // Trigger discovery API call
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/multi-omics/discovery/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_type: dataType,
          disease_focus: diseaseFocus,
          tissue_type: tissueType === 'all' ? null : tissueType,
          days_back: 30,
          max_samples: 100
        })
      })
      const data = await response.json()
      console.log('Discovery triggered:', data)
      
      // Refresh discovery stats
      setTimeout(() => {
        fetchDiscoveryStats()
      }, 2000)
    } catch (error) {
      console.error('Failed to trigger discovery:', error)
    } finally {
      setIsDiscovering(false)
    }
  }

  const fetchDiscoveryStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/multi-omics/discovery/statistics`)
      const data = await response.json()
      setDiscoveryStats(data)
    } catch (error) {
      console.error('Failed to fetch discovery stats:', error)
    }
  }

  React.useEffect(() => {
    if (mode === 'live') {
      fetchDiscoveryStats()
    }
  }, [mode])

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <MultiOmicsSelector
        selectedDataType={selectedDataType}
        onDataTypeChange={setSelectedDataType}
        selectedDiseaseFocus={selectedDiseaseFocus}
        onDiseaseFocusChange={setSelectedDiseaseFocus}
        selectedTissueType={selectedTissueType}
        onTissueTypeChange={setSelectedTissueType}
      />
      
      <MultiOmicsDiscoveryStatus
        onTriggerDiscovery={handleTriggerDiscovery}
        discoveryStats={discoveryStats}
        isDiscovering={isDiscovering}
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
            ? 'Comprehensive analysis of curated bioproject PRJNA397172 with controlled experimental design and known outcomes.'
            : `Real-time analysis of newly discovered ${selectedDataType.replace('_', '-')} data from ${selectedDiseaseFocus} studies in ${selectedTissueType === 'all' ? 'all tissues' : selectedTissueType} from the European Nucleotide Archive.`
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
