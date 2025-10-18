import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Search as SearchIcon,
  Timeline as TimelineIcon,
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  Assessment as AssessmentIcon,
  Explore as ExploreIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface DiscoveryStatusProps {
  onTriggerDiscovery: (dataType: string, diseaseFocus: string, tissueType: string) => void
  discoveryStats?: any
  isDiscovering?: boolean
}

const DiscoveryStatus: React.FC<DiscoveryStatusProps> = ({
  onTriggerDiscovery,
  discoveryStats,
  isDiscovering = false
}) => {
  const theme = useTheme()
  const [selectedTab, setSelectedTab] = useState(0)

  const dataTypeIcons = {
    rna_seq: <ScienceIcon />,
    genomics: <BiotechIcon />,
    proteomics: <AssessmentIcon />,
    metabolomics: <TimelineIcon />,
    single_cell: <ExploreIcon />,
    multi_omics: <AutoAwesomeIcon />
  }

  const dataTypeColors = {
    rna_seq: theme.palette.primary.main,
    genomics: theme.palette.secondary.main,
    proteomics: theme.palette.success.main,
    metabolomics: theme.palette.warning.main,
    single_cell: theme.palette.info.main,
    multi_omics: theme.palette.error.main
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />
      case 'error':
        return <ErrorIcon color="error" />
      case 'warning':
        return <WarningIcon color="warning" />
      default:
        return <CheckCircleIcon color="disabled" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main
      case 'error':
        return theme.palette.error.main
      case 'warning':
        return theme.palette.warning.main
      default:
        return theme.palette.grey[500]
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon />
        Discovery Status & Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Discovery Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Discovery Controls
              </Typography>
              
              {isDiscovering && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Discovery in progress...
                  </Alert>
                  <LinearProgress />
                </Box>
              )}

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => onTriggerDiscovery('all', 'all', 'all')}
                disabled={isDiscovering}
                fullWidth
                sx={{ mb: 2 }}
              >
                {isDiscovering ? 'Discovering...' : 'Discover All Data Types'}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Trigger discovery for all supported data types and disease categories
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Quick Discovery Options
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onTriggerDiscovery('rna_seq', 'cancer', 'pancreas')}
                    disabled={isDiscovering}
                    fullWidth
                  >
                    Cancer RNA-seq
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onTriggerDiscovery('genomics', 'neurodegenerative', 'brain')}
                    disabled={isDiscovering}
                    fullWidth
                  >
                    Neuro Genomics
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onTriggerDiscovery('proteomics', 'cardiovascular', 'heart')}
                    disabled={isDiscovering}
                    fullWidth
                  >
                    Cardiac Proteomics
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onTriggerDiscovery('metabolomics', 'metabolic', 'liver')}
                    disabled={isDiscovering}
                    fullWidth
                  >
                    Metabolic Profiling
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Discovery Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Discovery Statistics
              </Typography>
              
              {discoveryStats ? (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {discoveryStats.total_studies || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Studies
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {discoveryStats.total_samples || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Samples
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom>
                    By Data Type
                  </Typography>
                  
                  {discoveryStats.discovery_stats && Object.entries(discoveryStats.discovery_stats).map(([dataType, stats]: [string, any]) => (
                    <Box key={dataType} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ color: dataTypeColors[dataType as keyof typeof dataTypeColors] }}>
                          {dataTypeIcons[dataType as keyof typeof dataTypeIcons]}
                        </Box>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {dataType.replace('_', '-')}
                        </Typography>
                        <Chip 
                          label={`${stats.discoveries || 0} discoveries`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.total_samples || 0) / Math.max(discoveryStats.total_samples || 1, 1) * 100}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading discovery statistics...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Discovery History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Discovery History
              </Typography>
              
              <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
                <Tab label="Recent Discoveries" />
                <Tab label="By Disease Focus" />
                <Tab label="By Tissue Type" />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {selectedTab === 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Recent discovery activities across all data types
                    </Typography>
                    
                    {/* Mock recent discoveries */}
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cancer RNA-seq Discovery"
                          secondary="Found 25 new samples in pancreas studies (2 hours ago)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Neurodegenerative Genomics"
                          secondary="Discovered 12 brain samples from Alzheimer's studies (4 hours ago)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cardiovascular Proteomics"
                          secondary="Limited samples found in heart disease studies (6 hours ago)"
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}

                {selectedTab === 1 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Discovery statistics by disease focus
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {['cancer', 'neurodegenerative', 'cardiovascular', 'metabolic', 'autoimmune', 'infectious'].map((disease) => (
                        <Grid item xs={12} sm={6} md={4} key={disease}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                              {disease}
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {Math.floor(Math.random() * 50) + 10}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Studies Found
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {selectedTab === 2 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Discovery statistics by tissue type
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {['brain', 'heart', 'liver', 'pancreas', 'lung', 'breast', 'blood', 'muscle'].map((tissue) => (
                        <Grid item xs={6} sm={4} md={3} key={tissue}>
                          <Chip
                            label={`${tissue}: ${Math.floor(Math.random() * 30) + 5}`}
                            variant="outlined"
                            sx={{ mb: 1, width: '100%' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DiscoveryStatus
