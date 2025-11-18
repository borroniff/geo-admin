// Arquivo: frontend/src/pages/SearchCountry.tsx
import { useState } from 'react';
import { apiClient } from '../apiClient';
import './SearchCountry.css';

// Ícones SVG
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  )
};

export function SearchCountry() {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSearch = async () => {
    if (!term.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSuccessMsg('');

    try {
      const response = await apiClient.get(`/search/${term}`);
      
      // Verifica se o resultado é realmente um país
      if (response.data.type === 'country') {
        setResult(response.data);
      } else {
        setError('A busca retornou um resultado que não é um país específico. Tente ser mais exato.');
      }
    } catch (err: any) {
      setError('País não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    try {
      // O backend espera o objeto completo do país da API externa para criar no banco
      const response = await apiClient.post('/local/add-country', result.data);
      setSuccessMsg('País adicionado com sucesso!');
      
      // Lógica de popup se o continente foi criado automaticamente
      if (response.data.continentAutoCreated) {
        alert(`O continente ${response.data.continentName} foi adicionado de forma automática, acesse-o através do dashboard para alterar sua descrição.`);
      }

      setTimeout(() => {
        setResult(null);
        setTerm('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError('Este país já está cadastrado na sua lista.');
      } else {
        setError('Erro ao adicionar país.');
      }
    }
  };

  // Helpers para formatar dados
  const formatPopulation = (pop: number) => {
    if (pop >= 1_000_000) {
      return `${(pop / 1_000_000).toFixed(1)} Milhões`;
    }
    return pop.toLocaleString('pt-BR');
  };

  const getCurrency = (currencies: any) => {
    if (!currencies) return '-';
    const key = Object.keys(currencies)[0];
    return `${currencies[key].name} (${currencies[key].symbol || ''})`;
  };

  const getLanguage = (languages: any) => {
    if (!languages) return '-';
    return Object.values(languages)[0] as string;
  };

  return (
    <div className="search-page">
      <div className="content-wrapper">
        
        <h1 className="main-title">Busca de Países</h1>
        
        {/* Barra de Pesquisa */}
        <div className="search-bar-container">
          <div className="input-wrapper">
            <div className="icon-slot"><Icons.Search /></div>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquise por um país (ex: Brasil, Japão)..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            className="search-button-primary" 
            onClick={handleSearch} 
            disabled={loading}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
        
        {/* Feedback */}
        {error && <p className="msg-error">{error}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* Card de Resultado */}
        {result && (
          <div className="country-result-card">
            {/* Lado Esquerdo: Bandeira */}
            <div className="country-flag-section">
              {result.data.cca2 ? (
                <img 
                  src={`https://flagcdn.com/w640/${result.data.cca2.toLowerCase()}.png`} 
                  alt={`Bandeira de ${result.data.name.common}`}
                  className="country-flag-img"
                />
              ) : (
                <span style={{color: '#9ca3af'}}>Sem Bandeira</span>
              )}
            </div>

            {/* Lado Direito: Informações */}
            <div className="country-info-section">
              <div className="country-header">
                <h2>{result.data.name.common}</h2>
              </div>

              <div className="country-details-grid">
                <div className="country-detail-row">
                  <div>
                    <span className="country-detail-label">População:</span>
                  </div>
                  <span className="country-detail-value">{formatPopulation(result.data.population)}</span>
                </div>

                <div className="country-detail-row">
                   <div>
                    <span className="country-detail-label">Continente:</span>
                  </div>
                  <span className="country-detail-value">{result.data.region}</span>
                </div>

                <div className="country-detail-row">
                   <div>
                    <span className="country-detail-label">Idioma Oficial:</span>
                  </div>
                  <span className="country-detail-value">{getLanguage(result.data.languages)}</span>
                </div>

                <div className="country-detail-row">
                   <div>
                    <span className="country-detail-label">Moeda:</span>
                  </div>
                  <span className="country-detail-value">{getCurrency(result.data.currencies)}</span>
                </div>
              </div>

              <div className="country-actions">
                <button className="btn-add-country" onClick={handleAdd}>
                  <Icons.Plus /> Adicionar à lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}