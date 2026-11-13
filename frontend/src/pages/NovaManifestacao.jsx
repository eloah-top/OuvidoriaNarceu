import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import iconSolicitacao from '../assets/reference/icon-solicitacao.png';
import iconReclamacao from '../assets/reference/icon-reclamacao.png';
import iconDenuncia from '../assets/reference/icon-denuncia.png';
import iconElogio from '../assets/reference/icon-elogio.png';
import iconSugestao from '../assets/reference/icon-sugestao.png';
import iconIdentificar from '../assets/reference/icon-identificar.png';
import iconAnonimo from '../assets/reference/icon-anonimo.png';
import setorDirecao from '../assets/reference/image0_152_86.png';
import setorPedagogico from '../assets/reference/image1_152_86.png';
import setorSecretaria from '../assets/reference/image2_152_86.png';
import setorApoie from '../assets/reference/image3_152_86.png';
import setorTutor from '../assets/reference/image4_152_86.png';

const TIPOS = [
  { value: 'solicitacao', label: 'Solicitação', desc: 'Pedido de informação, serviço ou providência que não configure reclamação ou denúncia.', icon: iconSolicitacao },
  { value: 'reclamacao', label: 'Reclamação', desc: 'Insatisfação com serviços, atendimento ou situações negativas.', icon: iconReclamacao },
  { value: 'denuncia', label: 'Denúncia', desc: 'Relato de irregularidades ou situações que precisam ser investigadas.', icon: iconDenuncia },
  { value: 'elogio', label: 'Elogio', desc: 'Demonstração de satisfação, reconhecimento e valorização de pessoas ou serviços.', icon: iconElogio },
  { value: 'sugestao', label: 'Sugestão', desc: 'Ideias ou propostas para melhorar os serviços públicos, o atendimento ou a qualidade de vida da população.', icon: iconSugestao },
];

const SETORES = [
  { value: 'direcao', label: 'Direção' },
  { value: 'pedagogico', label: 'Pedagógico' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'apoie', label: 'APOIE' },
  { value: 'tutor', label: 'Tutor' },
];

const SETORES_INFO = [
  { value: 'direcao', label: 'DIREÇÃO', img: setorDirecao, texto: 'Gerencia a escola: áreas administrativa, financeira e jurídica.' },
  { value: 'pedagogico', label: 'PEDAGÓGICO', img: setorPedagogico, texto: 'Planeja o ensino e acompanha o desenvolvimento dos alunos.' },
  { value: 'secretaria', label: 'SECRETARIA', img: setorSecretaria, texto: 'Gestão administrativa, documental e registros.' },
  { value: 'apoie', label: 'APOIE', img: setorApoie, texto: 'Atendimento psicossocial e orientação aos estudantes.' },
  { value: 'tutor', label: 'TUTOR', img: setorTutor, texto: 'Acompanha e orienta o desenvolvimento do aluno.' },
];

const STEPS = [
  { label: 'Identificação' },
  { label: 'Tipo' },
  { label: 'Setor' },
  { label: 'Dados' },
  { label: 'Confirmação' },
];

const initial = {
  anonimo: null,
  nome: '',
  turma: '',
  tipo: '',
  setor: '',
  titulo: '',
  descricao: '',
};

