import React, { useMemo, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider, Typography, Container } from '@mui/material'
import Overview from './pages/Overview'
import QC from './pages/QC'
import Expression from './pages/Expression'
import Differential from './pages/Differential'
import Pathways from './pages/Pathways'
import Explorer from './pages/Explorer'
import GSEA from './pages/GSEA'
import Navbar from './components/Navbar'

// Create a wrapper component for each page that includes the data mode context
const createPageWrapper = (PageComponent: React.ComponentType, pageTitle: string) => {
  return () => {
    const [mode, setMode] = useState<'demo' | 'live'>('demo')
    
    return (
      <PageComponent 
        mode={mode} 
        onModeChange={setMode}
        title={pageTitle}
      />
    )
  }
}

const App: React.FC = () => {
  const [dark, setDark] = useState(true)
  const theme = useMemo(() => createTheme({ 
    palette: { 
      mode: dark ? 'dark' : 'light',
      primary: {
        main: dark ? '#90caf9' : '#1976d2'
      },
      secondary: {
        main: dark ? '#f48fb1' : '#dc004e'
      }
    } 
  }), [dark])
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar dark={dark} toggleDark={() => setDark(d => !d)} />
      <Routes>
        <Route path="/" element={createPageWrapper(Overview, 'Overview')()} />
        <Route path="/qc" element={createPageWrapper(QC, 'Quality Control')()} />
        <Route path="/expression" element={createPageWrapper(Expression, 'Expression Analysis')()} />
        <Route path="/de" element={createPageWrapper(Differential, 'Differential Expression')()} />
        <Route path="/pathways" element={createPageWrapper(Pathways, 'Pathway Analysis')()} />
        <Route path="/gsea" element={createPageWrapper(GSEA, 'Gene Set Enrichment')()} />
        <Route path="/explorer" element={createPageWrapper(Explorer, 'Data Explorer')()} />
      </Routes>
      <footer style={{ padding: 16, textAlign: 'center', opacity: 0.7 }}>
        <Container>
          <Typography variant="body2">
            Provenance: loaded from API. <Link to="/">Home</Link>
          </Typography>
        </Container>
      </footer>
    </ThemeProvider>
  )
}

export default App


