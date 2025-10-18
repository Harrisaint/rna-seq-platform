import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  Favorite as HeartIcon,
  AutoAwesome as AutoAwesomeIcon,
  BugReport as BugReportIcon,
  ChildCare as ChildCareIcon,
  Cloud as CloudIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Explore as ExploreIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface DataTypeSelectorProps {
  selectedDataType: string
  onDataTypeChange: (dataType: string) => void
  selectedDiseaseFocus: string
  onDiseaseFocusChange: (diseaseFocus: string) => void
  selectedTissueType: string
  onTissueTypeChange: (tissueType: string) => void
}

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  selectedDataType,
  onDataTypeChange,
  selectedDiseaseFocus,
  onDiseaseFocusChange,
  selectedTissueType,
  onTissueTypeChange
}) => {
  const theme = useTheme()

  const dataTypes = [
    {
      id: 'rna_seq',
      name: 'RNA-seq',
      description: 'Transcriptome analysis',
      icon: <ScienceIcon />,
      color: theme.palette.primary.main
    },
    {
      id: 'genomics',
      name: 'Genomics',
      description: 'WGS, Exome, ChIP-seq, ATAC-seq',
      icon: <BiotechIcon />,
      color: theme.palette.secondary.main
    },
    {
      id: 'proteomics',
      name: 'Proteomics',
      description: 'Protein expression & interactions',
      icon: <AssessmentIcon />,
      color: theme.palette.success.main
    },
    {
      id: 'metabolomics',
      name: 'Metabolomics',
      description: 'Metabolite profiling',
      icon: <TimelineIcon />,
      color: theme.palette.warning.main
    },
    {
      id: 'single_cell',
      name: 'Single-Cell',
      description: 'scRNA-seq, scATAC-seq',
      icon: <ExploreIcon />,
      color: theme.palette.info.main
    },
    {
      id: 'multi_omics',
      name: 'Multi-Omics',
      description: 'Integrated analysis',
      icon: <AutoAwesomeIcon />,
      color: theme.palette.error.main
    }
  ]

  const diseaseFocuses = [
    {
      id: 'cancer',
      name: 'Cancer',
      description: 'Oncology research',
      icon: <HospitalIcon />,
      color: theme.palette.error.main
    },
    {
      id: 'neurodegenerative',
      name: 'Neurodegenerative',
      description: 'Alzheimer\'s, Parkinson\'s',
      icon: <PsychologyIcon />,
      color: theme.palette.info.main
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular',
      description: 'Heart disease, stroke',
      icon: <HeartIcon />,
      color: theme.palette.error.light
    },
    {
      id: 'metabolic',
      name: 'Metabolic',
      description: 'Diabetes, obesity',
      icon: <AssessmentIcon />,
      color: theme.palette.warning.main
    },
    {
      id: 'autoimmune',
      name: 'Autoimmune',
      description: 'RA, lupus, IBD',
      icon: <BugReportIcon />,
      color: theme.palette.secondary.main
    },
    {
      id: 'infectious',
      name: 'Infectious',
      description: 'COVID-19, influenza',
      icon: <CloudIcon />,
      color: theme.palette.success.main
    },
    {
      id: 'developmental',
      name: 'Developmental',
      description: 'Autism, ADHD',
      icon: <ChildCareIcon />,
      color: theme.palette.primary.main
    }
  ]

  const tissueTypes = [
    'brain', 'heart', 'liver', 'pancreas', 'lung', 'breast', 'blood',
    'muscle', 'skin', 'gut', 'kidney', 'prostate', 'ovary', 'bone', 'thyroid'
  ]

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon />
        Multi-Omics Discovery Platform
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover and analyze biological datasets across multiple data types and disease categories
      </Typography>

      {/* Data Type Selection */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Data Type
          </Typography>
          <Grid container spacing={2}>
            {dataTypes.map((dataType) => (
              <Grid item xs={12} sm={6} md={4} key={dataType.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedDataType === dataType.id ? 2 : 1,
                    borderColor: selectedDataType === dataType.id ? dataType.color : 'divider',
                    bgcolor: selectedDataType === dataType.id ? `${dataType.color}10` : 'background.paper',
                    '&:hover': {
                      bgcolor: `${dataType.color}05`,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => onDataTypeChange(dataType.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: dataType.color, mb: 1 }}>
                      {dataType.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {dataType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dataType.description}
                    </Typography>
                    {selectedDataType === dataType.id && (
                      <Chip 
                        label="Selected" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Disease Focus Selection */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Disease Focus
          </Typography>
          <Grid container spacing={2}>
            {diseaseFocuses.map((disease) => (
              <Grid item xs={12} sm={6} md={4} key={disease.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedDiseaseFocus === disease.id ? 2 : 1,
                    borderColor: selectedDiseaseFocus === disease.id ? disease.color : 'divider',
                    bgcolor: selectedDiseaseFocus === disease.id ? `${disease.color}10` : 'background.paper',
                    '&:hover': {
                      bgcolor: `${disease.color}05`,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => onDiseaseFocusChange(disease.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: disease.color, mb: 1 }}>
                      {disease.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {disease.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {disease.description}
                    </Typography>
                    {selectedDiseaseFocus === disease.id && (
                      <Chip 
                        label="Selected" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tissue Type Selection */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Tissue Type (Optional)
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Tissue Type</InputLabel>
            <Select
              value={selectedTissueType}
              label="Tissue Type"
              onChange={(e) => onTissueTypeChange(e.target.value)}
            >
              <MenuItem value="all">All Tissues</MenuItem>
              {tissueTypes.map((tissue) => (
                <MenuItem key={tissue} value={tissue}>
                  {tissue.charAt(0).toUpperCase() + tissue.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DataTypeSelector
