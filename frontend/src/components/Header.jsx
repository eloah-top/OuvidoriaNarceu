import { Link, useLocation } from 'react-router-dom';
import logoNarceu from '../assets/reference/image9_152_86.png';

const nav = [
  { to: '/', label: 'Início' },
  { to: '/nova', label: 'Nova manifestação' },
  { to: '/consultar', label: 'Consultar protocolo' },
  { to: '/painel', label: 'Painel' },
];

export default function Header() {
  const location = useLocation();
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <img src={logoNarceu} alt="NARCEU" className="brand__logo" />
          <div className="brand__text">
            <span className="brand__school">Escola Estadual</span>
            <strong className="brand__name">NARCEU</strong>
            <span className="brand__sub">Narceu de Paiva Filho</span>
          </div>
        </Link>
        <nav className="site-nav">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`site-nav__link ${location.pathname === n.to ? 'active' : ''}`}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
