function apiHeaders() {
  const headers: Record<string, string> = {}
  try {
    const key = localStorage.getItem('mra_api_key')
    if (key) headers['x-api-key'] = key
  } catch {}
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = (typeof window !== 'undefined' && (window as any).localStorage?.getItem('mra_api_base')) || ''
  const url = path.startsWith('/api') ? `${base}${path}` : `${base}/api${path}`
  const res = await fetch(url, { headers: apiHeaders() })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const base = (typeof window !== 'undefined' && (window as any).localStorage?.getItem('mra_api_base')) || ''
  const url = path.startsWith('/api') ? `${base}${path}` : `${base}/api${path}`
  const res = await fetch(url , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...apiHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    throw new Error('401 Unauthorized: set API key via Ask page button')
  }
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const base = (typeof window !== 'undefined' && (window as any).localStorage?.getItem('mra_api_base')) || ''
  const url = path.startsWith('/api') ? `${base}${path}` : `${base}/api${path}`
  const res = await fetch(url, { headers: apiHeaders() })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.blob()
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'

export function buildCurl(method: HttpMethod, path: string, body?: unknown): string {
  const base = (typeof window !== 'undefined' && (window as any).localStorage?.getItem('mra_api_base')) || ''
  const url = path.startsWith('/api') ? `${base}${path}` : `${base}/api${path}`
  const absoluteUrl = (typeof window !== 'undefined' && (window as any).location) ? `${window.location.origin}${url}` : url
  const parts: string[] = ['curl', '-sS']
  if (method !== 'GET') {
    parts.push('-X', method)
  }
  try {
    const key = localStorage.getItem('mra_api_key')
    if (key) parts.push('-H', `"x-api-key: ${key}"`)
  } catch {}
  if ((method === 'POST' || method === 'PUT') && body !== undefined) {
    parts.push('-H', '"Content-Type: application/json"')
    try {
      const json = JSON.stringify(body).replace(/"/g, '\\"')
      parts.push('--data', `"${json}"`)
    } catch {}
  }
  parts.push(`"${absoluteUrl}"`)
  return parts.join(' ')
}
