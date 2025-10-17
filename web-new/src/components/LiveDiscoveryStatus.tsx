import React from 'react'
import { Box, Typography, Chip, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Api } from './apiClient'

interface LiveDiscoveryStatusProps {
  mode: 'demo' | 'live'
}

const LiveDiscoveryStatus: React.FC<LiveDiscoveryStatusProps> = ({ mode }) => {
  const [status, setStatus] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [triggering, setTriggering] = React.useState(false)
  const [organs, setOrgans] = React.useState<any>({})
  const [selectedOrgan, setSelectedOrgan] = React.useState<string>('')

  React.useEffect(() => {
    if (mode === 'live') {
      fetchStatus()
      fetchOrgans()
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

  const fetchOrgans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/discovery/organs`)
      const data = await response.json()
      setOrgans(data.organs || {})
    } catch (error) {
      console.error('Failed to fetch organs:', error)
    }
  }

  const triggerDiscovery = async () => {
    try {
      setTriggering(true)
      const url = selectedOrgan 
        ? `${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/discovery/trigger?organ=${encodeURIComponent(selectedOrgan)}`
        : `${import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'}/discovery/trigger`
      
      const response = await fetch(url, {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Discovery triggered:', data)
      // Refresh status and organs after triggering
      setTimeout(() => {
        fetchStatus()
        fetchOrgans()
      }, 2000)
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Organ</InputLabel>
            <Select
              value={selectedOrgan}
              label="Filter by Organ"
              onChange={(e) => setSelectedOrgan(e.target.value)}
            >
              <MenuItem value="">All Organs</MenuItem>
              {Object.entries(organs).map(([organ, count]) => (
                <MenuItem key={organ} value={organ}>
                  {organ} ({count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={triggerDiscovery}
            disabled={triggering}
          >
            {triggering ? 'Discovering...' : 'Trigger Discovery'}
          </Button>
        </Box>
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
