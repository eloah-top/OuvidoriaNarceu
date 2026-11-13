import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function ConsultarProtocolo() {
  const [params, setParams] = useSearchParams();
  const [protocolo, setProtocolo] = useState(params.get('protocolo') || '');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function buscar(p = protocolo) {
    if (!p) return;
    setLoading(true);
    setError('');
    setItem(null);
    try {
      const data = await api.getByProtocolo(p.trim());
      setItem(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const p = params.get('protocolo');
    if (p) {
      setProtocolo(p);
      buscar(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setParams(protocolo ? { protocolo } : {});
    await buscar();
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Consultar protocolo</h1>
        <p className="muted">Informe o protocolo recebido ao registrar sua manifestação.</p>

        <form onSubmit={onSubmit} className="card form" style={{ marginBottom: 16 }}>
          <label>
            Protocolo
            <input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="NRC-2026-0001" required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando…' : 'Consultar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {item && (
          <div className="card">
            <h2>#{item.protocolo}</h2>
            <p><strong>Tipo:</strong> {item.tipo}</p>
            <p><strong>Status:</strong> <span className="badge">{item.status}</span></p>
            <p><strong>Título:</strong> {item.titulo}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            {item.setor && <p><strong>Setor:</strong> {item.setor}</p>}
            <p><strong>Criado em:</strong> {new Date(item.createdAt).toLocaleString('pt-BR')}</p>
            {item.resposta && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--blue-05)', borderRadius: 8 }}>
                <strong>Resposta:</strong>
                <p>{item.resposta}</p>
                {item.respondedAt && <small className="muted">{new Date(item.respondedAt).toLocaleString('pt-BR')}</small>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
