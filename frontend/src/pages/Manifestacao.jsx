import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Manifestacao() {
  const { protocolo } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setItem(null);
    api.getByProtocolo(protocolo)
      .then((data) => { if (active) setItem(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [protocolo]);

  if (loading) return <div className="section"><div className="container"><p>Carregando…</p></div></div>;
  if (error) return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <p className="error">{error}</p>
        <Link to="/consultar" className="btn btn-outline">Voltar à consulta</Link>
      </div>
    </div>
  );
  if (!item) return null;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>Manifestação #{item.protocolo}</h1>
          <span className="badge">{item.status}</span>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2>Detalhes</h2>
          <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <p><strong>Protocolo:</strong> {item.protocolo}</p>
            <p><strong>Tipo:</strong> {item.tipo}</p>
            <p><strong>Setor:</strong> {item.setor || '—'}</p>
            <p><strong>Título:</strong> {item.titulo}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            <p><strong>Identificação:</strong> {item.anonimo ? 'Anônimo' : (item.nome || 'Identificado')}</p>
            {!item.anonimo && item.turma && <p><strong>Turma:</strong> {item.turma}</p>}
            {item.contato && <p><strong>Contato:</strong> {item.contato}</p>}
            <p><strong>Criado em:</strong> {new Date(item.createdAt).toLocaleString('pt-BR')}</p>
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <p><strong>Atualizado em:</strong> {new Date(item.updatedAt).toLocaleString('pt-BR')}</p>
            )}
          </div>
        </div>

        {item.resposta && (
          <div className="card" style={{ marginBottom: 16, background: 'var(--blue-05)' }}>
            <h2>Resposta</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.resposta}</p>
            {item.respondedAt && <small className="muted">{new Date(item.respondedAt).toLocaleString('pt-BR')}</small>}
          </div>
        )}

        {!item.resposta && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h2>O que acontece agora?</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', fontSize: 14 }}>
              <li>Sua manifestação foi registrada e encaminhada ao setor responsável.</li>
              <li>O setor analisará e processará sua manifestação.</li>
              <li>Você pode acompanhar o status usando o número do protocolo.</li>
              <li>A devolutiva será disponibilizada assim que houver resposta.</li>
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/consultar" className="btn btn-outline">Voltar à consulta</Link>
        </div>
      </div>
    </div>
  );
}