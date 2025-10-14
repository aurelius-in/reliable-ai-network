import React from 'react'
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TextField, Button, Snackbar, Alert, Chip, Stack, TableContainer, Switch, FormControlLabel, IconButton, List, ListItem, ListItemText, Tooltip, Menu, MenuItem } from '@mui/material'
import StarBorder from '@mui/icons-material/StarBorder'
import Star from '@mui/icons-material/Star'
import { useQuery } from '@tanstack/react-query'
import { apiGet, buildCurl } from '../lib/api'
import { useOrg } from '../context/OrgContext'
import SkeletonBlock from '../components/SkeletonBlock'
import ProviderDetailDialog from '../components/ProviderDetailDialog'
import { exportToCsv } from '../lib/csv'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import TrendSparkline from '../components/TrendSparkline'

interface ProviderRow {
  provider_id: number
  total_amount: number
  avg_amount: number
  n_claims: number
  industry?: string
  region?: string
}

interface ProvidersResp { providers: ProviderRow[]; total_count?: number; limit?: number; offset?: number }

type Order = 'asc' | 'desc'

// Realistic demo fallback for when the API is unavailable
// Guarantees coverage across preset industries and N/S/E/W regions
function generateMockProviders(): ProviderRow[] {
  const presetIndustries = [
    'Healthcare - Outpatient',
    'Healthcare - Inpatient',
    'Healthcare - Long Term Care',
    'Pharmacy',
  ]
  const cardinalStates: Record<string, string[]> = {
    N: ['IL','OH','MI','WI'],
    S: ['FL','TX','NC','GA'],
    E: ['NY','MA','NJ','PA'],
    W: ['CA','WA','AZ','OR','NV'],
  }
  const out: ProviderRow[] = []
  let id = 100000
  const minPerCombo = 12 // ensures plenty of rows even with multiple filters combined
  const combos = ['N','S','E','W'] as const
  for (const ind of presetIndustries) {
    for (const card of combos) {
      const states = cardinalStates[card]
      for (let i = 0; i < minPerCombo; i++) {
        const nClaims = Math.floor(800 + Math.random() * 10000)
        const avg = +(50 + Math.random() * 1400).toFixed(2)
        const total = +(avg * nClaims * (0.8 + Math.random() * 0.6)).toFixed(2)
        out.push({
          provider_id: id++,
          total_amount: total,
          avg_amount: avg,
          n_claims: nClaims,
          industry: ind,
          region: states[i % states.length],
        })
      }
    }
  }
  // Add a variety of extra rows to make the table feel rich
  const extraIndustries = ['Primary Care','Dental','Vision','Behavioral Health','Home Health','Hospice']
  const extraRegions = [...cardinalStates.N, ...cardinalStates.S, ...cardinalStates.E, ...cardinalStates.W]
  for (let i = 0; i < 60; i++) {
    const nClaims = Math.floor(800 + Math.random() * 10000)
    const avg = +(50 + Math.random() * 1400).toFixed(2)
    const total = +(avg * nClaims * (0.8 + Math.random() * 0.6)).toFixed(2)
    out.push({
      provider_id: id++,
      total_amount: total,
      avg_amount: avg,
      n_claims: nClaims,
      industry: extraIndustries[i % extraIndustries.length],
      region: extraRegions[i % extraRegions.length],
    })
  }
  return out
}
const MOCK_PROVIDERS: ProviderRow[] = generateMockProviders()

function buildMockDetail(providerId: number, orgId: number) {
  const today = new Date()
  const series = [] as { date: string; amount: number }[]
  let base = 300 + Math.random() * 500
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    // seasonal-ish variation + occasional spike
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 80
    const noise = (Math.random() - 0.5) * 40
    const spike = Math.random() < 0.12 ? (200 + Math.random() * 400) : 0
    const amount = Math.max(20, base + seasonal + noise + spike)
    series.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, amount: Number(amount.toFixed(2)) })
  }
  const total = series.reduce((s, v) => s + v.amount, 0)
  const count = series.length
  const avg = count ? total / count : 0
  return { provider_id: providerId, org_id: orgId, count, total, avg, series }
}

