import React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack, Chip, Button, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ReactECharts from 'echarts-for-react'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { buildCurl } from '../lib/api'

interface ProviderDetail {
  provider_id: number
  org_id: number
  count: number
  total: number
  avg: number
  series: { date: string; amount: number }[]
  notes?: string
}

interface Props {
  open: boolean
  onClose: () => void
  detail?: ProviderDetail
}

const ProviderDetailDialog: React.FC<Props> = ({ open, onClose, detail }) => {
  const values = (detail?.series || []).map(s => Number(s.amount) || 0)
  const mean = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
  const variance = values.length ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length : 0
  const std = Math.sqrt(variance) || 0
  const spikes = new Set<number>()
  const seriesArr = Array.isArray(detail?.series) ? detail!.series : []
  seriesArr.forEach((s, idx) => {
    const amt = Number(s.amount) || 0
    if (std > 0 && Math.abs(amt - mean) > 2 * std) spikes.add(idx)
  })
  const option = {
    backgroundColor: 'transparent',
    xAxis: { type: 'category', data: seriesArr.map(s => s.date), axisLabel: { color: '#F1A501' } },
    yAxis: { type: 'value', axisLabel: { color: '#F1A501' } },
    series: [{ type: 'line', data: seriesArr.map((s, idx) => ({ value: Number(s.amount) || 0, itemStyle: spikes.has(idx) ? { color: '#B30700' } : undefined })), lineStyle: { color: '#F1A501' } }],
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: '#000', color: '#F1A501', fontFamily: 'Special Elite, serif' }}>
        Provider {detail?.provider_id}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: '#F1A501' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#000' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip label={`Claims ${Number(detail?.count || 0)}`} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
          <Chip label={`Total ${typeof detail?.total === 'number' ? detail.total.toFixed(2) : '0.00'}`} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
          <Chip label={`Avg ${typeof detail?.avg === 'number' ? detail.avg.toFixed(2) : '0.00'}`} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Button onClick={async () => {
            const resp = await fetch(`/api/evidence/download/provider/${detail?.provider_id}/latest`)
            if (!resp.ok) return
            const blob = await resp.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `evidence_provider_${detail?.provider_id}_latest.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}>Download Evidence ZIP</Button>
          <Button onClick={async () => { if (!detail) return; const url = `/api/evidence/download/provider/${detail.provider_id}/latest`; try { await navigator.clipboard.writeText(url) } catch {} }}>Copy Evidence API URL</Button>
          <Button onClick={async () => {
            if (!detail) return
            const curl = buildCurl('GET', `/api/evidence/download/provider/${detail.provider_id}/latest`)
            try { await navigator.clipboard.writeText(curl) } catch {}
          }}>Copy curl</Button>
          <Button onClick={async () => { if (!detail) return; const url = `/api/evidence/download/provider/${detail.provider_id}/latest`; try { await navigator.clipboard.writeText(url) } catch {} }}>Copy API URL</Button>
          <Button onClick={async () => {
            if (!detail) return
            const resp = await fetch(`/api/providers/${detail.provider_id}/claims/export?org_id=${detail.org_id}`)
            if (!resp.ok) return
            const blob = await resp.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `claims_provider_${detail.provider_id}_${detail.org_id}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}>Download Claims CSV</Button>
          <Button onClick={async () => {
            if (!detail) return
            const qs = new URLSearchParams(); qs.set('org_id', String(detail.org_id))
            const curl = buildCurl('GET', `/api/providers/${detail.provider_id}/claims/export?${qs.toString()}`)
            try { await navigator.clipboard.writeText(curl) } catch {}
          }}>Copy curl</Button>
          <Button onClick={async () => {
            if (!detail) return
            const qs = new URLSearchParams(); qs.set('org_id', String(detail.org_id))
            const url = `/api/providers/${detail.provider_id}/claims/export?${qs.toString()}`
            try { await navigator.clipboard.writeText(url) } catch {}
          }}>Copy API URL</Button>
          <Button onClick={async () => {
            if (!detail) return
            const qs = new URLSearchParams(); qs.set('org_id', String(detail.org_id))
            const curl = buildCurl('GET', `/api/providers/${detail.provider_id}/claims/export?${qs.toString()}`)
            try { await navigator.clipboard.writeText(curl) } catch {}
          }}>Copy curl</Button>
          <Button onClick={async () => {
            if (!detail) return
            const header = 'date,amount\n'
            const rows = (detail.series || []).map(s => `${s.date},${s.amount}`).join('\n')
            const csv = header + rows + (rows ? '\n' : '')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `provider_${detail.provider_id}_series.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}>Export CSV</Button>
        </Box>
        <ReactECharts option={option} style={{ height: 240 }} />
        {(() => {
          const s = detail?.series || []
          if (s.length < 2) return null
          const diffs = [] as { idx: number; from: string; to: string; delta: number }[]
          for (let i = 1; i < s.length; i++) {
            diffs.push({ idx: i, from: s[i-1].date, to: s[i].date, delta: s[i].amount - s[i-1].amount })
          }
          const top = diffs.sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3)
          return (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ color: '#F1A501', mb: 0.5 }}>Top deviations</Typography>
              <Stack spacing={0.5}>
                {top.map((d, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ color: '#F1A501' }}>
                    {d.delta >= 0 ? <ArrowUpwardIcon fontSize="small" sx={{ color: '#B30700' }} /> : <ArrowDownwardIcon fontSize="small" sx={{ color: '#B30700' }} />}
                    <Typography variant="body2">{d.from} → {d.to}: {d.delta >= 0 ? '+' : ''}{d.delta.toFixed(2)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )
        })()}
        {detail?.notes && (
          <Typography sx={{ color: '#F1A501', mt: 1, whiteSpace: 'pre-wrap' }}>{detail.notes}</Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProviderDetailDialog
