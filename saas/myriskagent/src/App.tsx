import React from 'react'
import { AppBar, Box, CssBaseline, LinearProgress, Tab, Tabs, Toolbar, Typography, Chip, Button, Snackbar, Alert, Tooltip } from '@mui/material'
import { buildCurl } from './lib/api'
import { QueryClientProvider, useQuery, useIsFetching } from '@tanstack/react-query'
import { queryClient } from './lib/query'
import Overview from './pages/Overview'
import Documents from './pages/Documents'
import Scores from './pages/Scores'
import Ask from './pages/Ask'
import Providers from './pages/Providers'
import Drivers from './pages/Drivers'
import Status from './pages/Status'
import NavLogo from './components/NavLogo'
import AboutDialog from './components/AboutDialog'
import { OrgProvider, useOrg } from './context/OrgContext'
import ErrorBoundary from './components/ErrorBoundary'

function a11yProps(index: number) {
  return {
    id: `mra-tab-${index}`,
    'aria-controls': `mra-tabpanel-${index}`,
  }
}

const OrgSelector: React.FC = () => {
  const { orgName, setOrg } = useOrg()
  // Realistic mock orgs for demo; picked to feel familiar across industries
  const orgs = [
    { id: 1, name: 'ACME' },
    { id: 2, name: 'Globex' },
    { id: 3, name: 'Initech' },
    { id: 4, name: 'Umbrella' },
  ]
  if (orgs.length <= 1) return null
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mr: 1, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #333', borderRadius: 1, px: 1, py: 0.5 }}>
      <Typography variant="caption" sx={{ color: '#aaa', fontVariant: 'small-caps', letterSpacing: 0.5, mr: 0.5 }}>Clients</Typography>
      {orgs.map(o => (
        <Chip key={o.id}
          size="small"
          label={o.name}
          onClick={() => setOrg(o.id, o.name)}
          sx={{ bgcolor: orgName === o.name ? '#222' : '#000', border: '1px solid #333', color: '#F1A501', cursor: 'pointer' }}
          variant={orgName === o.name ? 'filled' : 'outlined'}
        />
      ))}
    </Box>
  )
}

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt: 4, py: 1, borderTop: '1px solid #333', color: '#F1A501', textAlign: 'center' }}>
      <small>
        MyRiskAgent · <a href="/LICENSE" style={{ color: '#F1A501' }}>license</a>
      </small>
    </Box>
  )
}

const App: React.FC = () => {
  const [tab, setTab] = React.useState<number>(0)
  const isFetchingAny = useIsFetching() > 0
  const { data: health } = useQuery({
    queryKey: ['healthz'],
    queryFn: async () => {
      try { const r = await fetch('/api/healthz'); if (!r.ok) return { status: 'down' }; return r.json() } catch { return { status: 'down' } }
    },
    refetchInterval: 30000,
  })
  const { data: ready } = useQuery({
    queryKey: ['ready'],
    queryFn: async () => { try { const r = await fetch('/api/ready'); return { ok: r.status === 200 } } catch { return { ok: false } } },
    refetchInterval: 60000,
  })
  // version chip removed

  // No persistence: always default to Overview on reload

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey) {
        const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6 }
        const idx = map[e.key]
        if (idx !== undefined) {
          e.preventDefault()
          setTab(idx)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const [aboutOpen, setAboutOpen] = React.useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <OrgProvider>
        <Box sx={{ bgcolor: 'black', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar sx={{ gap: 1 }}>
              <NavLogo />
              <Box sx={{ width: 8 }} />
              {/* version chip removed */}
              {/* Hide raw health/ready badges in demo; keep space clean */}
              <OrgSelector />
              {(() => { let hasKey = false; try { hasKey = !!localStorage.getItem('mra_api_key') } catch {} return hasKey })() && (
                <Chip size="small" onClick={() => { try { localStorage.removeItem('mra_api_key') } catch {} }} label="auth: key set (click to clear)" sx={{ bgcolor: '#111', border: '1px solid #333', color: '#F1A501', mr: 1, cursor: 'pointer' }} />
              )}
              {/* OpenAPI link hidden for demos */}
              {/* Keep a small gap where About used to live to separate menus */}
              <Box sx={{ width: 8 }} />
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
              >
                <Tab label="Overview" {...a11yProps(0)} title="Alt+1" sx={{ color: '#F1A501' }} />
                <Tab label="Scores" {...a11yProps(1)} title="Alt+2" sx={{ color: '#F1A501' }} />
                <Tab label="Drivers" {...a11yProps(2)} title="Alt+3" sx={{ color: '#F1A501' }} />
                <Tab label="Documents" {...a11yProps(3)} title="Alt+4" sx={{ color: '#F1A501' }} />
                <Tab label="Ask" {...a11yProps(4)} title="Alt+5" sx={{ color: '#F1A501' }} />
                <Tab label="Providers" {...a11yProps(5)} title="Alt+6" sx={{ color: '#F1A501' }} />
                <Tab label="Status" {...a11yProps(6)} title="Alt+7" sx={{ color: '#F1A501' }} />
              </Tabs>
              {/* Push About button to far right */}
              <Box sx={{ flexGrow: 1 }} />
              <Button size="small" onClick={() => setAboutOpen(true)} sx={{ color: '#F1A501', borderColor: '#B30700', ml: 1 }} variant="outlined">About</Button>
            </Toolbar>
            {isFetchingAny && <LinearProgress color="secondary" />}
          </AppBar>
          <Box sx={{ p: 2, flex: 1 }}>
            <ErrorBoundary>
              {tab === 0 && <Overview />}
              {tab === 1 && <Scores />}
              {tab === 2 && <Drivers />}
              {tab === 3 && <Documents />}
              {tab === 4 && <Ask />}
              {tab === 5 && <Providers />}
              {tab === 6 && <Status />}
            </ErrorBoundary>
          </Box>
          <Footer />
          <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
        </Box>
      </OrgProvider>
    </QueryClientProvider>
  )
}

export default App
