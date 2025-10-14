import React from 'react'
import ReactECharts from 'echarts-for-react'

export interface WaterfallItem {
  name: string
  value: number
}

interface RiskWaterfallProps {
  items: WaterfallItem[]
}

function buildSeries(items: WaterfallItem[]) {
  const base: number[] = []
  const inc: number[] = []
  const dec: number[] = []
  let cumulative = 0
  for (const it of items) {
    base.push(cumulative)
    if (it.value >= 0) {
      inc.push(it.value)
      dec.push(0)
    } else {
      inc.push(0)
      dec.push(-it.value)
    }
    cumulative += it.value
  }
  const labels = items.map(i => i.name)
  return { labels, base, inc, dec }
}

const RiskWaterfall: React.FC<RiskWaterfallProps> = ({ items }) => {
  const { labels, base, inc, dec } = buildSeries(items)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const name = params?.[0]?.axisValue || ''
        const incVal = params?.[1]?.data || 0
        const decVal = params?.[2]?.data || 0
        const v = incVal ? incVal : -decVal
        const dir = v >= 0 ? '↑ risk' : '↓ risk'
        return `${name}: ${v.toFixed(2)} (${dir})`
      },
    },
    xAxis: { type: 'category', data: labels, axisLabel: { color: '#F1A501' } },
    yAxis: { type: 'value', axisLabel: { color: '#F1A501' }, splitLine: { lineStyle: { color: '#222' } } },
    legend: { textStyle: { color: '#F1A501' } },
    series: [
      { // base
        name: 'base',
        type: 'bar',
        stack: 'total',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { color: 'transparent', borderColor: 'transparent' } },
        data: base,
      },
      { name: 'increase', type: 'bar', stack: 'total', itemStyle: { color: '#B30700' }, data: inc },
      { name: 'decrease', type: 'bar', stack: 'total', itemStyle: { color: '#2e7d32' }, data: dec },
    ],
  }
  return <ReactECharts option={option} style={{ height: 280 }} />
}

export default RiskWaterfall
