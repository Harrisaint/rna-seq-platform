import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string }> = ({ title, value, subtitle }) => (
  <Card>
    <CardContent>
      <Typography variant="subtitle2" gutterBottom>{title}</Typography>
      <Typography variant="h5">{value}</Typography>
      {subtitle && <Typography variant="body2" sx={{ opacity: 0.7 }}>{subtitle}</Typography>}
    </CardContent>
  </Card>
)

export default StatCard







