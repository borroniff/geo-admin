import './Navbar.css';

interface NavbarProps {
  onNavigate: (page: 'dashboard' | 'search' | 'search-country' | 'search-continent') => void;
  currentPage: 'dashboard' | 'search' | 'search-country' | 'search-continent';
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a 
          href="#" 
          className="navbar-logo" 
          onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
        >
          🌎 GEO ADMIN
        </a>
        <div className="navbar-links">
          <a 
            href="#" 
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
          >
            Dashboard
          </a>
          <a 
            href="#" 
            className={currentPage === 'search-continent' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNavigate('search-continent'); }}
          >
            Busca de Continentes
          </a>
          <a 
            href="#" 
            className={currentPage === 'search-country' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNavigate('search-country'); }}
          >
            Busca de Países
          </a>
          <a 
            href="#" 
            className={currentPage === 'search' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onNavigate('search'); }}
          >
            Busca de Cidades
          </a>
        </div>
      </div>
    </nav>
  );
}