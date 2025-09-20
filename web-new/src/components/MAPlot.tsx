import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { data: { baseMean?: number; log2FC?: number }[] }

const MAPlot: React.FC<Props> = ({ data }) => {
  const x = data.map(d => Math.log10((d.baseMean ?? 1) + 1))
  const y = data.map(d => d.log2FC ?? 0)
  React.useEffect(() => {
    const el = document.getElementById('maplot')
    if (!el) return
    Plot.newPlot(el, [{ x, y, mode: 'markers', type: 'scattergl' }], { title: 'MA', xaxis: { title: 'log10(baseMean+1)' }, yaxis: { title: 'log2FC' } })
  }, [data])
  return <div id="maplot" style={{ width: '100%', height: 400 }} />
}

export default MAPlot


