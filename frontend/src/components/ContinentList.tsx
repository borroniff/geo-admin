import { useState } from 'react';
import type { Continent } from '../types';
import './Lists.css';
import '../components/Dashboard.css';
import { EditIcon, TrashIcon } from './Icons';
import { apiClient } from '../apiClient';

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

interface ContinentListProps {
  continents: Continent[];
  onRefresh: () => void;
}

export function ContinentList({ continents, onRefresh }: ContinentListProps) {
  const [editingContinent, setEditingContinent] = useState<Continent | null>(null);

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja apagar o continente "${nome}" e todos os seus países/cidades?`)) {
      try {
        await apiClient.delete(`/local/continents/${id}`);
        onRefresh();
      } catch (error) {
        alert('Erro ao apagar continente.');
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="continent-grid">
        {continents.map((continent) => (
          <ContinentCard 
            key={continent.id} 
            continent={continent} 
            onDelete={() => handleDelete(continent.id, continent.nome)}
            onEdit={() => setEditingContinent(continent)}
          />
        ))}
      </div>

      {editingContinent && (
        <EditContinentModal 
          continent={editingContinent} 
          onClose={() => setEditingContinent(null)} 
          onRefresh={onRefresh} 
        />
      )}
    </>
  );
}

function ContinentCard({ 
  continent, 
  onDelete, 
  onEdit 
}: { 
  continent: Continent; 
  onDelete: () => void; 
  onEdit: () => void; 
}) {
  const imageUrl = CONTINENT_IMAGES[continent.nome] || 'https://via.placeholder.com/150?text=Globo';

  return (
    <div className="continent-card">
      <div className="continent-card-info">
        <h3>{continent.nome}</h3>
        <p>{continent.descricao || 'Sem descrição disponível.'}</p>
        <div className="card-actions" style={{ padding: 0, border: 'none' }}>
          <button className="text-link" style={{ padding: 0 }} onClick={onEdit}>
            <EditIcon /> Editar
          </button>
          <button className="icon-button" onClick={onDelete} title="Apagar">
            <TrashIcon />
          </button>
        </div>
      </div>
      <img 
        src={imageUrl} 
        alt={continent.nome} 
        className="continent-card-image"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}

// --- Modal de Edição ---
function EditContinentModal({ 
  continent, 
  onClose, 
  onRefresh 
}: { 
  continent: Continent; 
  onClose: () => void; 
  onRefresh: () => void; 
}) {
  const [nome, setNome] = useState(continent.nome);
  const [descricao, setDescricao] = useState(continent.descricao || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/local/continents/${continent.id}`, { nome, descricao });
      onRefresh();
      onClose();
    } catch (error) {
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Continente</h3>
        
        <div className="form-group">
          <label>Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea 
            rows={3} 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}