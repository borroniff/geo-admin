// Arquivo: frontend/src/pages/Search.tsx
import { useState } from 'react';
import { apiClient } from '../apiClient';
import './Search.css';

// Ícones SVG
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Sun: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  ),
  Cloud: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
  )
};

export function Search() {
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
      if (response.data.type === 'city') {
        setResult(response.data);
      } else {
        setError('Por favor, digite o nome de uma cidade específica.');
      }
    } catch (err: any) {
      setError('Cidade não encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    try {
      const response = await apiClient.post('/local/add-city', result.data);
      setSuccessMsg('Cidade adicionada com sucesso!');
      
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
        setError('Esta cidade já está cadastrada neste país.');
      } else {
        setError('Erro ao adicionar (talvez já exista na lista).');
      }
    }
  };

  return (
    // Adicionada a classe 'search-city-page' para isolar o CSS
    <div className="search-page search-city-page">
      <div className="content-wrapper">
        
        <h1 className="main-title">Busca de Cidades</h1>
        
        <div className="search-bar-container">
          <div className="input-wrapper">
            <div className="icon-slot"><Icons.Search /></div>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquise por uma cidade..."
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
        
        {error && <p className="msg-error">{error}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {result && (
          <div className="result-card">
            <div className="card-body">
              <div className="card-header-row">
                <div className="city-info">
                  <span className="label-result">Resultado da busca</span>
                  <h2>{result.data.name}</h2>
                </div>
                
                {result.weather && (
                  <div className="weather-box">
                    {result.weather.temperature > 20 ? <Icons.Sun /> : <Icons.Cloud />}
                    <div className="weather-text">
                      <strong>{result.weather.temperature > 20 ? 'Ensolarado' : 'Nublado'}</strong>
                      <span>{result.weather.temperature}°C</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>País</label>
                  <p>{result.data.country}</p>
                </div>
                <div className="info-item">
                  <label>População</label>
                  <p>{(result.data.population / 1000000).toFixed(2)} milhões</p>
                </div>
                <div className="info-item">
                  <label>Latitude</label>
                  <p>{result.data.latitude.toFixed(4)}</p>
                </div>
                <div className="info-item">
                  <label>Longitude</label>
                  <p>{result.data.longitude.toFixed(4)}</p>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="btn-add" onClick={handleAdd}>
                <Icons.Plus /> Adicionar à Lista
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}