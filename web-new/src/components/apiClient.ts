const BASE = import.meta.env.VITE_API_URL || 'https://rna-seq-platform-api.onrender.com'
console.log('API Base URL:', BASE)

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json()
}

export const Api = {
  runs: (mode: 'demo' | 'live' = 'demo') => apiGet<{ sample: string; study?: string; condition?: string }[]>(`/runs?mode=${mode}`),
  qc: (mode: 'demo' | 'live' = 'demo') => apiGet<any>(`/qc/summary?mode=${mode}`),
  de: (params?: URLSearchParams, mode: 'demo' | 'live' = 'demo') => {
    const url = new URL('/de', BASE)
    if (params) {
      params.forEach((value, key) => url.searchParams.set(key, value))
    }
    url.searchParams.set('mode', mode)
    return apiGet<any[]>(url.pathname + url.search)
  },
  pca: (mode: 'demo' | 'live' = 'demo') => apiGet<{ scores: any[]; variance: { PC1: number; PC2: number } }>(`/pca?mode=${mode}`),
  heatmap: (mode: 'demo' | 'live' = 'demo') => apiGet<{ rows: string[]; cols: string[]; values: any }>(`/heatmap?mode=${mode}`),
  gene: (id: string, mode: 'demo' | 'live' = 'demo') => apiGet<any>(`/gene/${encodeURIComponent(id)}?mode=${mode}`),
  provenance: () => apiGet<any>(`/provenance`),
}


