import { useState, useEffect } from 'react';
import type { City, Country } from '../types';
import { apiClient } from '../apiClient';
import './Lists.css';
import '../components/Dashboard.css';
import { EditIcon, TrashIcon } from './Icons';

interface CityListProps {
  cities: City[];
  allCountries: Country[]; // Novo prop
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 5;

export function CityList({ cities, allCountries, onRefresh }: CityListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  
  const totalPages = Math.ceil(cities.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [cities]);

  const paginatedCities = cities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja apagar a cidade "${nome}"?`)) {
      try {
        await apiClient.delete(`/local/cities/${id}`);
        onRefresh();
      } catch (error) {
        alert('Erro ao apagar cidade.');
        console.error(error);
      }
    }
  };

  return (
    <div className="city-list-card">
      {paginatedCities.length > 0 ? (
        paginatedCities.map((city) => (
          <CityListItem 
            key={city.id} 
            city={city} 
            onDelete={() => handleDelete(city.id, city.nome)}
            onEdit={() => setEditingCity(city)}
          />
        ))
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
          Nenhuma cidade encontrada.
        </div>
      )}

      {cities.length > ITEMS_PER_PAGE && (
        <div className="pagination-controls">
          <button onClick={handlePrev} disabled={currentPage === 1} className="carousel-arrow">{'<'}</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className="carousel-arrow">{'>'}</button>
        </div>
      )}

      {editingCity && (
        <EditCityModal 
          city={editingCity}
          allCountries={allCountries}
          onClose={() => setEditingCity(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function CityListItem({ city, onDelete, onEdit }: { city: City; onDelete: () => void; onEdit: () => void; }) {
  const [weather, setWeather] = useState<{ temperature: number } | null>(null);

  useEffect(() => {
    apiClient.get(`/search/weather/now?lat=${city.latitude}&lon=${city.longitude}`)
      .then(res => setWeather(res.data))
      .catch(err => console.error('Erro no clima', err));
  }, [city]);

  const formatPopulation = (pop: bigint) => {
    const num = Number(pop);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Mi`;
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="city-list-item">
      <div className="city-name">
        {city.nome}
        <span className="text-link">{city.country.nome}</span>
      </div>
      <p><strong>Pop:</strong> {formatPopulation(city.populacao)}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#495057' }}>
        {weather ? (
          <>
            <span style={{ fontSize: '1.1rem' }}>{weather.temperature >= 25 ? '☀️' : weather.temperature <= 15 ? '❄️' : '☁️'}</span>
            <strong>{weather.temperature}°C</strong>
          </>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#adb5bd' }}>...</span>
        )}
      </div>
      <div className="card-actions" style={{ padding: 0, border: 'none', justifyContent: 'flex-end' }}>
        <button className="text-link" style={{ padding: 0 }} onClick={onEdit}><EditIcon /> Editar</button>
        <button className="icon-button" onClick={onDelete} title="Apagar"><TrashIcon /></button>
      </div>
    </div>
  );
}

// --- Modal de Edição de Cidade ---
function EditCityModal({ city, allCountries, onClose, onRefresh }: { city: City; allCountries: Country[]; onClose: () => void; onRefresh: () => void; }) {
  const [nome, setNome] = useState(city.nome);
  const [populacao, setPopulacao] = useState(Number(city.populacao));
  const [latitude, setLatitude] = useState(city.latitude);
  const [longitude, setLongitude] = useState(city.longitude);
  const [idPais, setIdPais] = useState(city.id_pais);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/local/cities/${city.id}`, {
        nome,
        populacao,
        latitude: Number(latitude),
        longitude: Number(longitude),
        id_pais: Number(idPais)
      });
      onRefresh();
      onClose();
    } catch (error) {
      alert('Erro ao salvar cidade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Cidade</h3>
        <div className="form-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} /></div>
        <div className="form-group"><label>População</label><input type="number" value={populacao} onChange={e => setPopulacao(Number(e.target.value))} /></div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}><label>Latitude</label><input type="number" value={latitude} onChange={e => setLatitude(Number(e.target.value))} /></div>
          <div className="form-group" style={{ flex: 1 }}><label>Longitude</label><input type="number" value={longitude} onChange={e => setLongitude(Number(e.target.value))} /></div>
        </div>
        <div className="form-group">
          <label>País</label>
          <select value={idPais} onChange={e => setIdPais(Number(e.target.value))}>
            {allCountries.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}