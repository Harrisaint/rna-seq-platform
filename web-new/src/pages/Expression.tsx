import React from 'react'
import { Container, Typography } from '@mui/material'
import { Api } from '../components/apiClient'
import PCAPlot from '../components/PCAPlot'
import AnalysisLayout from '../components/AnalysisLayout'

interface ExpressionProps {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
  title: string
}

const Expression: React.FC<ExpressionProps> = ({ mode, onModeChange, title }) => {
  const [pca, setPca] = React.useState<{ scores: any[]; variance: { PC1: number; PC2: number } } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => { 
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await Api.pca(mode)
        setPca(data)
      } catch (err) {
        setError('Failed to load PCA data')
        setPca(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mode])
  
  return (
    <AnalysisLayout 
      mode={mode} 
      onModeChange={onModeChange} 
      title={title}
      status={loading ? 'loading' : error ? 'error' : 'success'}
      lastUpdated={new Date().toISOString()}
      sampleCount={pca?.scores?.length || 0}
    >
      <Container sx={{ py: 3 }}>
        <Typography variant="h6">Principal Component Analysis</Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
        )}
        {pca && pca.scores.length > 0 ? (
          <PCAPlot scores={pca.scores as any} variance={pca.variance} />
        ) : (
          <Typography>No PCA data available.</Typography>
        )}
      </Container>
    </AnalysisLayout>
  )
}

export default Expression


