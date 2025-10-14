import React from 'react'
import { Box, Button, Stack, Typography, Snackbar, Alert, Chip } from '@mui/material'
import type { DocResult } from '../lib/types'

interface Props {
  doc: DocResult | null
  onTogglePin?: (doc: DocResult) => void
  isPinned?: boolean
}

const DocumentViewer: React.FC<Props> = ({ doc, onTogglePin, isPinned }) => {
  const [copiedOpen, setCopiedOpen] = React.useState(false)
  if (!doc) {
    return <div style={{ color: '#F1A501' }}>Select a document to preview.</div>
  }

  const openSource = () => {
    if (doc.url) window.open(doc.url, '_blank')
  }

  const copyLink = async () => {
    if (!doc.url) return
    try {
      await navigator.clipboard.writeText(doc.url)
      setCopiedOpen(true)
    } catch {}
  }

  const host = (() => { try { return new URL(doc.url || '').host } catch { return '' } })()
  const isExample = host.includes('example.com')

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ color: '#F1A501', fontFamily: 'Special Elite, serif' }}>{doc.title || 'Untitled'}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onTogglePin && (
            <Button onClick={() => onTogglePin(doc)}>{isPinned ? 'Unpin' : 'Pin'}</Button>
          )}
          <Button onClick={openSource} disabled={!doc.url}>Open source</Button>
          <Button onClick={copyLink} disabled={!doc.url}>Copy link</Button>
        </Box>
      </Stack>
      {doc.url && (
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip size="small" label={host} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
          <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: '#F1A501', textDecoration: 'underline' }}>{doc.url}</a>
        </Box>
      )}
      {doc.url && !isExample && (
        <iframe title="doc" src={doc.url} style={{ width: '100%', height: 420, border: 'none', background: '#000' }} />
      )}
      {(!doc.url || isExample) && (
        <Box sx={{ p: 2, bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1 }}>
          <Typography sx={{ color: '#F1A501', mb: 1 }}>Preview unavailable</Typography>
          <Typography sx={{ color: '#ccc', mb: 1 }}>This source cannot be embedded here. Use the Open source button to view it in a new tab.</Typography>
          {doc.snippet && <Typography sx={{ color: '#F1A501' }}>{doc.snippet}</Typography>}
        </Box>
      )}
      <Snackbar open={copiedOpen} autoHideDuration={2000} onClose={() => setCopiedOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#111', color: '#F1A501', border: '1px solid #B30700' }}>Link copied</Alert>
      </Snackbar>
    </Box>
  )
}

export default DocumentViewer


