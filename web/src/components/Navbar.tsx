import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Link as RouterLink } from 'react-router-dom'

const Navbar: React.FC<{ dark: boolean; toggleDark: () => void }> = ({ dark, toggleDark }) => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>RNA-seq Platform</Typography>
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









