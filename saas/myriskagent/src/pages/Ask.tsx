import React from 'react'
import { Box, Typography, TextField, Button, Paper, Stack, FormGroup, FormControlLabel, Checkbox, Snackbar, Alert, Chip, Tooltip } from '@mui/material'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { apiPost, buildCurl } from '../lib/api'
import SourceChips from '../components/SourceChips'
import HtmlDialog from '../components/HtmlDialog'
import SanctionsList from '../components/SanctionsList'
import type { SanctionsResp } from '../lib/types'
import { useOrg } from '../context/OrgContext'

interface AskResponse { answer: string; citations: { id: string; title?: string; url?: string }[] }

const Ask: React.FC = () => {
  const { orgId } = useOrg()
  const [question, setQuestion] = React.useState(() => { try { const u = new URL(window.location.href); return u.searchParams.get('ask_q') || localStorage.getItem('mra_ask_question') || '' } catch { return '' } })
  const [answer, setAnswer] = React.useState('')
  const [cites, setCites] = React.useState<AskResponse['citations']>([])
  const [loading, setLoading] = React.useState(false)
  const [reportHtml, setReportHtml] = React.useState('')
  const [openReport, setOpenReport] = React.useState(false)
  const [sanctions, setSanctions] = React.useState<SanctionsResp | null>(null)
  const [scopeNews, setScopeNews] = React.useState<boolean>(() => { try { const u = new URL(window.location.href); const qs = u.searchParams.get('ask_news'); if (qs !== null) return qs === '1'; const v = localStorage.getItem('mra_ask_scope_news'); return v ? v === 'true' : true } catch { return true } })
  const [scopeFilings, setScopeFilings] = React.useState<boolean>(() => { try { const u = new URL(window.location.href); const qs = u.searchParams.get('ask_filings'); if (qs !== null) return qs === '1'; const v = localStorage.getItem('mra_ask_scope_filings'); return v ? v === 'true' : false } catch { return false } })
  const [error, setError] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: '' })
  const [history, setHistory] = React.useState<string[]>(() => { try { const raw = localStorage.getItem('mra_ask_history'); return raw ? JSON.parse(raw) : [] } catch { return [] } })
  const [reqId, setReqId] = React.useState<string>('')
  const [rateLimit, setRateLimit] = React.useState<string>('')
  const [rateRemaining, setRateRemaining] = React.useState<string>('')

  const ask = async () => {
    setLoading(true)
    try {
      const scope = [scopeNews ? 'news' : null, scopeFilings ? 'filings' : null].filter(Boolean)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      try { const k = localStorage.getItem('mra_api_key'); if (k) headers['x-api-key'] = k } catch {}
      const resp = await fetch('/api/ask', { method: 'POST', headers, body: JSON.stringify({ question, org_id: orgId, scope }) })
      setReqId(resp.headers.get('x-request-id') || '')
      setRateLimit(resp.headers.get('x-ratelimit-limit') || '')
      setRateRemaining(resp.headers.get('x-ratelimit-remaining') || '')
      if (resp.status === 401) {
        setAnswer('')
        setCites([])
        setError('Unauthorized. Click "API Key" to set your key, then retry.')
        return
      }
      if (!resp.ok) throw new Error(String(resp.status))
      const res = await resp.json() as AskResponse
      setAnswer(res.answer || '')
      setCites(res.citations || [])
      try { const next = [question, ...history.filter(q => q !== question)].slice(0, 8); setHistory(next); localStorage.setItem('mra_ask_history', JSON.stringify(next)) } catch {}
      setError(null)
    } catch (e) {
      setAnswer('')
      setCites([])
      setError('Ask failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        ask()
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        copyCitations()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setQuestion(''); setAnswer(''); setCites([])
      }
      if (e.key === '?') {
        e.preventDefault()
        setToast({ open: true, msg: 'Shortcuts: Enter=Ask, R=Copy cites, Esc=Clear, API Key button sets x-api-key' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, scopeNews, scopeFilings, cites])

  React.useEffect(() => {
    try { localStorage.setItem('mra_ask_question', question) } catch {}
    const u = new URL(window.location.href)
    if (question) u.searchParams.set('ask_q', question); else u.searchParams.delete('ask_q')
    window.history.replaceState({}, '', u.toString())
  }, [question])

  React.useEffect(() => {
    try {
      localStorage.setItem('mra_ask_scope_news', String(scopeNews))
      localStorage.setItem('mra_ask_scope_filings', String(scopeFilings))
    } catch {}
    const u = new URL(window.location.href)
    u.searchParams.set('ask_news', scopeNews ? '1' : '0')
    u.searchParams.set('ask_filings', scopeFilings ? '1' : '0')
    window.history.replaceState({}, '', u.toString())
  }, [scopeNews, scopeFilings])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setToast({ open: true, msg: 'Link copied' })
    } catch {
      setToast({ open: true, msg: 'Copy failed' })
    }
  }

  const copyCurlAsk = async () => {
    const scope = [scopeNews ? 'news' : null, scopeFilings ? 'filings' : null].filter(Boolean)
    const curl = buildCurl('POST', '/api/ask', { question, org_id: orgId, scope })
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlExec = async () => {
    const curl = buildCurl('POST', `/api/report/executive/${orgId}/latest`, {})
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlFull = async () => {
    const curl = buildCurl('POST', `/api/report/full/${orgId}/latest`, {})
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const copyCurlSanctions = async () => {
    const curl = buildCurl('POST', '/api/agents/sanctions', { name: question || 'ACME' })
    try { await navigator.clipboard.writeText(curl); setToast({ open: true, msg: 'curl copied' }) } catch { setToast({ open: true, msg: 'Copy failed' }) }
  }

  const execBrief = async () => {
    setLoading(true)
    try {
      const res = await apiPost<{ html: string; summary: any }>(`/api/report/executive/${orgId}/latest`, {})
      setReportHtml(`<div style='padding:12px'><h3 style='color:#B30700;font-family:Special Elite,serif'>Executive Brief</h3>${res.html}</div>\n`)
      setOpenReport(true)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const fullReport = async () => {
    setLoading(true)
    try {
      const res = await apiPost<{ html: string; summary: any }>(`/api/report/full/${orgId}/latest`, {})
      setReportHtml(`<div style='padding:12px'><h3 style='color:#B30700;font-family:Special Elite,serif'>Full Report</h3>${res.html}</div>\n`)
      setOpenReport(true)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const checkSanctions = async () => {
    setLoading(true)
    try {
      const res = await apiPost<SanctionsResp>('/api/agents/sanctions', { name: question || 'ACME' })
      setSanctions(res)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async () => {
    const resp = await fetch(`/api/report/pdf/${orgId}/latest`)
    if (!resp.ok) return
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${orgId}_latest.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyCitations = async () => {
    if (!cites || cites.length === 0) return
    const md = cites.map(c => `- [${c.id}](${c.url || ''}) ${c.title || ''}`.trim()).join('\n')
    try {
      await navigator.clipboard.writeText(md)
      setToast({ open: true, msg: 'Citations copied' })
    } catch {
      setToast({ open: true, msg: 'Copy failed' })
    }
  }

  const downloadEvidenceJson = async () => {
    if (!cites || cites.length === 0) return
    const json = JSON.stringify({ question, citations: cites }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'evidence.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyAnswerMarkdown = async () => {
    if (!answer) return
    try {
      // Convert minimal HTML to Markdown: links and line breaks
      let md = answer
      md = md.replace(/<a\s+href=\"([^\"]+)\"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      md = md.replace(/<br\s*\/?>(\n)?/gi, '\n')
      md = md.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '# $1\n')
      md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
      md = md.replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, '')
      md = md.replace(/<[^>]+>/g, '')
      await navigator.clipboard.writeText(md)
      setToast({ open: true, msg: 'Answer copied' })
    } catch {
      setToast({ open: true, msg: 'Copy failed' })
    }
  }

  return (
    <Box>
      {/* Input row */}
      <Stack direction="column" spacing={1} sx={{ mb: 2, alignItems: 'stretch' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a question (e.g., ACME risks this quarter)"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          InputProps={{ sx: {
            '& .MuiOutlinedInput-input': { color: '#000', caretColor: '#000', fontWeight: 700 },
          } }}
          sx={{
            '& .MuiOutlinedInput-root': { backgroundColor: '#fff' },
            '& .MuiOutlinedInput-input': { color: '#000', caretColor: '#000', fontWeight: 700 },
            '& .MuiOutlinedInput-input::placeholder': { color: '#000', opacity: 1, fontWeight: 400 },
          }}
        />
        <Button
          variant="contained"
          onClick={ask}
          disabled={loading}
          sx={{
            alignSelf: 'center',
            color: '#F1A501',
            borderColor: '#B30700',
            minWidth: 220,
            fontFamily: 'Special Elite, serif',
            fontSize: 22,
            letterSpacing: 0.5,
            px: 3,
            py: 1.2,
          }}
        >
          Investigate
        </Button>
      </Stack>

      {/* Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Paper sx={{ p: 1.5, bgcolor: '#111', border: '1px solid #B30700', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 0.5 }}>Scope</Typography>
          <FormGroup row>
            <FormControlLabel control={<Checkbox checked={scopeNews} onChange={e => setScopeNews(e.target.checked)} sx={{ color: '#F1A501' }} />} label="News" sx={{ color: '#F1A501' }} />
            <FormControlLabel control={<Checkbox checked={scopeFilings} onChange={e => setScopeFilings(e.target.checked)} sx={{ color: '#F1A501' }} />} label="Filings" sx={{ color: '#F1A501' }} />
          </FormGroup>
        </Paper>
        <Paper sx={{ p: 1.5, bgcolor: '#111', border: '1px solid #B30700', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 0.5 }}>Reports</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={execBrief} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Executive Brief</Button>
            <Button variant="outlined" onClick={fullReport} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Full Report</Button>
            <Button variant="outlined" onClick={downloadPdf} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Download PDF</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 1.5, bgcolor: '#111', border: '1px solid #B30700', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 0.5 }}>Integrations</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={checkSanctions} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Sanctions</Button>
            <Button variant="outlined" onClick={copyLink} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Copy Link</Button>
            <Button variant="outlined" onClick={() => setToast({ open: true, msg: 'Shortcuts: Enter=Ask, R=Copy cites, Esc=Clear, ?=Help' })} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Help</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 1.5, bgcolor: '#111', border: '1px solid #B30700', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 0.5 }}>Developer</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Copy curl for Ask POST"><span><Button variant="outlined" onClick={copyCurlAsk} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>curl: Ask</Button></span></Tooltip>
            <Tooltip title="Copy curl for executive report"><span><Button variant="outlined" onClick={copyCurlExec} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>curl: Exec</Button></span></Tooltip>
            <Tooltip title="Copy curl for full report"><span><Button variant="outlined" onClick={copyCurlFull} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>curl: Full</Button></span></Tooltip>
            <Tooltip title="Copy curl for sanctions agent"><span><Button variant="outlined" onClick={copyCurlSanctions} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>curl: Sanctions</Button></span></Tooltip>
            <Button variant="outlined" onClick={() => {
              const val = prompt('Enter API Key (stored locally)') || ''
              try { if (val) localStorage.setItem('mra_api_key', val); else localStorage.removeItem('mra_api_key') } catch {}
            }} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>API Key</Button>
            <Button variant="outlined" onClick={() => { try { localStorage.removeItem('mra_ask_history'); setHistory([]) } catch {} }} disabled={loading} sx={{ color: '#F1A501', borderColor: '#B30700' }}>Clear History</Button>
          </Stack>
        </Paper>
      </Stack>
      {!!history.length && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          {history.map((h, i) => (
            <Chip key={i} label={h} onClick={() => setQuestion(h)} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
          ))}
        </Stack>
      )}
      {error && <ErrorState message={error} />}
      {!error && !answer && !loading && <EmptyState message="Ask a question to get started." />}
      {answer && (
        <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #B30700', mb: 2, '& h1,& h2,& h3': { fontFamily: 'Special Elite, serif', color: '#B30700' }, '& p, & li': { color: '#F1A501' } }}>
          <div style={{ color: '#F1A501', marginBottom: 8, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: answer }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Citations from the answer">
                <span><SourceChips items={cites} /></span>
              </Tooltip>
              <Tooltip title="Number of citations">
                <Chip size="small" label={`${cites.length} cites`} sx={{ bgcolor: '#111', border: '1px solid #B30700', color: '#F1A501' }} />
              </Tooltip>
              {reqId && (
                <Tooltip title="Request ID (click to copy)">
                  <Chip size="small" onClick={() => { try { navigator.clipboard.writeText(reqId); setToast({ open: true, msg: 'RID copied' }) } catch {} }} label={`rid ${reqId.slice(0,8)}`} sx={{ bgcolor: '#111', border: '1px solid #333', color: '#F1A501', cursor: 'pointer' }} />
                </Tooltip>
              )}
              {rateLimit && (
                <Tooltip title="Rate remaining/limit in the last minute">
                  <Chip size="small" label={`rl ${rateRemaining}/${rateLimit}`} sx={{ bgcolor: '#111', border: '1px solid #333', color: '#F1A501' }} />
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={copyAnswerMarkdown}>Copy Answer</Button>
              <Button size="small" onClick={copyCitations}>Copy Citations</Button>
              <Button size="small" onClick={downloadEvidenceJson}>Download JSON</Button>
              <Button size="small" onClick={() => { setAnswer(''); setCites([]) }}>Clear</Button>
            </Stack>
          </Stack>
          {(reqId || rateLimit) && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              {reqId && <Typography variant="caption" sx={{ color: '#888' }}>rid: {reqId}</Typography>}
              {rateLimit && <Typography variant="caption" sx={{ color: '#888' }}>rate: {rateRemaining}/{rateLimit}</Typography>}
            </Box>
          )}
        </Paper>
      )}
      {sanctions && <SanctionsList items={sanctions.flags || []} />}
      <HtmlDialog open={openReport} onClose={() => setOpenReport(false)} title="Report" html={reportHtml} />
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#111', color: '#F1A501', border: '1px solid #B30700' }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Ask
