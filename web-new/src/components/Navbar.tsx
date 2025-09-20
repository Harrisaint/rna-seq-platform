import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Chip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import ScienceIcon from '@mui/icons-material/Science'
import UpdateIcon from '@mui/icons-material/Update'
import { Link as RouterLink } from 'react-router-dom'

const Navbar: React.FC<{ dark: boolean; toggleDark: () => void }> = ({ dark, toggleDark }) => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <ScienceIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ mr: 3 }}>
            RNA-seq Platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              icon={<ScienceIcon />}
              label="Demo" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <Chip 
              icon={<UpdateIcon />}
              label="Live" 
              size="small" 
              color="secondary" 
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            />
          </Box>
        </Box>
        
        <Button color="inherit" component={RouterLink} to="/">Overview</Button>
        <Button color="inherit" component={RouterLink} to="/qc">QC</Button>
        <Button color="inherit" component={RouterLink} to="/expression">Expression</Button>
        <Button color="inherit" component={RouterLink} to="/de">Differential</Button>
        <Button color="inherit" component={RouterLink} to="/pathways">Pathways</Button>
        <Button color="inherit" component={RouterLink} to="/explorer">Explorer</Button>
        
        <IconButton color="inherit" onClick={toggleDark} aria-label="toggle dark mode">
          {dark ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar


