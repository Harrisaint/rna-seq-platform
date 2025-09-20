import React from 'react'
import { Container, TextField, Typography } from '@mui/material'
import { Api } from '@/api/client.ts'

const Explorer: React.FC = () => {
  const [q, setQ] = React.useState('')
  const [gene, setGene] = React.useState<any>(null)
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q) Api.gene(q).then(setGene).catch(() => setGene(null)) }
  return (
    <Container sx={{ py: 3 }}>
      <form onSubmit={submit}>
        <TextField fullWidth label="Gene ID or symbol" value={q} onChange={e => setQ(e.target.value)} />
      </form>
      <Typography sx={{ mt: 2 }}>{gene ? JSON.stringify(gene) : 'Search a gene to view details.'}</Typography>
    </Container>
  )
}

export default Explorer


