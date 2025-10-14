import React from 'react'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper, Grid, Stack, ToggleButtonGroup, ToggleButton, Autocomplete, IconButton, FormControlLabel, Switch, Chip, Alert, Tooltip, Divider, Snackbar, Menu, MenuItem } from '@mui/material'
import StarBorder from '@mui/icons-material/StarBorder'
import Star from '@mui/icons-material/Star'
import { useQuery } from '@tanstack/react-query'
import { apiGet, apiPost, buildCurl } from '../lib/api'
import type { DocResult } from '../lib/types'
import SkeletonBlock from '../components/SkeletonBlock'
import { useOrg } from '../context/OrgContext'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import DocumentViewer from '../components/DocumentViewer'

const Documents: React.FC = () => {
  const { orgId } = useOrg()
  const [q, setQ] = React.useState<string>(() => { try { const u = new URL(window.location.href); return u.searchParams.get('docs_q') || localStorage.getItem('mra_docs_q') || '' } catch { return '' } })
  const [ticker, setTicker] = React.useState('')
  const [mode, setMode] = React.useState<'vector' | 'keyword'>(() => { try { const u = new URL(window.location.href); const m = (u.searchParams.get('docs_mode') as 'vector'|'keyword'|null); return m || ((localStorage.getItem('mra_docs_mode') as 'vector'|'keyword') || 'vector') } catch { return 'vector' } })
  const [selected, setSelected] = React.useState<DocResult | null>(() => {
    try { const raw = localStorage.getItem('mra_docs_selected'); return raw ? JSON.parse(raw) : null } catch { return null }
  })
  const [domain, setDomain] = React.useState<string | null>(() => { try { const u = new URL(window.location.href); return u.searchParams.get('docs_domain') || localStorage.getItem('mra_docs_domain') || null } catch { return null } })
  const [recentLimit, setRecentLimit] = React.useState<number>(() => { try { const u = new URL(window.location.href); const v = Number(u.searchParams.get('docs_recent') || ''); return v > 0 ? v : Number(localStorage.getItem('mra_docs_recent') || 10) } catch { return 10 } })
  const [pinned, setPinned] = React.useState<DocResult[]>(() => {
    try { const raw = localStorage.getItem('mra_pinned_docs'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })
  const [pinnedOnly, setPinnedOnly] = React.useState<boolean>(() => { try { return (localStorage.getItem('mra_docs_pinned_only') || 'false') === 'true' } catch { return false } })
  const [selectedIdx, setSelectedIdx] = React.useState<number>(-1)
  const [showHelp, setShowHelp] = React.useState<boolean>(false)
  const [toast, setToast] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: '' })
  const [shareEl, setShareEl] = React.useState<null | HTMLElement>(null)
  const shareOpen = Boolean(shareEl)
  const closeShare = () => setShareEl(null)

  const recent = useQuery({
    queryKey: ['docs-recent', orgId, recentLimit],
    queryFn: async () => apiGet<{ results: DocResult[] }>(`/api/docs/recent?org_id=${orgId}&limit=${recentLimit}`),
    staleTime: 60_000,
  })

  const copyCurlRecent = async () => {
    const curl = buildCurl('GET', `/api/docs/recent?org_id=${orgId}&limit=${recentLimit}`)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyApiRecent = async () => {
    const url = `/api/docs/recent?org_id=${orgId}&limit=${recentLimit}`
    try { await navigator.clipboard.writeText(url); setToast({ open: true, msg: 'API URL copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const [searchLimit, setSearchLimit] = React.useState<number>(() => { try { const u = new URL(window.location.href); const v = Number(u.searchParams.get('docs_limit') || ''); return v > 0 ? v : Number(localStorage.getItem('mra_docs_limit') || 10) } catch { return 10 } })
  React.useEffect(() => {
    const u = new URL(window.location.href)
    u.searchParams.set('docs_limit', String(searchLimit))
    if (domain) u.searchParams.set('docs_domain', String(domain)); else u.searchParams.delete('docs_domain')
    u.searchParams.set('docs_mode', mode)
    if (q) u.searchParams.set('docs_q', q); else u.searchParams.delete('docs_q')
    window.history.replaceState({}, '', u.toString())
  }, [searchLimit, domain, mode, q])
  const { data, isFetching, refetch, isError } = useQuery({
    queryKey: ['docs', orgId, q, mode, searchLimit],
    enabled: false,
    queryFn: async () => {
      const path = mode === 'vector'
        ? `/api/docs/search?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
        : `/api/docs/search/keyword?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
      return apiGet<{ results: DocResult[] }>(path)
    },
  })

  // Debounce search as user types
  React.useEffect(() => {
    const t = setTimeout(() => {
      try { refetch() } catch {}
    }, 350)
    return () => clearTimeout(t)
  }, [q, mode, orgId, searchLimit, refetch])

  const resultsAll = (data?.results ?? [])
  const results = resultsAll.filter(r => {
    if (!domain) return true
    try { return (r.url || '').includes(domain) } catch { return true }
  })
  .filter(r => !pinnedOnly || !!pinned.find(d => String(d.id) === String(r.id)))
  const domainOptions = React.useMemo(() => {
    const urls = (data?.results ?? []).map(r => r.url || '')
    const hosts = urls.map(u => { try { return new URL(u).host } catch { return '' } }).filter(Boolean)
    return Array.from(new Set(hosts))
  }, [data])

  React.useEffect(() => {
    try { localStorage.setItem('mra_docs_recent', String(recentLimit)) } catch {}
    const u = new URL(window.location.href)
    u.searchParams.set('docs_recent', String(recentLimit))
    window.history.replaceState({}, '', u.toString())
  }, [recentLimit])

  const togglePin = (doc: DocResult) => {
    setPinned(prev => {
      const exists = prev.find(d => String(d.id) === String(doc.id))
      const next = exists ? prev.filter(d => String(d.id) !== String(doc.id)) : [{ id: doc.id, title: doc.title, url: doc.url, snippet: doc.snippet, pinned_at: Date.now() }, ...prev]
      try { localStorage.setItem('mra_pinned_docs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  React.useEffect(() => {
    try { localStorage.setItem('mra_docs_selected', selected ? JSON.stringify(selected) : '') } catch {}
  }, [selected])

  React.useEffect(() => {
    try {
      localStorage.setItem('mra_docs_q', q)
      localStorage.setItem('mra_docs_mode', mode)
      localStorage.setItem('mra_docs_domain', domain || '')
      localStorage.setItem('mra_docs_pinned_only', String(pinnedOnly))
    } catch {}
  }, [q, mode, domain, pinnedOnly])

  const fetchNews = async () => {
    await apiPost('/api/agents/news', { query: q, org: String(orgId) })
    await Promise.all([recent.refetch(), refetch()])
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setToast({ open: true, msg: 'Link copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copySelectedUrl = async () => {
    if (!selected?.url) return
    try { await navigator.clipboard.writeText(selected.url); setToast({ open: true, msg: 'URL copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyApiUrl = async () => {
    const path = mode === 'vector'
      ? `/api/docs/search?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
      : `/api/docs/search/keyword?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
    try { await navigator.clipboard.writeText(path); setToast({ open: true, msg: 'API URL copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlSearch = async () => {
    const path = mode === 'vector'
      ? `/api/docs/search?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
      : `/api/docs/search/keyword?q=${encodeURIComponent(q)}&org_id=${orgId}&limit=${searchLimit}`
    const curl = buildCurl('GET', path)
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlNews = async () => {
    const curl = buildCurl('POST', '/api/agents/news', { query: q, org: String(orgId) })
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlFilings = async () => {
    const curl = buildCurl('POST', '/api/agents/filings', { ticker: ticker || undefined, org: q || undefined })
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const fetchFilings = async () => {
    await apiPost('/api/agents/filings', { ticker: ticker || undefined, org: q || undefined })
    await Promise.all([recent.refetch(), refetch()])
  }

  const showRecent = (!isFetching && !isError && results.length === 0)

  React.useEffect(() => {
    if (!selected && results.length > 0) {
      setSelected(results[0])
      setSelectedIdx(0)
    }
  }, [results])

  const highlight = (text?: string) => {
    if (!text) return ''
    const terms = (q || '').trim().split(/\s+/).filter(Boolean)
    let out = text
    for (const t of terms) {
      try {
        const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
        out = out.replace(re, '<mark>$1</mark>')
      } catch {}
    }
    return out
  }

  return (
    <>
    <Box>
      <Typography variant="h4" gutterBottom>Documents</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField variant="outlined" size="small" placeholder="Search documents" value={q} onChange={e => setQ(e.target.value)}
          InputProps={{ sx: { color: '#F1A501' } }}
          sx={{ input: { color: '#F1A501' }, label: { color: '#F1A501' }, flex: 1 }}
        />
        <ToggleButtonGroup exclusive value={mode} onChange={(_, v) => v && setMode(v)} size="small">
          <ToggleButton value="vector" sx={{ color: '#F1A501', borderColor: '#B30700' }}>Vector</ToggleButton>
          <ToggleButton value="keyword" sx={{ color: '#F1A501', borderColor: '#B30700' }}>Keyword</ToggleButton>
        </ToggleButtonGroup>
        <TextField variant="outlined" size="small" placeholder="Ticker (e.g., ACMEX)" value={ticker} onChange={e => setTicker(e.target.value)}
          InputProps={{ sx: { color: '#F1A501' } }}
          sx={{ input: { color: '#F1A501' }, label: { color: '#F1A501' }, width: 200 }}
        />
        <Tooltip title="Filter results by domain (host)">
          <div>
            <Autocomplete options={domainOptions} value={domain} onChange={(_, v) => setDomain(v)} renderInput={(params) => <TextField {...params} size="small" placeholder="Domain filter" />} sx={{ width: 220 }} />
          </div>
        </Tooltip>
        <FormControlLabel control={<Switch checked={pinnedOnly} onChange={(e) => setPinnedOnly(e.target.checked)} />} label="Pinned only" sx={{ color: '#F1A501' }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={() => refetch()} disabled={isFetching} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Search</Button>
          <Chip size="small" label={`${results.length} results`} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
          <Tooltip title="Max results per search (Ctrl+Enter opens selected)">
            <TextField type="number" size="small" label="Limit" value={searchLimit} onChange={e => { const v = Math.max(1, Math.min(50, Number(e.target.value||10))); setSearchLimit(v); try { localStorage.setItem('mra_docs_limit', String(v)) } catch {} }} sx={{ width: 120 }} />
          </Tooltip>
          <Chip size="small" label={`pinned ${pinned.length}`} sx={{ bgcolor: '#111', border: '1px solid #333', color: '#F1A501' }} />
        </Stack>
        <Button variant="outlined" onClick={fetchNews} disabled={isFetching} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Fetch Recent News</Button>
        {/* Consolidated Share menu */}
        <Button variant="outlined" onClick={(e) => setShareEl(e.currentTarget)} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Share…</Button>
        <Menu anchorEl={shareEl} open={shareOpen} onClose={closeShare} MenuListProps={{ dense: true }}>
          <MenuItem onClick={() => { copyLink(); closeShare() }}>Copy page link</MenuItem>
          <MenuItem onClick={() => { copyApiUrl(); closeShare() }}>Copy API URL (search)</MenuItem>
          <MenuItem onClick={() => { copyCurlSearch(); closeShare() }}>Copy curl (search)</MenuItem>
          <Divider />
          <MenuItem onClick={() => { copyApiRecent(); closeShare() }}>Copy API URL (recent)</MenuItem>
          <MenuItem onClick={() => { copyCurlRecent(); closeShare() }}>Copy curl (recent)</MenuItem>
          <Divider />
          <MenuItem onClick={() => { copyCurlNews(); closeShare() }}>Copy curl (news)</MenuItem>
          <MenuItem onClick={() => { copyCurlFilings(); closeShare() }}>Copy curl (filings)</MenuItem>
          <Divider />
          <MenuItem disabled={!selected?.url} onClick={() => { copySelectedUrl(); closeShare() }}>Copy selected URL</MenuItem>
        </Menu>
        <Button variant="outlined" onClick={() => { setQ(''); setTicker(''); setDomain(null); setSelected(null) }} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Clear</Button>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #B30700', p: 1 }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                const count = results.length || 0
                if (count > 0) {
                  const next = Math.min((selectedIdx < 0 ? -1 : selectedIdx) + 1, count - 1)
                  setSelectedIdx(next)
                  setSelected(results[next])
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                const count = results.length || 0
                if (count > 0) {
                  const next = Math.max((selectedIdx < 0 ? 0 : selectedIdx) - 1, 0)
                  setSelectedIdx(next)
                  setSelected(results[next])
                }
              } else if (e.key === 'Enter') {
                if (selected && selected.url) window.open(selected.url, '_blank')
              } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                if (selected && selected.url) window.open(selected.url, '_blank')
              } else if (e.key.toLowerCase() === 'p') {
                if (selected) togglePin(selected)
              } else if (e.key.toLowerCase() === 'o') {
                if (selected && selected.url) window.open(selected.url, '_blank')
              } else if (e.key.toLowerCase() === 'c') {
                if (selected && selected.url) {
                  try { navigator.clipboard.writeText(selected.url) } catch {}
                }
              } else if (e.key === 'Escape') {
                setSelectedIdx(-1)
                setSelected(null)
              } else if (e.key === '?') {
                setShowHelp(v => !v)
              }
            }}
          >
            {showHelp && (
              <Alert severity="info" sx={{ mb: 1, bgcolor: '#0a0a0a', color: '#F1A501', border: '1px solid #B30700' }}>
                Shortcuts: ↑/↓ select, Enter open, P pin, O open, C copy, Esc clear, ? toggle help
              </Alert>
            )}
            {!!pinned.length && (
              <>
                <Typography variant="subtitle1" sx={{ color: '#B30700', fontFamily: 'Special Elite, serif' }}>Pinned</Typography>
                <List>
                  {isFetching ? (
                    <>
                      <SkeletonBlock height={16} />
                      <SkeletonBlock height={16} />
                      <SkeletonBlock height={16} />
                    </>
                  ) : pinned.map((r) => (
                    <ListItem key={`pin-${r.id}`} button onClick={() => setSelected(r)}>
                      <ListItemText primary={r.title} secondary={r.snippet} sx={{ color: '#F1A501' }} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ borderColor: '#222', my: 1 }} />
              </>
            )}
            {isFetching && <SkeletonBlock height={100} />}
            {isError && <ErrorState message="Search failed. Try again." />}
            {!isFetching && !isError && (
              <>
                <List>
                  {results.map((r, i) => {
                    const pinnedOn = !!pinned.find(d => String(d.id) === String(r.id))
                    return (
                      <ListItem key={r.id} button onClick={() => { setSelected(r); setSelectedIdx(i) }} aria-selected={selectedIdx === i}
                        secondaryAction={
                          <IconButton edge="end" onClick={(e) => { e.stopPropagation(); togglePin(r) }} sx={{ color: '#F1A501' }}>
                            {pinnedOn ? <Star /> : <StarBorder />}
                          </IconButton>
                        }
                        sx={{ bgcolor: selectedIdx === i ? '#1a1a1a' : 'transparent' }}
                      >
                        <ListItemText
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                          primary={<span dangerouslySetInnerHTML={{ __html: highlight(r.title) }} />}
                          secondary={<>
                            <span dangerouslySetInnerHTML={{ __html: highlight(r.snippet) }} />
                            {r.url && (() => { try { const host = new URL(r.url).host; return <span style={{ marginLeft: 8, color: '#888' }}>[{host}]</span> } catch { return null } })()}
                          </>}
                          sx={{ color: '#F1A501' }}
                        />
                      </ListItem>
                    )
                  })}
                  {results.length === 0 && recent.data && recent.data.results && recent.data.results.map((r) => {
                    const pinnedOn = !!pinned.find(d => String(d.id) === String(r.id))
                    return (
                      <ListItem key={`recent-${r.id}`} button onClick={() => setSelected(r)}
                        secondaryAction={
                          <IconButton edge="end" onClick={(e) => { e.stopPropagation(); togglePin(r) }} sx={{ color: '#F1A501' }}>
                            {pinnedOn ? <Star /> : <StarBorder />}
                          </IconButton>
                        }
                      >
                        <ListItemText primary={r.title} secondary={<>
                          {r.snippet}
                          {r.url && (() => { try { const host = new URL(r.url).host; return <span style={{ marginLeft: 8, color: '#888' }}>[{host}]</span> } catch { return null } })()}
                        </>} sx={{ color: '#F1A501' }} />
                      </ListItem>
                    )
                  })}
                  {results.length === 0 && (!recent.data || (recent.data.results || []).length === 0) && (
                    <EmptyState message="No results yet." />
                  )}
                </List>
                {showRecent && (
                  <Box sx={{ textAlign: 'center', pb: 1 }}>
                    <Button size="small" onClick={() => setRecentLimit(l => l + 10)}>Load more</Button>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #B30700', p: 1, minHeight: 240 }}>
            <DocumentViewer doc={selected} onTogglePin={togglePin} isPinned={!!selected && !!pinned.find(d => String(d.id) === String(selected.id))} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="success" sx={{ bgcolor: '#111', color: '#F1A501', border: '1px solid #B30700' }}>{toast.msg}</Alert>
    </Snackbar>
  </>
  )
}

export default Documents
