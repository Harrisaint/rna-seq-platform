import React from 'react'
import Plot from 'plotly.js-dist-min'

type Props = { rows: string[]; cols: string[]; values: number[][] | any }

const Heatmap: React.FC<Props> = ({ rows, cols, values }) => {
  React.useEffect(() => {
    const el = document.getElementById('heatmap')
    if (!el) return
    
    const z = Array.isArray(values) ? (Array.isArray(values[0]) ? values : values.map((r: any) => Object.values(r))) : []
    
    if (z.length === 0 || rows.length === 0 || cols.length === 0) {
      console.warn('No valid heatmap data')
      return
    }
    
    import('plotly.js-dist-min')
      .then((Plot) => {
        const Lib: any = (Plot as any).default ?? Plot
        Lib.newPlot(el, [{ z, x: cols, y: rows, type: 'heatmap' }], { 
          title: 'Top variable features',
          margin: { t: 50, b: 50, l: 50, r: 50 }
        })
      })
      .catch((err) => {
        console.error('Failed to render heatmap:', err)
      })
  }, [rows, cols, values])
  return <div id="heatmap" style={{ width: '100%', height: 500 }} />
}

export default Heatmap


