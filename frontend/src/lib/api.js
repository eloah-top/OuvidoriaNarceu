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
  listManifestacoes: () => fetch(`${BASE}/manifestacoes`).then(handle),
  createManifestacao: (data) =>
    fetch(`${BASE}/manifestacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),
  deleteManifestacao: (id) =>
    fetch(`${BASE}/manifestacoes/${id}`, { method: 'DELETE' }).then(handle),
};
