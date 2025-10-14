import React from 'react'
import { useQuery } from '@tanstack/react-query'

const NavLogo: React.FC = () => {
  const { data } = useQuery({ queryKey: ['version'], queryFn: async () => (await fetch('/api/version')).json() })
  const v = React.useMemo(() => {
    try {
      const ver = (data?.version || data?.git || data?.app || '') as string
      if (typeof ver === 'string' && ver.length > 0) return `?v=${encodeURIComponent(ver)}`
    } catch {}
    return `?v=${Date.now()}`
  }, [data])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src={`/assets/mra-banner.png${v}`} alt="MyRiskAgent" style={{ height: 100, width: 'auto' }} />
    </div>
  )
}

export default NavLogo
