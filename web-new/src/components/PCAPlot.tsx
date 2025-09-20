import React from 'react'
import Plot from 'plotly.js-dist-min'

type Score = { sample: string; condition?: string; PC1: number; PC2: number }
type Props = { scores: Score[]; variance: { PC1: number; PC2: number } }

const PCAPlot: React.FC<Props> = ({ scores, variance }) => {
  React.useEffect(() => {
    const el = document.getElementById('pcaplot')
    if (!el) return
    const trace = {
      x: scores.map(s => s.PC1),
      y: scores.map(s => s.PC2),
      text: scores.map(s => s.sample),
      mode: 'markers+text',
      type: 'scattergl',
      textposition: 'top center'
    }
    Plot.newPlot(el, [trace], { title: 'PCA', xaxis: { title: `PC1 (${(variance.PC1*100).toFixed(1)}%)` }, yaxis: { title: `PC2 (${(variance.PC2*100).toFixed(1)}%)` } })
  }, [scores, variance])
  return <div id="pcaplot" style={{ width: '100%', height: 400 }} />
}

export default PCAPlot


