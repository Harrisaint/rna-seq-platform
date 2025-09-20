import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { rows: string[]; cols: string[]; values: number[][] | any }

const Heatmap: React.FC<Props> = ({ rows, cols, values }) => {
  React.useEffect(() => {
    const el = document.getElementById('heatmap')
    if (!el) return
    const z = Array.isArray(values) ? (Array.isArray(values[0]) ? values : values.map((r: any) => Object.values(r))) : []
    Plot.newPlot(el, [{ z, x: cols, y: rows, type: 'heatmap' }], { title: 'Top variable features' })
  }, [rows, cols, values])
  return <div id="heatmap" style={{ width: '100%', height: 500 }} />
}

export default Heatmap