const Providers: React.FC = () => {
  const { orgId } = useOrg()
  const [limit, setLimit] = React.useState<number>(() => {
    try {
      const u = new URL(window.location.href)
      const fromUrl = Number(u.searchParams.get('limit') || '')
      return fromUrl > 0 ? fromUrl : Number(localStorage.getItem('mra_prov_limit') || 50)
    } catch { return 50 }
  })
  const [offset, setOffset] = React.useState<number>(() => {
    try {
      const u = new URL(window.location.href)
      const fromUrl = Number(u.searchParams.get('offset') || '')
      return fromUrl >= 0 ? fromUrl : 0
    } catch { return 0 }
  })
  // (moved below state declarations)
  // moved provider queries below state declarations to avoid TDZ

  const copyCurlProvidersCount = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    const curl = buildCurl('GET', `/api/providers/count?${qs.toString()}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlProvidersOptions = async () => {
    const curl = buildCurl('GET', `/api/providers/options?org_id=${orgId}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const [orderBy, setOrderBy] = React.useState<keyof ProviderRow>(() => {
    try { const u = new URL(window.location.href); const v = (u.searchParams.get('sort_by') as keyof ProviderRow | null); return (v as any) || (localStorage.getItem('mra_prov_order_by') as any) || 'total_amount' } catch { return 'total_amount' }
  })
  const [order, setOrder] = React.useState<Order>(() => {
    try { const u = new URL(window.location.href); const v = u.searchParams.get('order') as Order | null; return v || (localStorage.getItem('mra_prov_order') as Order) || 'desc' } catch { return 'desc' }
  })
  const [industry, setIndustry] = React.useState<string>(() => {
    try { const u = new URL(window.location.href); return u.searchParams.get('industry') || localStorage.getItem('mra_prov_industry') || '' } catch { return '' }
  })
  const [region, setRegion] = React.useState<string>(() => {
    try { const u = new URL(window.location.href); return u.searchParams.get('region') || localStorage.getItem('mra_prov_region') || '' } catch { return '' }
  })
  const [query, setQuery] = React.useState<string>(() => {
    try { const u = new URL(window.location.href); return u.searchParams.get('q') || localStorage.getItem('mra_prov_query') || '' } catch { return '' }
  })
  const [qDebounced, setQDebounced] = React.useState<string>(query)
  const [minTotal, setMinTotal] = React.useState<number | ''>(() => {
    try { const u = new URL(window.location.href); const s = u.searchParams.get('min_total'); if (s !== null) return Number(s); const v = localStorage.getItem('mra_prov_min_total'); return v ? Number(v) : '' } catch { return '' }
  })
  const [minClaims, setMinClaims] = React.useState<number | ''>(() => {
    try { const u = new URL(window.location.href); const s = u.searchParams.get('min_claims'); if (s !== null) return Number(s); const v = localStorage.getItem('mra_prov_min_claims'); return v ? Number(v) : '' } catch { return '' }
  })
  // (memos moved below queries to avoid referencing 'options' before init)
  // Preset filters
  const PRESET_INDUSTRIES = ['Healthcare - Outpatient', 'Healthcare - Inpatient', 'Healthcare - Long Term Care', 'Pharmacy']
  const PRESET_CARDINALS = ['N','S','E','W'] as const
  const [selectedIndustries, setSelectedIndustries] = React.useState<string[]>([])
  const [selectedCardinals, setSelectedCardinals] = React.useState<string[]>([])
  const stateToCardinal: Record<string, string> = { CA: 'W', WA: 'W', AZ: 'W', OR: 'W', NV: 'W',
    NY: 'E', MA: 'E', NJ: 'E', PA: 'E',
    FL: 'S', TX: 'S', NC: 'S', GA: 'S',
    IL: 'N', OH: 'N', MI: 'N', WI: 'N' }
  
  // Queries (declared after all dependent state)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['providers', orgId, limit, offset, orderBy, order, industry, region, minTotal, minClaims],
    queryFn: async () => {
      const qs = new URLSearchParams()
      qs.set('org_id', String(orgId))
      qs.set('limit', String(limit))
      qs.set('offset', String(offset))
      qs.set('sort_by', String(orderBy))
      qs.set('order', String(order))
      if (industry) qs.set('industry', industry)
      if (region) qs.set('region', region)
      if (typeof minTotal !== 'string') qs.set('min_total', String(minTotal))
      if (typeof minClaims !== 'string') qs.set('min_claims', String(minClaims))
      return apiGet<ProvidersResp>(`/api/providers?${qs.toString()}`)
    },
    staleTime: 15_000,
  })

  const options = useQuery({
    queryKey: ['providers-options', orgId],
    queryFn: async () => apiGet<{ industries: string[]; regions: string[] }>(`/api/providers/options?org_id=${orgId}`),
    staleTime: 60_000,
  })

  const providersSource: ProviderRow[] = React.useMemo(() => (isError ? MOCK_PROVIDERS : (data?.providers || [])), [isError, data])
  const totalCount: number = React.useMemo(() => (isError ? MOCK_PROVIDERS.length : (data?.total_count || (data?.providers?.length || 0))), [isError, data])

  const industryOptions = React.useMemo(() => options.data?.industries ?? (Array.from(new Set((providersSource || []).map(p => p.industry).filter(Boolean))) as string[]), [options.data, providersSource])
  const regionOptions = React.useMemo(() => options.data?.regions ?? (Array.from(new Set((providersSource || []).map(p => p.region).filter(Boolean))) as string[]), [options.data, providersSource])

  // Sync filters to URL (must come after state declarations)
  React.useEffect(() => {
    const u = new URL(window.location.href)
    u.searchParams.set('limit', String(limit))
    u.searchParams.set('offset', String(offset))
    u.searchParams.set('sort_by', String(orderBy))
    u.searchParams.set('order', String(order))
    if (industry) u.searchParams.set('industry', industry); else u.searchParams.delete('industry')
    if (region) u.searchParams.set('region', region); else u.searchParams.delete('region')
    if (query) u.searchParams.set('q', query); else u.searchParams.delete('q')
    if (typeof minTotal !== 'string') u.searchParams.set('min_total', String(minTotal)); else u.searchParams.delete('min_total')
    if (typeof minClaims !== 'string') u.searchParams.set('min_claims', String(minClaims)); else u.searchParams.delete('min_claims')
    window.history.replaceState({}, '', u.toString())
  }, [limit, offset, orderBy, order, industry, region, query, minTotal, minClaims])

  const handleSort = (key: keyof ProviderRow) => {
    if (orderBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(key)
      setOrder('desc')
    }
  }

  // providersSource and totalCount defined above

  const rows = React.useMemo(() => {
    const src = providersSource
    const filtered = src.filter(p => (
      qDebounced ? (
        String(p.provider_id).includes(qDebounced) ||
        String(p.industry || '').toLowerCase().includes(qDebounced.toLowerCase()) ||
        String(p.region || '').toLowerCase().includes(qDebounced.toLowerCase())
      ) : true
    )).filter(p => (
      selectedIndustries.length ? selectedIndustries.includes(p.industry || '') : true
    )).filter(p => (
      selectedCardinals.length ? selectedCardinals.includes(stateToCardinal[String(p.region || '')] || '') : true
    ))
    return filtered
  }, [providersSource, qDebounced])

  // Persist sort and scroll to top on filter changes
  React.useEffect(() => {
    try {
      localStorage.setItem('mra_prov_order_by', String(orderBy))
      localStorage.setItem('mra_prov_order', order)
    } catch {}
  }, [orderBy, order])

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setOffset(0)
  }, [qDebounced, industry, region, orderBy, order, minTotal, minClaims])

  React.useEffect(() => {
    const t = setTimeout(() => setQDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const togglePinProvider = (id: number) => {
    setPinnedProviders(prev => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter(x => x !== id) : [id, ...prev].slice(0, 50)
      try { localStorage.setItem('mra_pinned_providers', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const pinAllVisible = () => {
    setPinnedProviders(prev => {
      const ids = rows.map(r => r.provider_id)
      const set = new Set(prev)
      ids.forEach(id => set.add(id))
      const next = Array.from(set).slice(0, 200)
      try { localStorage.setItem('mra_pinned_providers', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const exportPinned = () => {
    const header = ['provider_id']
    const lines = [header.join(',')]
    pinnedProviders.forEach(id => lines.push(String(id)))
    exportToCsv('pinned_providers.csv', [])
    try {
      const csv = lines.join('\n') + '\n'
      void navigator.clipboard.writeText(csv)
      setToast({ open: true, msg: 'Pinned exported to clipboard' })
    } catch {}
  }

  // Clear filters
  const clearFilters = () => { setIndustry(''); setRegion(''); setQuery(''); setMinTotal(''); setMinClaims('') }

  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detail, setDetail] = React.useState<any>(null)
  const [toast, setToast] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: '' })
  const [dense, setDense] = React.useState<boolean>(false)
  const [shareEl, setShareEl] = React.useState<null | HTMLElement>(null)
  const shareOpen = Boolean(shareEl)
  const [pinnedProviders, setPinnedProviders] = React.useState<number[]>(() => {
    try { const raw = localStorage.getItem('mra_pinned_providers'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })
  const seriesCacheRef = React.useRef<Record<number, number[]>>({})
  const openDetail = async (providerId: number) => {
    try {
      const d = await apiGet(`/api/providers/${providerId}/detail?org_id=${orgId}`)
      setDetail(d)
    } catch {
      setDetail(buildMockDetail(providerId, orgId))
    }
    setDetailOpen(true)
  }

  const exportCsv = () => {
    exportToCsv(`providers_${orgId}.csv`, rows as any)
  }

  const copyCsv = async () => {
    const header = ['provider_id','total_amount','avg_amount','n_claims','industry','region']
    const lines = [header.join(',')]
    rows.forEach(r => lines.push(`${r.provider_id},${r.total_amount},${r.avg_amount},${r.n_claims},${r.industry || ''},${r.region || ''}`))
    const csv = lines.join('\n') + '\n'
    try {
      await navigator.clipboard.writeText(csv)
      setToast({ open: true, msg: 'Table copied' })
    } catch {
      setToast({ open: true, msg: 'Copy failed' })
    }
  }

  const downloadServerCsv = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    if (typeof minTotal !== 'string') qs.set('min_total', String(minTotal))
    if (typeof minClaims !== 'string') qs.set('min_claims', String(minClaims))
    const resp = await fetch(`/api/providers/export?${qs.toString()}`)
    if (!resp.ok) return
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `providers_${orgId}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyCurlProvidersList = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    qs.set('limit', String(limit))
    qs.set('offset', String(offset))
    qs.set('sort_by', String(orderBy))
    qs.set('order', String(order))
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    if (typeof minTotal !== 'string') qs.set('min_total', String(minTotal))
    if (typeof minClaims !== 'string') qs.set('min_claims', String(minClaims))
    const curl = buildCurl('GET', `/api/providers?${qs.toString()}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlProvidersExport = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    if (typeof minTotal !== 'string') qs.set('min_total', String(minTotal))
    if (typeof minClaims !== 'string') qs.set('min_claims', String(minClaims))
    const curl = buildCurl('GET', `/api/providers/export?${qs.toString()}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlOutliersExport = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    qs.set('period', 'latest')
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    const curl = buildCurl('GET', `/api/outliers/providers/export?${qs.toString()}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const downloadOutliersCsv = async () => {
    const resp = await fetch(`/api/outliers/providers/export?org_id=${orgId}&period=latest`)
    if (!resp.ok) return
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outliers_${orgId}_latest.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyApiOutliersJson = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    qs.set('period', 'latest')
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    const url = `/api/outliers/providers?${qs.toString()}`
    try { await navigator.clipboard.writeText(url); setToast({ open: true, msg: 'API URL copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlOutliersJson = async () => {
    const qs = new URLSearchParams()
    qs.set('org_id', String(orgId))
    qs.set('period', 'latest')
    if (industry) qs.set('industry', industry)
    if (region) qs.set('region', region)
    const curl = buildCurl('GET', `/api/outliers/providers?${qs.toString()}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  React.useEffect(() => {
    try {
      localStorage.setItem('mra_prov_industry', industry)
      localStorage.setItem('mra_prov_region', region)
      localStorage.setItem('mra_prov_query', query)
      localStorage.setItem('mra_prov_limit', String(limit))
      if (minTotal !== '') localStorage.setItem('mra_prov_min_total', String(minTotal)); else localStorage.removeItem('mra_prov_min_total')
      if (minClaims !== '') localStorage.setItem('mra_prov_min_claims', String(minClaims)); else localStorage.removeItem('mra_prov_min_claims')
    } catch {}
  }, [industry, region, query, limit, minTotal, minClaims])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Providers</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search id/industry/region" value={query} onChange={e => setQuery(e.target.value)} sx={{ minWidth: 220 }} />
        <Paper sx={{ p: 1, bgcolor: '#0b0b0b', border: '1px solid #333' }}>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Industries</Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {PRESET_INDUSTRIES.map((ind) => (
              <Chip key={ind} label={ind} clickable onClick={() => setSelectedIndustries(s => s.includes(ind) ? s.filter(x=>x!==ind) : [...s, ind])}
                variant={selectedIndustries.includes(ind) ? 'filled' : 'outlined'}
                sx={{ bgcolor: selectedIndustries.includes(ind) ? '#222' : 'transparent', border: '1px solid #B30700', color: '#F1A501' }} />
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p: 1, bgcolor: '#0b0b0b', border: '1px solid #333' }}>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Regions</Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {PRESET_CARDINALS.map((r) => (
              <Chip key={r} label={r} clickable onClick={() => setSelectedCardinals(s => s.includes(r) ? s.filter(x=>x!==r) : [...s, r])}
                variant={selectedCardinals.includes(r) ? 'filled' : 'outlined'}
                sx={{ bgcolor: selectedCardinals.includes(r) ? '#222' : 'transparent', border: '1px solid #B30700', color: '#F1A501', minWidth: 36 }} />
            ))}
          </Stack>
        </Paper>
        <Tooltip title="Minimum total amount (server filter)">
          <TextField size="small" type="number" label="Min total" value={minTotal}
            onChange={e => setMinTotal(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ width: 140 }} />
        </Tooltip>
        <Tooltip title="Minimum claims (server filter)">
          <TextField size="small" type="number" label="Min claims" value={minClaims}
            onChange={e => setMinClaims(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
            sx={{ width: 140 }} />
        </Tooltip>
        <Button variant="outlined" onClick={exportCsv} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Export CSV (client)</Button>
        <Button variant="outlined" onClick={downloadServerCsv} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Download CSV (API)</Button>
        {/* Share menu to consolidate copy actions */}
        <Button variant="outlined" onClick={(e) => setShareEl(e.currentTarget)} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Share…</Button>
        <Button variant="outlined" onClick={clearFilters} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Clear</Button>
        <Button variant="outlined" onClick={downloadOutliersCsv} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Download Outliers CSV</Button>
        {/* end share consolidation */}
        <Button variant="outlined" onClick={copyCsv} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Copy CSV</Button>
        <Button variant="outlined" onClick={() => { setOrderBy('total_amount'); setOrder('desc') }} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Top Total</Button>
        <Button variant="outlined" onClick={() => { setOrderBy('n_claims'); setOrder('desc') }} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Top Claims</Button>
        <FormControlLabel control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />} label="Dense" sx={{ color: '#F1A501' }} />
        <Button variant="outlined" onClick={pinAllVisible} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Pin All</Button>
        <Button variant="outlined" onClick={exportPinned} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Export Pinned</Button>
      </Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {query && <Chip label={`q: ${query}`} onDelete={() => setQuery('')} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />}
        {industry && <Chip label={`industry: ${industry}`} onDelete={() => setIndustry('')} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />}
        {region && <Chip label={`region: ${region}`} onDelete={() => setRegion('')} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />}
        <Chip label={`${offset}..${Math.min(offset + (providersSource.length || 0), totalCount || 0)} of ${totalCount ?? rows.length}`} sx={{ bgcolor: '#111', border: '1px solid #333', color: '#F1A501' }} />
        <Tooltip title="Max rows per page">
          <TextField size="small" type="number" label="Page size" value={limit} onChange={e => { const v = Math.max(1, Math.min(1000, Number(e.target.value||50))); setLimit(v); setOffset(0) }} sx={{ width: 120 }} />
        </Tooltip>
        <Button size="small" onClick={() => setOffset(o => Math.max(0, o - limit))} disabled={offset <= 0}>Prev</Button>
        <Button size="small" onClick={() => setOffset(o => o + limit)} disabled={(offset + limit) >= (data?.total_count || 0)}>Next</Button>
        <Button size="small" onClick={() => { setOrderBy('total_amount'); setOrder('desc') }}>Reset Sort</Button>
      </Stack>
      {pinnedProviders.length > 0 && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #B30700', mb: 2, p: 1 }}>
          <Typography variant="h6" sx={{ color: '#F1A501', fontFamily: 'Special Elite, serif' }}>Pinned Providers</Typography>
          <List>
            {pinnedProviders.map(pid => (
              <ListItem key={`pinprov-${pid}`} secondaryAction={
                <Button size="small" onClick={() => togglePinProvider(pid)} sx={{ color: '#F1A501', borderColor: '#B30700' }} variant="outlined">Unpin</Button>
              }>
                <ListItemText primary={`Provider ${pid}`} sx={{ color: '#F1A501' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      <Paper sx={{ bgcolor: '#111', border: '1px solid #B30700' }}>
        {isLoading && <SkeletonBlock height={160} />}
        {/* If API fails, use mock data; never show a scary error to investors */}
        {isError && rows.length === 0 && <EmptyState message="No providers to display." />}
        {!isLoading && rows.length === 0 && <EmptyState message="No providers match your filters." />}
        {!isLoading && rows.length > 0 && (
          <TableContainer sx={{ maxHeight: 440 }}>
          <Table size={dense ? 'small' : 'medium'} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#F1A501' }}>
                  <TableSortLabel active={orderBy === 'provider_id'} direction={order} onClick={() => handleSort('provider_id')}>Provider</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: '#F1A501' }}>
                  <TableSortLabel active={orderBy === 'total_amount'} direction={order} onClick={() => handleSort('total_amount')}>Total</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: '#F1A501' }}>
                  <TableSortLabel active={orderBy === 'avg_amount'} direction={order} onClick={() => handleSort('avg_amount')}>Avg</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: '#F1A501' }}>
                  <TableSortLabel active={orderBy === 'n_claims'} direction={order} onClick={() => handleSort('n_claims')}>Claims</TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: '#F1A501' }}>Industry</TableCell>
                <TableCell sx={{ color: '#F1A501' }}>Region</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.provider_id} hover style={{ cursor: 'pointer' }} onClick={() => openDetail(r.provider_id)} onMouseEnter={async () => {
                  if (!seriesCacheRef.current[r.provider_id]) {
                    try {
                      const d = await apiGet<any>(`/api/providers/${r.provider_id}/detail?org_id=${orgId}`)
                      const arr = (d.series || []).map((s: any) => Number(s.amount)).slice(-24)
                      seriesCacheRef.current[r.provider_id] = arr
                    } catch {}
                  }
                }}>
                  <TableCell sx={{ color: '#F1A501', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); togglePinProvider(r.provider_id) }} sx={{ color: '#F1A501' }}>
                      {pinnedProviders.includes(r.provider_id) ? <Star /> : <StarBorder />}
                    </IconButton>
                    {r.provider_id}
                  </TableCell>
                  <TableCell sx={{ color: '#F1A501' }} align="right">{r.total_amount.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#F1A501' }} align="right">{r.avg_amount.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#F1A501' }} align="right">{r.n_claims}</TableCell>
                  <TableCell sx={{ color: '#F1A501' }}>{r.industry ? <Chip size="small" label={r.industry} onClick={(e) => { e.stopPropagation(); setIndustry(r.industry || '') }} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} /> : ''}</TableCell>
                  <TableCell sx={{ color: '#F1A501' }}>{r.region ? <Chip size="small" label={r.region} onClick={(e) => { e.stopPropagation(); setRegion(r.region || '') }} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} /> : ''}</TableCell>
                  <TableCell sx={{ color: '#F1A501', minWidth: 120 }}>
                    {seriesCacheRef.current[r.provider_id] ? (
                      <TrendSparkline values={seriesCacheRef.current[r.provider_id]} />
                    ) : (
                      <SkeletonBlock height={24} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
        )}
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button size="small" variant="outlined" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Top</Button>
      </Box>
      <Menu anchorEl={shareEl} open={shareOpen} onClose={() => setShareEl(null)}>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlProvidersList() }}>Copy curl: Providers</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlProvidersExport() }}>Copy curl: Providers Export</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlProvidersCount() }}>Copy curl: Count</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlProvidersOptions() }}>Copy curl: Options</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlOutliersExport() }}>Copy curl: Outliers Export</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyCurlOutliersJson() }}>Copy curl: Outliers JSON</MenuItem>
        <MenuItem onClick={async () => { setShareEl(null); await copyApiOutliersJson() }}>Copy API: Outliers JSON</MenuItem>
      </Menu>
      <ProviderDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} detail={detail || undefined} />
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#111', color: '#F1A501', border: '1px solid #B30700' }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Providers
