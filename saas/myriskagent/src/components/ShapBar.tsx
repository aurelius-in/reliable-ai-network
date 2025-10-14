import React from 'react'
import { Box, Typography, Tooltip } from '@mui/material'

export interface ShapItem { name: string; value: number }

interface ShapBarProps {
  items: ShapItem[]
  maxAbs?: number
}

const ShapBar: React.FC<ShapBarProps> = ({ items, maxAbs }) => {
  const maxv = maxAbs || Math.max(1, ...items.map(i => Math.abs(i.value)))
  return (
    <Box>
      {items.map((it, idx) => {
        const w = Math.round((Math.abs(it.value) / maxv) * 100)
        const pos = it.value >= 0
        return (
          <Tooltip key={idx} title={`${it.name}: ${it.value.toFixed(2)}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ width: 220, color: '#F1A501' }} variant="body2">{it.name}</Typography>
              <Box sx={{ flex: 1, height: 10, bgcolor: '#222', position: 'relative', border: '1px solid #333', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, bgcolor: '#444' }} />
                <Box sx={{ position: 'absolute', top: 0, bottom: 0, [pos ? 'left' : 'right']: '50%', width: `${w/2}%`, bgcolor: pos ? '#B30700' : '#0c7bdc' }} />
              </Box>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

export default ShapBar

