const BASE = import.meta.env.VITE_API_URL || '/api';

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  info: () => fetch(`${BASE}`).then(handle),
  health: () => fetch(`${BASE}/health`).then(handle),
  listManifestacoes: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetch(`${BASE}/manifestacoes${suffix}`).then(handle);
  },
  getManifestacao: (id) => fetch(`${BASE}/manifestacoes/${id}`).then(handle),
  getByProtocolo: (protocolo) => fetch(`${BASE}/manifestacoes/protocolo/${encodeURIComponent(protocolo)}`).then(handle),
  createManifestacao: (data) =>
    fetch(`${BASE}/manifestacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
  updateManifestacao: (id, data) =>
    fetch(`${BASE}/manifestacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
  deleteManifestacao: (id) =>
    fetch(`${BASE}/manifestacoes/${id}`, { method: 'DELETE' }).then(handle),
  listTurmas: () => fetch(`${BASE}/turmas`).then(handle),
  createTurma: (data) =>
    fetch(`${BASE}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
};
