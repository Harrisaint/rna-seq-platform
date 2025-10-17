import React from 'react'
import { ToggleButton, ToggleButtonGroup, Typography, Box, Chip } from '@mui/material'
import ScienceIcon from '@mui/icons-material/Science'
import UpdateIcon from '@mui/icons-material/Update'
import { useTheme } from '@mui/material/styles'

interface DataModeSelectorProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
}

const DataModeSelector: React.FC<DataModeSelectorProps> = ({ mode, onModeChange }) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Data Analysis Mode
      </Typography>
      
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, newMode) => newMode && onModeChange(newMode)}
        aria-label="data analysis mode"
        sx={{ width: '100%' }}
      >
        <ToggleButton 
          value="demo" 
          sx={{ 
            flex: 1, 
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center'
          }}
        >
          <ScienceIcon sx={{ fontSize: 32 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Demo Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Curated bioproject PRJNA397172
          </Typography>
          <Chip 
            label="Static" 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </ToggleButton>
        
        <ToggleButton 
          value="live" 
          sx={{ 
            flex: 1, 
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center',
            '&.Mui-selected': {
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'secondary.dark'
              }
            }
          }}
        >
          <UpdateIcon sx={{ fontSize: 32 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Live Discovery
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Continuous ENA pancreas RNA-seq stream
          </Typography>
          <Chip 
            label="Live" 
            size="small" 
            color="secondary" 
            variant="filled"
            sx={{ mt: 1, bgcolor: mode === 'live' ? 'white' : 'secondary.main', color: mode === 'live' ? 'secondary.main' : 'white' }}
          />
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        {mode === 'demo' 
          ? 'Explore curated analysis from a well-characterized bioproject with controlled experimental design.'
          : 'Discover and analyze new pancreas RNA-seq data as it becomes available from the European Nucleotide Archive.'
        }
      </Typography>
    </Box>
  )
}

export default DataModeSelector
