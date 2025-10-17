import React from 'react'
import { Container, Grid, Slider, Typography, Box } from '@mui/material'
import { Api } from '../components/apiClient'
import VolcanoPlot from '../components/VolcanoPlot'
import MAPlot from '../components/MAPlot'
import DEGTable from '../components/DEGTable'
import AnalysisLayout from '../components/AnalysisLayout'

interface DifferentialProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  title: string
}

const Differential: React.FC<DifferentialProps> = ({ mode, onModeChange, title }) => {
  const [padj, setPadj] = React.useState(0.1)
  const [lfc, setLfc] = React.useState(1)
  const [de, setDe] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const p = new URLSearchParams({ 
          max_padj: String(padj), 
          min_abs_log2fc: String(lfc), 
          limit: '5000',
          mode: mode
        })
        const data = await Api.de(p, mode)
        setDe(data)
      } catch (err) {
        setError('Failed to load differential expression data')
        setDe([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [padj, lfc, mode])
  return (
    <AnalysisLayout 
      mode={mode} 
      onModeChange={onModeChange} 
      title={title}
      status={loading ? 'loading' : error ? 'error' : 'success'}
      lastUpdated={new Date().toISOString()}
      sampleCount={de.length}
    >
      <Container sx={{ py: 3 }}>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Volcano Plot</Typography>
            <VolcanoPlot data={de} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>MA Plot</Typography>
            <MAPlot data={de} />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>Filtering Controls</Typography>
              <Typography gutterBottom>Adjusted p-value ≤ {padj}</Typography>
              <Slider min={0} max={1} step={0.01} value={padj} onChange={(_, v) => setPadj(v as number)} />
              <Typography gutterBottom sx={{ mt: 2 }}>|log2FC| ≥ {lfc}</Typography>
              <Slider min={0} max={4} step={0.1} value={lfc} onChange={(_, v) => setLfc(v as number)} />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <DEGTable 
                data={de} 
                padjThreshold={padj} 
                lfcThreshold={lfc} 
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </AnalysisLayout>
  )
}

export default Differential


