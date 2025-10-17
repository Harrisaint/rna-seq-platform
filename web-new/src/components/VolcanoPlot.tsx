import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { data: { log2FC?: number; padj?: number }[] }

const VolcanoPlot: React.FC<Props> = ({ data }) => {
  React.useEffect(() => {
    const el = document.getElementById('volcano')
    if (!el) return
    
    const x = data.map(d => Number(d.log2FC ?? 0)).filter(n => !isNaN(n))
    const y = data.map(d => Number(d.padj ? -Math.log10(d.padj) : 0)).filter(n => !isNaN(n))
    
    if (x.length === 0 || y.length === 0) {
      console.warn('No valid volcano plot data')
      return
    }
    
    import('plotly.js-dist-min')
      .then((Plot) => {
        const Lib: any = (Plot as any).default ?? Plot
        
        // Create traces with different colors based on significance
        const traces = []
        
        // Significant up-regulated (red)
        const upSig = data.filter(d => d.log2FC > 0 && d.padj < 0.05)
        if (upSig.length > 0) {
          traces.push({
            x: upSig.map(d => d.log2FC),
            y: upSig.map(d => -Math.log10(d.padj)),
            mode: 'markers',
            type: 'scatter',
            name: 'Up-regulated',
            marker: { color: 'red', size: 8 }
          })
        }
        
        // Significant down-regulated (blue)
        const downSig = data.filter(d => d.log2FC < 0 && d.padj < 0.05)
        if (downSig.length > 0) {
          traces.push({
            x: downSig.map(d => d.log2FC),
            y: downSig.map(d => -Math.log10(d.padj)),
            mode: 'markers',
            type: 'scatter',
            name: 'Down-regulated',
            marker: { color: 'blue', size: 8 }
          })
        }
        
        // Non-significant (gray)
        const nonSig = data.filter(d => d.padj >= 0.05)
        if (nonSig.length > 0) {
          traces.push({
            x: nonSig.map(d => d.log2FC),
            y: nonSig.map(d => -Math.log10(Math.max(d.padj, 1e-10))),
            mode: 'markers',
            type: 'scatter',
            name: 'Non-significant',
            marker: { color: 'gray', size: 6, opacity: 0.6 }
          })
        }
        
        // Add significance lines
        const shapes = [
          { type: 'line', x0: 0, x1: 0, y0: 0, y1: Math.max(...y), line: { color: 'black', dash: 'dash' } },
          { type: 'line', x0: -2, x1: 2, y0: -Math.log10(0.05), y1: -Math.log10(0.05), line: { color: 'black', dash: 'dash' } }
        ]
        
        Lib.newPlot(el, traces, { 
          title: 'Volcano Plot - Differential Expression', 
          xaxis: { 
            title: 'log2 Fold Change',
            titlefont: { size: 14 },
            tickfont: { size: 12 }
          }, 
          yaxis: { 
            title: '-log10(Adjusted P-value)',
            titlefont: { size: 14 },
            tickfont: { size: 12 }
          },
          margin: { t: 60, b: 80, l: 80, r: 60 },
          shapes: shapes,
          showlegend: true,
          legend: { 
            x: 0.02, 
            y: 0.98,
            font: { size: 12 }
          },
          width: el.offsetWidth,
          height: 500
        })
      })
      .catch((err) => {
        console.error('Failed to render volcano plot:', err)
      })
  }, [data])
  return <div id="volcano" style={{ width: '100%', height: 400 }} />
}

export default VolcanoPlot


