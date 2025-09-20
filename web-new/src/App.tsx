import React, { useMemo, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider, Typography, Container } from '@mui/material'
import Overview from './pages/Overview'
import QC from './pages/QC'
import Expression from './pages/Expression'
import Differential from './pages/Differential'
import Pathways from './pages/Pathways'
import Explorer from './pages/Explorer'
import Navbar from './components/Navbar'

const App: React.FC = () => {
  const [dark, setDark] = useState(true)
  const theme = useMemo(() => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }), [dark])
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar dark={dark} toggleDark={() => setDark(d => !d)} />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/qc" element={<QC />} />
        <Route path="/expression" element={<Expression />} />
        <Route path="/de" element={<Differential />} />
        <Route path="/pathways" element={<Pathways />} />
        <Route path="/explorer" element={<Explorer />} />
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


