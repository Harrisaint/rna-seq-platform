import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { data: { log2FC?: number; padj?: number }[] }

const VolcanoPlot: React.FC<Props> = ({ data }) => {
  const x = data.map(d => d.log2FC ?? 0)
  const y = data.map(d => (d.padj ? -Math.log10(d.padj) : 0))
  React.useEffect(() => {
    const el = document.getElementById('volcano')
    if (!el) return
    Plot.newPlot(el, [{ x, y, mode: 'markers', type: 'scattergl' }], { title: 'Volcano', xaxis: { title: 'log2FC' }, yaxis: { title: '-log10(padj)' } })
  }, [data])
  return <div id="volcano" style={{ width: '100%', height: 400 }} />
}

export default VolcanoPlot


