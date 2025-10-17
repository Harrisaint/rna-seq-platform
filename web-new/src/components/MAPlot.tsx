import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { data: { baseMean?: number; log2FC?: number }[] }

const MAPlot: React.FC<Props> = ({ data }) => {
  React.useEffect(() => {
    const el = document.getElementById('maplot')
    if (!el) return
    
    const x = data.map(d => Math.log10((d.baseMean ?? 1) + 1))
    const y = data.map(d => d.log2FC ?? 0)
    
    if (x.length === 0 || y.length === 0) {
      console.warn('No valid MA plot data')
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
            x: upSig.map(d => Math.log10((d.baseMean ?? 1) + 1)),
            y: upSig.map(d => d.log2FC ?? 0),
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
            x: downSig.map(d => Math.log10((d.baseMean ?? 1) + 1)),
            y: downSig.map(d => d.log2FC ?? 0),
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
            x: nonSig.map(d => Math.log10((d.baseMean ?? 1) + 1)),
            y: nonSig.map(d => d.log2FC ?? 0),
            mode: 'markers',
            type: 'scatter',
            name: 'Non-significant',
            marker: { color: 'gray', size: 6, opacity: 0.6 }
          })
        }
        
        // Add zero line
        const shapes = [
          { type: 'line', x0: Math.min(...x), x1: Math.max(...x), y0: 0, y1: 0, line: { color: 'black', dash: 'dash' } }
        ]
        
        Lib.newPlot(el, traces, { 
          title: 'MA Plot - Mean vs Log2 Fold Change', 
          xaxis: { 
            title: 'log10(Base Mean + 1)',
            titlefont: { size: 14 },
            tickfont: { size: 12 }
          }, 
          yaxis: { 
            title: 'log2 Fold Change',
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
        console.error('Failed to render MA plot:', err)
      })
  }, [data])
  
  return <div id="maplot" style={{ width: '100%', height: 400 }} />
}

export default MAPlot


