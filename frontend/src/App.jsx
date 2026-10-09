import { useEffect, useState } from 'react';
import { api } from './lib/api.js';
import './App.css';

const TIPOS = ['denuncia', 'reclamacao', 'sugestao', 'elogio', 'solicitacao'];

const initialForm = { tipo: 'reclamacao', titulo: '', descricao: '' };

export default function App() {
  const [health, setHealth] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setError('');
      const [h, list] = await Promise.all([api.health(), api.listManifestacoes()]);
      setHealth(h);
      setItems(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await api.createManifestacao(form);
      setForm(initialForm);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    try {
      await api.deleteManifestacao(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>OuvidoriaNarceu</h1>
          <p>Template React + Vite conectado ao Express.</p>
        </div>
        <span className={`badge ${health ? 'ok' : 'off'}`}>
          {health ? `API ok · uptime ${Math.round(health.uptime)}s` : 'API offline'}
        </span>
      </header>

      {error && <p className="error">Erro: {error} — suba o backend em :3000</p>}

      <section className="card">
        <h2>Nova manifestação</h2>
        <form onSubmit={onSubmit} className="form">
          <label>
            Tipo
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Título
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ex: Iluminação na rua X"
              required
              minLength={3}
            />
          </label>
          <label>
            Descrição
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descreva o ocorrido..."
              required
              minLength={5}
              rows={3}
            />
          </label>
          <button type="submit">Enviar</button>
        </form>
      </section>

      <section className="card">
        <h2>Manifestações ({loading ? '…' : items.length})</h2>
        {loading ? (
          <p>Carregando…</p>
        ) : items.length === 0 ? (
          <p className="muted">Nenhuma manifestação ainda.</p>
        ) : (
          <ul className="list">
            {items.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>#{m.id} {m.titulo}</strong>
                  <small>{m.tipo} · {m.status}</small>
                  <p>{m.descricao}</p>
                </div>
                <button className="danger" onClick={() => onDelete(m.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
