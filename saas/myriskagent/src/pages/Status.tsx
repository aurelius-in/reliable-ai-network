import React from 'react'
import { Box, Typography, Paper, Chip, Stack, Button, Snackbar, Alert, Tooltip } from '@mui/material'
import { buildCurl } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

const Status: React.FC = () => {
  const health = useQuery({ queryKey: ['healthz'], queryFn: async () => { try { const r = await fetch('/api/healthz'); return r.ok ? r.json() : { status: 'down' } } catch { return { status: 'down' } } }, refetchInterval: 30000 })
  const ready = useQuery({ queryKey: ['ready'], queryFn: async () => { try { const r = await fetch('/api/ready'); return { ok: r.status === 200, body: await r.json() } } catch { return { ok: false, body: {} } } }, refetchInterval: 60000 })
  // hide version info in UI for demos
  const summary = useQuery({ queryKey: ['status-summary'], queryFn: async () => { try { const r = await fetch('/api/status/summary'); return r.ok ? r.json() : {} } catch { return {} } } })
  const [toast, setToast] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: '' })

  const copy = async (text: string, ok = 'Copied') => { try { await navigator.clipboard.writeText(text); setToast({ open: true, msg: ok }) } catch { setToast({ open: true, msg: 'Copy failed' }) } }

  const copyApiHealth = () => copy('/api/healthz', 'API URL copied')
  const copyCurlHealth = () => copy(buildCurl('GET', '/api/healthz'), 'curl copied')
  const copyApiReady = () => copy('/api/ready', 'API URL copied')
  const copyCurlReady = () => copy(buildCurl('GET', '/api/ready'), 'curl copied')
  const copyApiVersion = () => copy('/api/version', 'API URL copied')
  const copyCurlVersion = () => copy(buildCurl('GET', '/api/version'), 'curl copied')
  const copyApiSummary = () => copy('/api/status/summary', 'API URL copied')
  const copyCurlSummary = () => copy(buildCurl('GET', '/api/status/summary'), 'curl copied')
  const copyApiMetrics = () => copy('/api/metrics', 'API URL copied')
  const copyCurlMetrics = () => copy(buildCurl('GET', '/api/metrics'), 'curl copied')

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Status</Typography>
      <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #B30700' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip size="small" label={health.data?.status === 'ok' ? 'Health: OK' : 'Health: DOWN'} sx={{ bgcolor: '#111', border: `1px solid ${health.data?.status === 'ok' ? '#0a0' : '#a00'}`, color: health.data?.status === 'ok' ? '#0f0' : '#f00' }} />
          <Chip size="small" label={ready.data?.ok ? 'Ready: OK' : 'Ready: UNREADY'} sx={{ bgcolor: '#111', border: `1px solid ${ready.data?.ok ? '#0a0' : '#a00'}`, color: ready.data?.ok ? '#0f0' : '#f00' }} />
          <Button size="small" variant="outlined" onClick={() => window.open('/api/metrics', '_blank')} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Metrics</Button>
          <Button size="small" variant="outlined" onClick={() => window.open('/api/docs', '_blank')} sx={{ color: '#F1A501', borderColor: '#B30700' }}>OpenAPI</Button>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Copy /api/healthz">
            <span><Button size="small" variant="outlined" onClick={copyApiHealth} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Health API</Button></span>
          </Tooltip>
          <Tooltip title="Copy curl for /api/healthz">
            <span><Button size="small" variant="outlined" onClick={copyCurlHealth} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Health curl</Button></span>
          </Tooltip>
          <Tooltip title="Copy /api/ready">
            <span><Button size="small" variant="outlined" onClick={copyApiReady} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Ready API</Button></span>
          </Tooltip>
          <Tooltip title="Copy curl for /api/ready">
            <span><Button size="small" variant="outlined" onClick={copyCurlReady} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Ready curl</Button></span>
          </Tooltip>
          <Tooltip title="Copy /api/version">
            <span><Button size="small" variant="outlined" onClick={copyApiVersion} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Version API</Button></span>
          </Tooltip>
          <Tooltip title="Copy curl for /api/version">
            <span><Button size="small" variant="outlined" onClick={copyCurlVersion} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Version curl</Button></span>
          </Tooltip>
          <Tooltip title="Copy /api/status/summary">
            <span><Button size="small" variant="outlined" onClick={copyApiSummary} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Summary API</Button></span>
          </Tooltip>
          <Tooltip title="Copy curl for /api/status/summary">
            <span><Button size="small" variant="outlined" onClick={copyCurlSummary} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Summary curl</Button></span>
          </Tooltip>
          <Tooltip title="Copy /api/metrics">
            <span><Button size="small" variant="outlined" onClick={copyApiMetrics} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Metrics API</Button></span>
          </Tooltip>
          <Tooltip title="Copy curl for /api/metrics">
            <span><Button size="small" variant="outlined" onClick={copyCurlMetrics} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Metrics curl</Button></span>
          </Tooltip>
        </Stack>
        <Typography variant="subtitle1" sx={{ color: '#F1A501', mb: 0.5 }}>System status</Typography>
        <Typography sx={{ color: '#ccc', mb: 1 }}>
          {(health.data?.status === 'ok' && ready.data?.ok) ? 'All services are operational.' : 'Some services are unavailable. Please try again later.'}
        </Typography>
      </Paper>
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#111', color: '#F1A501', border: '1px solid #B30700' }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Status


