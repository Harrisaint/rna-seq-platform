import React from 'react'
import { Box, Typography, Chip, Button, Alert } from '@mui/material'
import { Api } from './apiClient'

interface LiveDiscoveryStatusProps {
  mode: 'demo' | 'live'
}

const LiveDiscoveryStatus: React.FC<LiveDiscoveryStatusProps> = ({ mode }) => {
  const [status, setStatus] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [triggering, setTriggering] = React.useState(false)

  React.useEffect(() => {
    if (mode === 'live') {
      fetchStatus()
    }
  }, [mode])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/discovery/status`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch discovery status:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerDiscovery = async () => {
    try {
      setTriggering(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/discovery/trigger`, {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Discovery triggered:', data)
      // Refresh status after triggering
      setTimeout(fetchStatus, 2000)
    } catch (error) {
      console.error('Failed to trigger discovery:', error)
    } finally {
      setTriggering(false)
    }
  }

  if (mode === 'demo') {
    return null
  }

  if (loading) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">Loading discovery status...</Typography>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">Unable to load discovery status</Typography>
      </Alert>
    )
  }

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Live Discovery Status
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={triggerDiscovery}
          disabled={triggering}
        >
          {triggering ? 'Discovering...' : 'Trigger Discovery'}
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          label={status.running ? 'Running' : 'Stopped'} 
          color={status.running ? 'success' : 'default'}
          size="small"
        />
        <Chip 
          label={`${status.total_discovered} samples`} 
          color="primary"
          size="small"
        />
        {status.last_discovery && (
          <Chip 
            label={`Last: ${new Date(status.last_discovery).toLocaleString()}`} 
            color="info"
            size="small"
          />
        )}
      </Box>

      {status.recent_samples && status.recent_samples.length > 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Recent discoveries:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {status.recent_samples.map((sample: any, index: number) => (
              <Chip 
                key={index}
                label={sample.sample} 
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default LiveDiscoveryStatus
