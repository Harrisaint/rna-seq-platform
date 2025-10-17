import React from 'react'
import { Container, Typography } from '@mui/material'
import { Api } from '../api/client'

const QC: React.FC = () => {
  const [qc, setQc] = React.useState<any>(null)
  React.useEffect(() => { Api.qc().then(setQc).catch(() => setQc(null)) }, [])
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h6">QC Summary</Typography>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{qc ? JSON.stringify(qc?.report_general_stats_data || qc, null, 2) : 'No QC data yet.'}</pre>
    </Container>
  )
}

export default QC






