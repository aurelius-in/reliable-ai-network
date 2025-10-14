import React from 'react'
import { Dialog, DialogTitle, DialogContent, Typography, Stack, Button } from '@mui/material'

interface Props { open: boolean; onClose: () => void }

const AboutDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>About MyRiskAgent</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant="body2">Agentic risk analysis with OSINT ingestion, explainable scores, and provider analytics.</Typography>
          <Stack direction="row" spacing={1}>
            <Button href="/api/docs" target="_blank">OpenAPI Docs</Button>
            <Button href="/api/metrics" target="_blank">Metrics</Button>
            <Button href="https://github.com/aurelius-in/MyRiskAgent" target="_blank">GitHub</Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default AboutDialog


