const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json()
}

export const Api = {
  runs: () => apiGet<{ sample: string; study?: string; condition?: string }[]>(`/runs`),
  qc: () => apiGet<any>(`/qc/summary`),
  de: (params?: URLSearchParams) => apiGet<any[]>(`/de${params ? `?${params}` : ''}`),
  pca: () => apiGet<{ scores: any[]; variance: { PC1: number; PC2: number } }>(`/pca`),
  heatmap: () => apiGet<{ rows: string[]; cols: string[]; values: any }>(`/heatmap`),
  gene: (id: string) => apiGet<any>(`/gene/${encodeURIComponent(id)}`),
  provenance: () => apiGet<any>(`/provenance`),
}





