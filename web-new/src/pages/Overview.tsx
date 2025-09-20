import React from 'react'
import { Container, Grid, Typography } from '@mui/material'
import StatCard from '@/components/StatCard'
import { Api } from '@/api/client'

const Overview: React.FC = () => {
  const [runs, setRuns] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => { 
    Api.runs()
      .then(setRuns)
      .catch((err) => {
        console.error('API Error:', err)
        setError(err.message)
        setRuns([])
      }) 
  }, [])
  
  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography variant="h6" color="error">API Error: {error}</Typography>
        <Typography variant="body2">Make sure the backend is running on port 8000</Typography>
      </Container>
    )
  }
  
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>RNA-seq Platform Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><StatCard title="Samples" value={runs.length} /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Studies" value={new Set(runs.map(r => r.study)).size} /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Conditions" value={new Set(runs.map(r => r.condition)).size} /></Grid>
      </Grid>
    </Container>
  )
}

export default Overview


