import React from 'react'
import { Button } from '@mui/material'

const NotFound: React.FC = () => {
  return (
    <div style={{ color: '#F1A501' }}>
      <h1 style={{ color: '#B30700', fontFamily: 'Special Elite, serif' }}>404</h1>
      <p>Page not found.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outlined" href="/" sx={{ color: '#F1A501', borderColor: '#B30700' }}>Home</Button>
        <Button variant="outlined" href="/api/status" sx={{ color: '#F1A501', borderColor: '#B30700' }}>Status</Button>
      </div>
    </div>
  )
}

export default NotFound
