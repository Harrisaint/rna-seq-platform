import React from 'react'
import { Container, Grid, Slider, Typography } from '@mui/material'
import { Api } from '../api/client'
import VolcanoPlot from '../components/VolcanoPlot'
import MAPlot from '../components/MAPlot'

const Differential: React.FC = () => {
  const [padj, setPadj] = React.useState(0.1)
  const [lfc, setLfc] = React.useState(1)
  const [de, setDe] = React.useState<any[]>([])
  React.useEffect(() => {
    const p = new URLSearchParams({ max_padj: String(padj), min_abs_log2fc: String(lfc), limit: '5000' })
    Api.de(p).then(setDe).catch(() => setDe([]))
  }, [padj, lfc])
  return (
    <Container sx={{ py: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><VolcanoPlot data={de} /></Grid>
        <Grid item xs={12} md={6}><MAPlot data={de} /></Grid>
        <Grid item xs={12}>
          <Typography gutterBottom>Adjusted p-value ≤ {padj}</Typography>
          <Slider min={0} max={1} step={0.01} value={padj} onChange={(_, v) => setPadj(v as number)} />
          <Typography gutterBottom>|log2FC| ≥ {lfc}</Typography>
          <Slider min={0} max={4} step={0.1} value={lfc} onChange={(_, v) => setLfc(v as number)} />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Differential


