import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const STATUS = ['aberta', 'em_analise', 'respondida', 'concluida', 'arquivada'];

export default function Painel() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: '', tipo: '', q: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [resposta, setResposta] = useState('');
  const [status, setStatus] = useState('aberta');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await api.listManifestacoes(filters);
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []); // eslint-disable-line

  function applyFilters(e) {
    e.preventDefault();
    refresh();
  }

  function startEdit(item) {
    setEditing(item);
    setStatus(item.status);
    setResposta(item.resposta || '');
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await api.updateManifestacao(editing.id, { status, resposta });
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir manifestação?')) return;
    try {
      await api.deleteManifestacao(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1>Painel de manifestações</h1>
        <p className="muted">Gestão das manifestações recebidas pela ouvidoria.</p>

        <form onSubmit={applyFilters} className="card form" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label>
              Status
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Todos</option>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Tipo
              <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
                <option value="">Todos</option>
                {['denuncia', 'reclamacao', 'sugestao', 'elogio', 'solicitacao'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Busca
              <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="protocolo, título..." />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Filtrar</button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Carregando…</p>
        ) : items.length === 0 ? (
          <p className="muted">Nenhuma manifestação encontrada.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((m) => (
              <div className="card" key={m.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>#{m.protocolo || m.id} — {m.titulo}</strong>
                    <small className="muted" style={{ display: 'block' }}>{m.tipo} · {m.setor || '—'} · {new Date(m.createdAt).toLocaleString('pt-BR')}</small>
                    <p style={{ margin: '6px 0' }}>{m.descricao}</p>
                    {m.nome && <small className="muted">De: {m.nome} {m.contato ? `(${m.contato})` : ''}</small>}
                    {m.anonimo && <small className="muted">Anônimo</small>}
                    <div style={{ marginTop: 6 }}><span className="badge">{m.status}</span></div>
                    {m.resposta && <p style={{ marginTop: 8, fontStyle: 'italic' }}>Resposta: {m.resposta}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <button className="btn btn-secondary" onClick={() => startEdit(m)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(m.id)}>Excluir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="card" style={{ marginTop: 16 }}>
            <h2>Editar #{editing.protocolo}</h2>
            <div className="form">
              <label>
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Resposta
                <textarea value={resposta} onChange={(e) => setResposta(e.target.value)} rows={3} />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={saveEdit}>Salvar</button>
                <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
