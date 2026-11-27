import { useState } from 'react';
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
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [profanityOpen, setProfanityOpen] = useState(false);
  const [profanityField, setProfanityField] = useState('');
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setorLabel() {
    const s = SETORES.find((x) => x.value === form.setor);
    return s ? s.label : '—';
  }

  const RESPONSAVEIS = {
    direcao: 'Direção',
    pedagogico: 'Pedagogo',
    secretaria: 'Secretaria',
    apoie: 'APOIE',
    tutor: 'Tutor',
  };

  function responsavelLabel() {
    return RESPONSAVEIS[form.setor] || '—';
  }

  function tipoLabel() {
    const t = TIPOS.find((x) => x.value === form.tipo);
    return t ? t.label : '—';
  }

  function identLabel() {
    if (form.anonimo === null) return '—';
    return form.anonimo ? 'Anônimo' : 'Identificado';
  }

  const LISTA_PT = ['caralho','foda','foder','fodase','puta','putaria','cu','buceta','pica','rola','viado','bicha','arrombado','fdp'];
  function normalizarTexto(v) {
    return String(v || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9\\s]/g, ' ').replace(/\\s+/g, ' ').trim();
  }
  function contemPalavrao(v) {
    const n = normalizarTexto(v);
    if (!n) return false;
    const palavras = n.split(' ');
    return LISTA_PT.some((p) => {
      if (p.includes(' ')) return n.includes(p);
      return palavras.includes(p) || new RegExp('\\\\b' + p + '\\\\b').test(n);
    });
  }

  function validateStep(s) {
    if (s === 0) return form.anonimo !== null;
    if (s === 1) return !!form.tipo;
    if (s === 2) return !!form.setor;
    if (s === 3) {
      if (form.titulo.trim().length < 3) return false;
      if (form.descricao.trim().length < 5) return false;
      if (contemPalavrao(form.titulo) || contemPalavrao(form.descricao)) return false;
      if (!form.anonimo) {
        if (!form.nome.trim()) return false;
        if (contemPalavrao(form.nome)) return false;
      }
    }
    return true;
  }

  function goNext() {
    if (step === 3) {
      const campos = [];
      if (contemPalavrao(form.titulo)) campos.push('Título');
      if (contemPalavrao(form.descricao)) campos.push('Descrição');
      if (!form.anonimo && contemPalavrao(form.nome)) campos.push('Nome completo');
      if (campos.length) {
        setProfanityField(campos.join(', '));
        setProfanityOpen(true);
        return;
      }
    }
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
    const campos = [];
    if (contemPalavrao(form.titulo)) campos.push('Título');
    if (contemPalavrao(form.descricao)) campos.push('Descrição');
    if (!form.anonimo && contemPalavrao(form.nome)) campos.push('Nome completo');
    if (campos.length) {
      setProfanityField(campos.join(', '));
      setProfanityOpen(true);
      return;
    }
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
          ? { nome: form.nome || undefined, turma: form.turma.trim() || undefined }
          : {}),
      };
      const item = await api.createManifestacao(payload);
      setSuccess(item);
      setForm(initial);
      setStep(STEPS.length - 1);
      setMaxReached(STEPS.length - 1);
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

  if (success) {
    function copiar() {
      navigator.clipboard?.writeText(success.protocolo).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card">
            <h1 style={{ textAlign: 'center' }}>Manifestação enviada!</h1>
            <p style={{ textAlign: 'center' }} className="muted">
              Sua manifestação foi registrada e encaminhada ao setor responsável.
            </p>

            <div style={{ marginTop: 16, padding: 16, background: 'var(--blue-05)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <small className="muted">Número de Protocolo</small>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue-900)' }}>{success.protocolo}</div>
                </div>
                <button type="button" className="btn btn-secondary" onClick={copiar}>
                  {copied ? 'Copiado!' : 'Copiar protocolo'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3>Detalhes da manifestação</h3>
              <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                <p><strong>Tipo:</strong> {success.tipo}</p>
                <p><strong>Destinatário:</strong> {success.setor || '—'}</p>
                <p><strong>Identificação:</strong> {success.anonimo ? 'Anônimo' : (success.nome || 'Identificado')}</p>
                {success.titulo && <p><strong>Assunto:</strong> {success.titulo}</p>}
                {success.descricao && <p><strong>Descrição:</strong> {success.descricao}</p>}
                {success.turma && <p><strong>Turma:</strong> {success.turma}</p>}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3>O que acontece agora?</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', fontSize: 14 }}>
                <li>Sua manifestação foi registrada e encaminhada ao setor responsável.</li>
                <li>O setor analisará e processará sua manifestação.</li>
                <li>Você pode acompanhar o status usando o número do protocolo.</li>
                <li>A devolutiva será disponibilizada assim que houver resposta.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/consultar?protocolo=${success.protocolo}`)}>
                Consultar protocolo
              </button>
              <button className="btn btn-secondary" onClick={() => { setSuccess(null); setStep(0); setMaxReached(0); setCopied(false); }}>
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
                  <div className="anon-notice" style={{ marginBottom: 12 }}>
                    Pessoa responsável por visualizar sua manifestação: {responsavelLabel()}
                  </div>
                  <div className="form" style={{ marginTop: 12 }}>
                    {!form.anonimo && (
                      <>
                        <label>
                          Nome completo
                          <input value={form.nome} onChange={(e) => update('nome', e.target.value)} />
                          {form.nome && contemPalavrao(form.nome) && (
                            <small style={{ color: '#991b1b' }}>Conteúdo inapropriado detectado.</small>
                          )}
                        </label>
                        <label>
                          Turma
                          <input
                            value={form.turma}
                            onChange={(e) => update('turma', e.target.value)}
                            placeholder="Ex: 1 2 LCH"
                            maxLength={10}
                          />
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
                      {form.titulo && contemPalavrao(form.titulo) && (
                        <small style={{ color: '#991b1b' }}>Conteúdo inapropriado detectado.</small>
                      )}
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
                      {form.descricao && contemPalavrao(form.descricao) && (
                        <small style={{ color: '#991b1b' }}>Conteúdo inapropriado detectado.</small>
                      )}
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
                    <button
                      className="btn btn-primary"
                      onClick={() => { setConfirmChecked(false); setConfirmOpen(true); }}
                      disabled={loading}
                    >
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

        {profanityOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
              <h2 className="modal__title">Conteúdo inapropriado</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Detectamos conteúdo inapropriado no(s) campo(s): <strong>{profanityField}</strong>.
                Por favor, revise e remova os termos inadequados antes de continuar.
              </p>
              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setProfanityOpen(false)}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal">
              <h2 className="modal__title">Confirmar envio</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Atenção: o protocolo gerado é <strong>único e irreversível</strong>. Caso você perca o
                número do protocolo, não será possível consultar sua manifestação nem receber os
                detalhes/resposta de forma alguma.
              </p>
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  style={{ marginTop: 4 }}
                />
                <span>Li e concordo que o protocolo é único e não poderá ser recuperado se perdido.</span>
              </label>
              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setConfirmOpen(false); setConfirmChecked(false); }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!confirmChecked || loading}
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmChecked(false);
                    onSubmit();
                  }}
                >
                  {loading ? 'Enviando…' : 'Confirmar e enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
