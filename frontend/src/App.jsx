import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import NovaManifestacao from './pages/NovaManifestacao.jsx';
import ConsultarProtocolo from './pages/ConsultarProtocolo.jsx';
import Painel from './pages/Painel.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nova" element={<NovaManifestacao />} />
          <Route path="/consultar" element={<ConsultarProtocolo />} />
          <Route path="/painel" element={<Painel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
