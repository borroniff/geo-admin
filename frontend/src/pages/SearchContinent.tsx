import { useState } from 'react';
import { apiClient } from '../apiClient';
import './SearchContinent.css';

// Mapeamento de imagens (mesmo utilizado no Dashboard)
const CONTINENT_IMAGES: Record<string, string> = {
  'Americas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Americas_%28orthographic_projection%29.svg/480px-Americas_%28orthographic_projection%29.svg.png',
  'América': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Americas_%28orthographic_projection%29.svg/480px-Americas_%28orthographic_projection%29.svg.png',
  'América do Sul': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/South_America_%28orthographic_projection%29.svg/480px-South_America_%28orthographic_projection%29.svg.png',
  'América do Norte': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Location_North_America.svg/480px-Location_North_America.svg.png',
  'Europa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg/480px-Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg.png',
  'Ásia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Asia_%28orthographic_projection%29.svg/480px-Asia_%28orthographic_projection%29.svg.png',
  'África': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Africa_%28orthographic_projection%29.svg/480px-Africa_%28orthographic_projection%29.svg.png',
  'Oceania': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oceania_%28orthographic_projection%29.svg/480px-Oceania_%28orthographic_projection%29.svg.png',
  'Antártida': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Antarctica_%28orthographic_projection%29.svg/480px-Antarctica_%28orthographic_projection%29.svg.png'
};

// Ícones SVG
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  )
};

export function SearchContinent() {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!term.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSuccessMsg('');

    try {
      const response = await apiClient.get(`/search/${term}`);
      
      // Verifica se o resultado é uma região (Continente)
      if (response.data.type === 'region') {
        setResult(response.data);
      } else {
        setError('A busca não retornou um continente válido. Tente "Europa", "Ásia", "África", etc.');
      }
    } catch (err: any) {
      setError('Continente não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  // Abre o modal
  const openModal = () => {
    setDescription('');
    setIsModalOpen(true);
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Confirma a adição no banco
  const handleConfirmAdd = async () => {
    if (!result || !description.trim()) return;

    setSaving(true);
    try {
      await apiClient.post('/local/add-continent', {
        regionName: result.name,
        description: description
      });
      setSuccessMsg('Continente adicionado com sucesso!');
      setIsModalOpen(false);
      
      // Limpa resultados após sucesso
      setTimeout(() => {
        setResult(null);
        setTerm('');
        setSuccessMsg('');
      }, 2000);

    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        alert('Este continente já está cadastrado.');
      } else {
        alert('Erro ao salvar continente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (name: string) => {
    return CONTINENT_IMAGES[name] || 'https://via.placeholder.com/150?text=Globo';
  };

  return (
    <div className="search-page">
      <div className="content-wrapper">
        
        <h1 className="main-title">Busca de Continentes</h1>
        
        {/* Barra de Pesquisa */}
        <div className="search-bar-container">
          <div className="input-wrapper">
            <div className="icon-slot"><Icons.Search /></div>
            <input
              type="text"
              className="search-input"
              placeholder="Digite um continente (ex: Europa)..."
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

        {/* Card de Resultado */}
        {result && (
          <div className="result-card">
            <div className="image-section">
              <img 
                src={getImageUrl(result.name)} 
                alt={result.name} 
                className="continent-img"
              />
            </div>

            <div className="info-section">
              <div className="info-header">
                <h2>{result.name}</h2>
                <p style={{ color: '#6b7280' }}>Continente identificado</p>
              </div>

              <div className="actions">
                <button className="btn-add" onClick={openModal}>
                  <Icons.Plus /> Adicionar à lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL / POPUP */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Continente</h3>
            <p>Para adicionar esse continente, você deve inserir uma descrição para ele:</p>
            
            <textarea
              className="modal-textarea"
              placeholder="Ex: O velho continente, berço da cultura ocidental..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmAdd} 
                disabled={!description.trim() || saving}
              >
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}