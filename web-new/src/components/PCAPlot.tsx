import React from 'react'

type Score = { sample: string; condition?: string; PC1: number; PC2: number }
type Props = { scores: Score[]; variance: { PC1: number; PC2: number } }

const PCAPlot: React.FC<Props> = ({ scores, variance }) => {
  React.useEffect(() => {
    const el = document.getElementById('pcaplot')
    if (!el) return
    
    // Ensure data is properly formatted and convert to numbers
    const x = scores.map(s => Number(s.PC1)).filter(n => !isNaN(n))
    const y = scores.map(s => Number(s.PC2)).filter(n => !isNaN(n))
    const text = scores.map(s => String(s.sample || ''))
    
    if (x.length === 0 || y.length === 0) {
      console.warn('No valid PCA data to plot')
      return
    }
    
    const trace = {
      x: x,
      y: y,
      text: text,
      mode: 'markers+text',
      type: 'scatter',
      textposition: 'top center',
      marker: {
        size: 10,
        color: 'blue'
      }
    }
    
    // Lazy-load Plotly in the browser to avoid any SSR/import glitches
    import('plotly.js-dist-min')
      .then((Plot) => {
        // Some bundlers default-export the module, others don't
        const Lib: any = (Plot as any).default ?? Plot
        Lib.newPlot(el, [trace], {
          title: 'PCA',
          xaxis: { title: `PC1 (${(variance.PC1 * 100).toFixed(1)}%)` },
          yaxis: { title: `PC2 (${(variance.PC2 * 100).toFixed(1)}%)` },
          margin: { t: 50, b: 50, l: 50, r: 50 }
        })
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to render PCA plot:', err)
      })
  }, [scores, variance])
  return <div id="pcaplot" style={{ width: '100%', height: 400 }} />
}

export default PCAPlot


