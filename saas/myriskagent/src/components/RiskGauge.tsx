import React from 'react'
import ReactECharts from 'echarts-for-react'

interface RiskGaugeProps {
  label: string
  value: number
  height?: number
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ label, value, height }) => {
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 100,
        center: ['50%', '65%'],
        radius: '110%',
        progress: { show: true, width: 10, itemStyle: { color: '#B30700' } },
        axisLine: { lineStyle: { width: 10, color: [[1, '#333']] } },
        pointer: { show: true, length: '65%' },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: '#F1A501',
          distance: -10,
          formatter: (val: number) => (val === 25 || val === 50 || val === 75 ? String(val) : ''),
        },
        detail: { show: false },
        data: [{ value, name: '' }],
        title: { show: false },
      },
    ],
  }
  return (
    <div>
      <ReactECharts option={option} style={{ height: height ?? 180 }} />
      <div style={{ textAlign: 'center', marginTop: -2 }}>
        <div style={{ color: '#F1A501', fontSize: 20, lineHeight: 1 }}>{value.toFixed(1)}</div>
        <div style={{ color: '#F1A501' }}>{label}</div>
      </div>
    </div>
  )
}

export default RiskGauge
