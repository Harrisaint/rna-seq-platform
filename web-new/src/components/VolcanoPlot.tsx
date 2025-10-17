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
        Lib.newPlot(el, [{ x, y, mode: 'markers', type: 'scatter' }], { 
          title: 'Volcano', 
          xaxis: { title: 'log2FC' }, 
          yaxis: { title: '-log10(padj)' },
          margin: { t: 50, b: 50, l: 50, r: 50 }
        })
      })
      .catch((err) => {
        console.error('Failed to render volcano plot:', err)
      })
  }, [data])
  return <div id="volcano" style={{ width: '100%', height: 400 }} />
}

export default VolcanoPlot


