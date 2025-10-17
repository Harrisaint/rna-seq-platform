import React from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'

type GSEAResult = {
  pathway: string
  description: string
  size: number
  es: number
  nes: number
  pvalue: number
  padj: number
  leading_edge: {
    tags: number
    list: number
    signal: number
  }
}

type Props = { 
  results: GSEAResult[]
  geneSets: string[]
}

const GSEATable: React.FC<Props> = ({ results, geneSets }) => {
  const getSignificanceColor = (padj: number) => {
    if (padj < 0.001) return 'error'
    if (padj < 0.01) return 'warning'
    if (padj < 0.05) return 'info'
    return 'default'
  }

  const getNESColor = (nes: number) => {
    if (nes > 1.5) return 'success'
    if (nes < -1.5) return 'error'
    return 'default'
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gene Set Enrichment Analysis Results
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Available gene sets: {geneSets.join(', ')}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Pathway</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">ES</TableCell>
              <TableCell align="right">NES</TableCell>
              <TableCell align="right">P-value</TableCell>
              <TableCell align="right">Adj. P-value</TableCell>
              <TableCell align="right">Leading Edge</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {result.pathway}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {result.description}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {result.size}
                </TableCell>
                <TableCell align="right">
                  {result.es.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={result.nes.toFixed(3)} 
                    size="small"
                    color={getNESColor(result.nes)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  {result.pvalue.toExponential(2)}
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={result.padj.toExponential(2)} 
                    size="small"
                    color={getSignificanceColor(result.padj)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption">
                    {result.leading_edge.tags.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Legend:</strong> ES = Enrichment Score, NES = Normalized Enrichment Score. 
          Positive NES indicates upregulation, negative indicates downregulation.
        </Typography>
      </Box>
    </Box>
  )
}

export default GSEATable
