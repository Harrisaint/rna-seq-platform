import React from 'react'
import { Box, Typography, Chip, LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import ErrorIcon from '@mui/icons-material/Error'
import { useTheme } from '@mui/material/styles'

interface DataStatusIndicatorProps {
  mode: 'demo' | 'live'
  status: 'ready' | 'processing' | 'error' | 'no-data'
  lastUpdated?: string
  sampleCount?: number
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({ 
  mode, 
  status, 
  lastUpdated, 
  sampleCount 
}) => {
  const theme = useTheme()

  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
          text: 'Data Ready',
          color: 'success' as const,
          bgColor: 'success.light'
        }
      case 'processing':
        return {
          icon: <ScheduleIcon sx={{ color: 'warning.main' }} />,
          text: 'Processing',
          color: 'warning' as const,
          bgColor: 'warning.light'
        }
      case 'error':
        return {
          icon: <ErrorIcon sx={{ color: 'error.main' }} />,
          text: 'Error',
          color: 'error' as const,
          bgColor: 'error.light'
        }
      case 'no-data':
        return {
          icon: <ScheduleIcon sx={{ color: 'text.secondary' }} />,
          text: 'No Data',
          color: 'default' as const,
          bgColor: 'grey.100'
        }
      default:
        return {
          icon: <ScheduleIcon sx={{ color: 'text.secondary' }} />,
          text: 'Unknown',
          color: 'default' as const,
          bgColor: 'grey.100'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Box sx={{ 
      p: 2, 
      borderRadius: 1, 
      bgcolor: mode === 'demo' ? 'primary.light' : 'secondary.light',
      opacity: 0.3,
      border: 1,
      borderColor: mode === 'demo' ? 'primary.main' : 'secondary.main'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {statusConfig.icon}
        <Typography variant="subtitle2" fontWeight="bold">
          {mode === 'demo' ? 'Demo Dataset' : 'Live Stream'}
        </Typography>
        <Chip 
          label={statusConfig.text}
          size="small"
          color={statusConfig.color}
          sx={{ ml: 'auto' }}
        />
      </Box>
      
      {sampleCount !== undefined && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {sampleCount} samples available
        </Typography>
      )}
      
      {lastUpdated && (
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated}
        </Typography>
      )}
      
      {status === 'processing' && (
        <LinearProgress 
          sx={{ 
            mt: 1,
            '& .MuiLinearProgress-bar': {
              bgcolor: mode === 'demo' ? 'primary.main' : 'secondary.main'
            }
          }} 
        />
      )}
    </Box>
  )
}

export default DataStatusIndicator
