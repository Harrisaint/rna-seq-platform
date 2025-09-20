import React from 'react'
import { Container, Typography } from '@mui/material'
import { Api } from '../api/client'
import PCAPlot from '../components/PCAPlot'

const Expression: React.FC = () => {
  const [pca, setPca] = React.useState<{ scores: any[]; variance: { PC1: number; PC2: number } } | null>(null)
  React.useEffect(() => { Api.pca().then(setPca).catch(() => setPca(null)) }, [])
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h6">PCA</Typography>
      {pca && pca.scores.length > 0 ? (
        <PCAPlot scores={pca.scores as any} variance={pca.variance} />
      ) : (
        <Typography>No PCA yet.</Typography>
      )}
    </Container>
  )
}

export default Expression