export default function NovaManifestacao() {
  const [form, setForm] = useState(initial);
  const [turmas, setTurmas] = useState([]);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.listTurmas().then((data) => setTurmas(Array.isArray(data) ? data : data.data || [])).catch(() => setTurmas([]));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setorLabel() {
    const s = SETORES.find((x) => x.value === form.setor);
    return s ? s.label : '—';
  }

  function tipoLabel() {
    const t = TIPOS.find((x) => x.value === form.tipo);
    return t ? t.label : '—';
  }

  function identLabel() {
    if (form.anonimo === null) return '—';
    return form.anonimo ? 'Anônimo' : 'Identificado';
  }

  function validateStep(s) {
    if (s === 0) return form.anonimo !== null;
    if (s === 1) return !!form.tipo;
    if (s === 2) return !!form.setor;
    if (s === 3) {
      if (form.titulo.trim().length < 3) return false;
      if (form.descricao.trim().length < 5) return false;
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) {
      setError('Preencha os campos obrigatórios antes de avançar.');
      return;
    }
    setError('');
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  }

  function goPrev() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  function goTo(s) {
    if (s <= maxReached) {
      setError('');
      setStep(s);
    }
  }

  async function onSubmit(e) {
    if (e) e.preventDefault();
    if (!validateStep(3)) {
      setError('Preencha os campos obrigatórios.');
      setStep(3);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao,
        setor: form.setor || undefined,
        anonimo: !!form.anonimo,
        ...(!form.anonimo
          ? { nome: form.nome || undefined, turma: form.turma || undefined }
          : {}),
      };
      const item = await api.createManifestacao(payload);
      setSuccess(item);
      setForm(initial);
      setStep(STEPS.length - 1);
      setMaxReached(STEPS.length - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1>Manifestação registrada!</h1>
            <p>Protocolo: <code style={{ fontSize: 18 }}>{success.protocolo}</code></p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => navigate(`/consultar?protocolo=${success.protocolo}`)}>
                Consultar andamento
              </button>
              <button className="btn btn-secondary" onClick={() => { setSuccess(null); setStep(0); setMaxReached(0); }}>
                Nova manifestação
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const SummaryBar = (
    <div className="manifest-summary">
      <div><strong>Destinário:</strong> {setorLabel()}</div>
      <div><strong>Tipo:</strong> {tipoLabel()}</div>
      <div><strong>Identificação:</strong> {identLabel()}</div>
    </div>
  );

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Nova manifestação</h1>
        <p className="muted">Registre sua manifestação em etapas. Você receberá um protocolo para acompanhamento.</p>

        {error && <p className="error">{error}</p>}

        <div className="wizard">
          <div className="wizard__progress">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                className={`wizard__step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                onClick={() => goTo(i)}
                disabled={i > maxReached}
              >
                <span className="wizard__step-num">{i + 1}</span>
                <span className="wizard__step-label">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="wizard__viewport">
            <div className="wizard__track" style={{ transform: `translateX(-${step * 20}%)` }}>
              <div className="wizard__slide">
                <div className="card">
                  <h2>Identificação</h2>
                  <p className="muted" style={{ marginBottom: 12 }}>
                    Você pode se identificar ou permanecer anônimo. Ambas as formas são aceitas.
                  </p>
                  {SummaryBar}
                  <div className="option-grid">
                    <button
                      type="button"
                      className={`option-card ${form.anonimo === false ? 'selected' : ''}`}
                      onClick={() => update('anonimo', false)}
                    >
                      <img src={iconIdentificar} alt="" className="option-card__icon" />
                      <div className="option-card__title">Sim, quero me identificar</div>
                      <div className="option-card__desc">Seu nome e turma serão incluídos na manifestação.</div>
                    </button>
                    <button
                      type="button"
                      className={`option-card ${form.anonimo === true ? 'selected' : ''}`}
                      onClick={() => update('anonimo', true)}
                    >
                      <img src={iconAnonimo} alt="" className="option-card__icon" />
                      <div className="option-card__title">Não, quero permanecer anônimo</div>
                      <div className="option-card__desc">Sua identidade será mantida em sigilo absoluto.</div>
                    </button>
                  </div>
                  {form.anonimo === true && (
                    <div className="anon-notice">
                      Sua manifestação será enviada de forma anônima. Nenhuma informação de identificação será coletada.
                    </div>
                  )}
                </div>
              </div>

              <div className="wizard__slide">
                <div className="card">
                  <h2>Tipo</h2>
                  {SummaryBar}
                  <h3 style={{ marginTop: 8 }}>Qual o tipo de manifestação?</h3>
                  <p className="muted" style={{ marginBottom: 12 }}>Escolha a categoria que melhor descreve sua manifestação.</p>
                  <div className="type-grid">
                    <div className="type-grid__row">
                      {TIPOS.slice(0, 3).map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          className={`type-card ${form.tipo === t.value ? 'selected' : ''}`}
                          onClick={() => update('tipo', t.value)}
                        >
                          <img src={t.icon} alt="" className="type-card__icon" />
                          <div className="type-card__title">{t.label}</div>
                          <div className="type-card__desc">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                    <div className="type-grid__row type-grid__row--center">
                      {TIPOS.slice(3).map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          className={`type-card ${form.tipo === t.value ? 'selected' : ''}`}
                          onClick={() => update('tipo', t.value)}
                        >
                          <img src={t.icon} alt="" className="type-card__icon" />
                          <div className="type-card__title">{t.label}</div>
                          <div className="type-card__desc">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="wizard__slide">
                <div className="card">
                  <h2>Setor</h2>
                  {SummaryBar}
                  <p className="muted" style={{ marginTop: 8, marginBottom: 12 }}>Escolha o setor escolar ao qual deseja direcionar sua manifestação.</p>
                  <div className="sector-select-grid">
                    {SETORES_INFO.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        className={`sector-select-card ${form.setor === s.value ? 'selected' : ''}`}
                        onClick={() => update('setor', s.value)}
                      >
                        <div className="sector-select-card__icon">
                          <img src={s.img} alt={s.label} />
                        </div>
                        <h3>{s.label}</h3>
                        <p>{s.texto}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="wizard__slide">
                <div className="card">
                  <h2>Dados</h2>
                  {SummaryBar}
                  <div className="form" style={{ marginTop: 12 }}>
                    {!form.anonimo && (
                      <>
                        <label>
                          Nome completo
                          <input value={form.nome} onChange={(e) => update('nome', e.target.value)} />
                        </label>
                        <label>
                          Turma
                          <select value={form.turma} onChange={(e) => update('turma', e.target.value)}>
                            <option value="">Selecione…</option>
                            {turmas.map((t) => (
                              <option key={t.id} value={t.nome}>{t.nome} — {t.turno}</option>
                            ))}
                          </select>
                        </label>
                      </>
                    )}
                    <label>
                      Título
                      <input
                        value={form.titulo}
                        onChange={(e) => update('titulo', e.target.value)}
                        minLength={3}
                        required
                      />
                    </label>
                    <label>
                      Descrição
                      <textarea
                        value={form.descricao}
                        onChange={(e) => update('descricao', e.target.value)}
                        minLength={5}
                        rows={4}
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="wizard__slide">
                <div className="card">
                  <h2>Confirmação</h2>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <p><strong>Anônimo:</strong> {form.anonimo ? 'Sim' : 'Não'}</p>
                    {!form.anonimo && (
                      <>
                        <p><strong>Nome:</strong> {form.nome || '—'}</p>
                        <p><strong>Turma:</strong> {form.turma || '—'}</p>
                      </>
                    )}
                    <p><strong>Tipo:</strong> {form.tipo}</p>
                    <p><strong>Setor:</strong> {form.setor || '—'}</p>
                    <p><strong>Título:</strong> {form.titulo}</p>
                    <p><strong>Descrição:</strong> {form.descricao}</p>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={onSubmit} disabled={loading}>
                      {loading ? 'Enviando…' : 'Enviar manifestação'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wizard__actions">
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
                Cancelar
              </button>
              <button type="button" className="btn btn-outline" onClick={goPrev} disabled={step === 0}>
                Voltar
              </button>
            </div>
            {step < STEPS.length - 1 && (
              <button type="button" className="btn btn-primary" onClick={goNext}>
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
