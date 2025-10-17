import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  Chip,
  TablePagination
} from '@mui/material'

interface DEGData {
  feature: string
  baseMean: number
  log2FC: number
  lfcSE: number
  stat: number
  pvalue: number
  padj: number
  gene_name?: string
}

interface DEGTableProps {
  data: DEGData[]
  padjThreshold: number
  lfcThreshold: number
}

const DEGTable: React.FC<DEGTableProps> = ({ data, padjThreshold, lfcThreshold }) => {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)

  // Filter data based on thresholds
  const filteredData = data.filter(d => 
    d.padj <= padjThreshold && Math.abs(d.log2FC) >= lfcThreshold
  )

  // Sort by significance (lowest padj first)
  const sortedData = filteredData.sort((a, b) => a.padj - b.padj)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getSignificanceColor = (padj: number) => {
    if (padj < 0.001) return 'error'
    if (padj < 0.01) return 'warning'
    if (padj < 0.05) return 'info'
    return 'default'
  }

  const getRegulationChip = (log2FC: number) => {
    if (log2FC > 0) {
      return <Chip label="UP" color="error" size="small" />
    } else {
      return <Chip label="DOWN" color="primary" size="small" />
    }
  }

  if (sortedData.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No significantly differentially expressed genes found with current thresholds
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Differentially Expressed Genes ({sortedData.length} total)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Showing genes with |log2FC| ≥ {lfcThreshold} and padj ≤ {padjThreshold}
      </Typography>
      
      <TableContainer component={Paper}>
        <Table size="small" aria-label="differential expression table">
          <TableHead>
            <TableRow>
              <TableCell>Gene</TableCell>
              <TableCell>Gene Name</TableCell>
              <TableCell align="right">Base Mean</TableCell>
              <TableCell align="right">log2FC</TableCell>
              <TableCell align="center">Regulation</TableCell>
              <TableCell align="right">P-value</TableCell>
              <TableCell align="right">Adj. P-value</TableCell>
              <TableCell align="right">Statistic</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={row.feature} hover>
                  <TableCell component="th" scope="row">
                    {row.feature}
                  </TableCell>
                  <TableCell>
                    {row.gene_name || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {row.baseMean.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      color: row.log2FC > 0 ? 'error.main' : 'primary.main',
                      fontWeight: 'bold'
                    }}>
                      {row.log2FC.toFixed(3)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {getRegulationChip(row.log2FC)}
                  </TableCell>
                  <TableCell align="right">
                    {row.pvalue.toExponential(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={row.padj.toExponential(2)} 
                      color={getSignificanceColor(row.padj)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.stat.toFixed(3)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  )
}

export default DEGTable
