import { Link } from 'react-router-dom';
import heroImg from '../assets/reference/image5_152_86.png';
import card0 from '../assets/reference/image0_152_86.png';
import card1 from '../assets/reference/image1_152_86.png';
import card2 from '../assets/reference/image2_152_86.png';
import card3 from '../assets/reference/image3_152_86.png';
import card4 from '../assets/reference/image4_152_86.png';

const setores = [
  {
    titulo: 'DIREÇÃO',
    img: card0,
    texto: 'A direção escolar é o órgão executivo máximo que gerencia as áreas administrativa, financeira e jurídica da escola, além de liderar a equipe e garantir o cumprimento das leis educacionais.',
  },
  {
    titulo: 'PEDAGÓGICO',
    img: card1,
    texto: 'O setor pedagógico escolar é o departamento responsável por planejar o ensino, apoiar os professores e acompanhar o desenvolvimento dos alunos para garantir a qualidade da aprendizagem.',
  },
  {
    titulo: 'SECRETARIA',
    img: card2,
    texto: 'O setor de secretaria escolar é o departamento responsável pela gestão administrativa, legal e documental da instituição, cuidando de matrículas, históricos e registros de alunos e funcionários.',
  },
  {
    titulo: 'APOIE',
    img: card3,
    texto: 'A equipe do APOIE (Ação Psicossocial e Orientação Interativa Escolar) é um grupo multiprofissional focado em cuidar das demandas psicológicas, sociais e de direitos dos estudantes dentro do ambiente escolar.',
  },
  {
    titulo: 'TUTOR',
    img: card4,
    texto: 'O tutor escolar é o profissional ou professor responsável por acompanhar de perto, orientar e apoiar o desenvolvimento acadêmico, social e pessoal do aluno de forma individualizada.',
  },
];

export default function Home() {
  return (
    <div>
      <section className="hero-banner">
        <div className="container hero-banner__inner">
          <div className="hero-banner__text">
            <span className="hero-banner__eyebrow">Ouvidoria Escolar</span>
            <h1>Seja Bem-Vindo</h1>
            <p>
              A Ouvidoria Escolar é um canal de diálogo entre os estudantes e a escola.
              Aqui você pode registrar manifestações, sugestões, elogios e reclamações,
              além de consultar o andamento pelo protocolo.
            </p>
            <div className="hero-banner__actions">
              <Link to="/nova" className="btn btn-primary">Registrar manifestação</Link>
              <Link to="/consultar" className="btn btn-outline">Consultar protocolo</Link>
            </div>
          </div>
          <div className="hero-banner__image">
            <img src={heroImg} alt="Ouvidoria Escolar" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Guia de funções: O que faz cada setor da nossa escola?</h2>
          <div className="grid grid-5">
            {setores.map((s) => (
              <article className="sector-card" key={s.titulo}>
                <div className="sector-card__icon">
                  <img src={s.img} alt={s.titulo} />
                </div>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--schedule">
        <div className="container">
          <h2 className="section-title">O EXPEDIENTE OCORRE DE SEGUNDA A SEXTA-FEIRA:</h2>
          <div className="schedule">
            <div className="schedule__item"><strong>Horário Turmas:</strong> Diurno e Noturno</div>
            <div className="schedule__item"><strong>Mediação:</strong> Presencial</div>
            <div className="schedule__item"><strong>Secretaria:</strong> das 07h às 18h</div>
            <div className="schedule__item">
              <strong>Pausa nos atendimentos:</strong> nos horários de intervalo de lanche (08h40 às 09h) e almoço (11h30 às 12h20) o atendimento é pausado
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">CONTATOS:</h2>
          <div className="contacts">
            <div className="contact"><span>Secretaria (Fixo):</span> (27) 98880-3764</div>
            <div className="contact"><span>Secretaria (WhatsApp):</span> (27) 98880-3764</div>
            <div className="contact"><span>Coordenação (WhatsApp):</span> (27) 98880-2769</div>
            <div className="contact"><span>E-mail:</span> escolanarceupaiva@sedu.es.gov.br</div>
          </div>
          <div className="address">
            RUA DANIEL COMBONI, 51 — ESCOLA. CENTRO. 29670-000 — Ibiracu, Espírito Santo
          </div>
        </div>
      </section>
    </div>
  );
}
