import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
      if (err?.status === 502 || err?.status === 503 || err?.status === 504) {
        setError('Serviço temporariamente indisponível. Tente novamente em instantes.');
      } else if (err instanceof TypeError) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        setError(err.message);
      }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>#{item.protocolo}</h2>
              <Link to={`/manifestacao/${encodeURIComponent(item.protocolo)}`} className="btn btn-primary">
                Abrir manifestação
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
