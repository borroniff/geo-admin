import type { ChangeEvent } from 'react';
import { ContinentList } from '../components/ContinentList';
import { CountryList } from '../components/CountryList';
import { CityList } from '../components/CityList';
import type { Continent, Country, City } from '../types';
import '../components/Dashboard.css';

interface DashboardProps {
  allContinents: Continent[];
  allCountries: Country[];
  allCities: City[];
  filteredCountries: Country[];
  filteredCities: City[];
  onContinentFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onCountryFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
}

export function Dashboard({
  allContinents,
  allCountries,
  allCities,
  filteredCountries,
  filteredCities,
  onContinentFilterChange,
  onCountryFilterChange,
  onRefresh
}: DashboardProps) {
  return (
    <>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral dos seus cadastros geográficos.</p>
      </div>

      {/* --- SEÇÃO CONTINENTES --- */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Meus continentes</h2>
        </div>
        <ContinentList 
          continents={allContinents} 
          onRefresh={onRefresh} 
        />
      </section>

      {/* --- SEÇÃO PAÍSES --- */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Meus países</h2>
          <div className="section-controls">
            <label htmlFor="continent-filter">Filtrar por:</label>
            <select id="continent-filter" onChange={onContinentFilterChange}>
              <option value="all">Todos os continentes</option>
              {allContinents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Passamos allContinents para permitir a edição do continente do país */}
        <CountryList 
          countries={filteredCountries} 
          allContinents={allContinents} 
          onRefresh={onRefresh} 
        />
      </section>

      {/* --- SEÇÃO CIDADES --- */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Minhas cidades</h2>
          <div className="section-controls">
            <label htmlFor="country-filter">Filtrar por:</label>
            <select id="country-filter" onChange={onCountryFilterChange}>
              <option value="all">Todos os países</option>
              {allCountries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Passamos allCountries para permitir a edição do país da cidade */}
        <CityList 
          cities={filteredCities} 
          allCountries={allCountries}
          onRefresh={onRefresh} 
        />
      </section>
    </>
  );
}