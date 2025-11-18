import { useState, useEffect } from 'react';
import type { Country, Continent } from '../types';
import './Lists.css';
import '../components/Dashboard.css';
import { EditIcon, TrashIcon } from './Icons';
import { apiClient } from '../apiClient';

interface CountryListProps {
  countries: Country[];
  allContinents: Continent[]; 
  onRefresh: () => void;
}

// ATUALIZADO: Define 5 itens por página
const ITEMS_PER_PAGE = 5;

export function CountryList({ countries, allContinents, onRefresh }: CountryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const totalPages = Math.ceil(countries.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [countries]);

  const paginatedCountries = countries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja apagar o país "${nome}"?`)) {
      try {
        await apiClient.delete(`/local/countries/${id}`);
        onRefresh();
      } catch (error) {
        alert('Erro ao apagar país.');
        console.error(error);
      }
    }
  };

  return (
    <div className="country-list-container">
      <div className="horizontal-scroll">
        {paginatedCountries.length > 0 ? (
          paginatedCountries.map((country) => (
            <CountryCard 
              key={country.id} 
              country={country} 
              onDelete={() => handleDelete(country.id, country.nome)}
              onEdit={() => setEditingCountry(country)}
            />
          ))
        ) : (
          <p style={{ padding: '1rem', color: '#6c757d' }}>Nenhum país encontrado.</p>
        )}
      </div>

      {/* Controles de Paginação */}
      {countries.length > ITEMS_PER_PAGE && (
        <div className="pagination-controls">
          <button onClick={handlePrev} disabled={currentPage === 1} className="carousel-arrow">{'<'}</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className="carousel-arrow">{'>'}</button>
        </div>
      )}

      {editingCountry && (
        <EditCountryModal 
          country={editingCountry} 
          allContinents={allContinents}
          onClose={() => setEditingCountry(null)} 
          onRefresh={onRefresh} 
        />
      )}
    </div>
  );
}

function CountryCard({ country, onDelete, onEdit }: { country: Country; onDelete: () => void; onEdit: () => void; }) {
  const formatPopulation = (pop: bigint) => {
    const num = Number(pop);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} Bi`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Mi`;
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="country-card">
      <div className="country-card-flag">
        {country.code ? (
          <img
            src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
            alt={`Bandeira de ${country.nome}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
          />
        ) : (
          <span>[Sem Bandeira]</span>
        )}
      </div>
      <div className="country-card-info">
        <h3>{country.nome}</h3>
        <p><strong>Pop:</strong> {formatPopulation(country.populacao)}</p>
        <p><strong>Idioma:</strong> {country.idioma_oficial}</p>
        <p><strong>Moeda:</strong> {country.moeda}</p>
        <span className="text-link">{country.continent?.nome}</span>
      </div>
      <div className="card-actions">
        <button className="text-link" style={{ padding: 0 }} onClick={onEdit}><EditIcon /> Editar</button>
        <button className="icon-button" onClick={onDelete} title="Apagar"><TrashIcon /></button>
      </div>
    </div>
  );
}

function EditCountryModal({ country, allContinents, onClose, onRefresh }: { country: Country; allContinents: Continent[]; onClose: () => void; onRefresh: () => void; }) {
  const [nome, setNome] = useState(country.nome);
  const [populacao, setPopulacao] = useState(Number(country.populacao));
  const [idioma, setIdioma] = useState(country.idioma_oficial);
  const [moeda, setMoeda] = useState(country.moeda);
  const [idContinente, setIdContinente] = useState(country.id_continente);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/local/countries/${country.id}`, {
        nome,
        populacao,
        idioma_oficial: idioma,
        moeda,
        id_continente: Number(idContinente)
      });
      onRefresh();
      onClose();
    } catch (error) {
      alert('Erro ao salvar país.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar País</h3>
        <div className="form-group">
          <label>Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div className="form-group">
          <label>População</label>
          <input type="number" value={populacao} onChange={e => setPopulacao(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Idioma Oficial</label>
          <input value={idioma} onChange={e => setIdioma(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Moeda</label>
          <input value={moeda} onChange={e => setMoeda(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Continente</label>
          <select value={idContinente} onChange={e => setIdContinente(Number(e.target.value))}>
            {allContinents.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
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