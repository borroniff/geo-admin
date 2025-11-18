import { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { apiClient } from './apiClient';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { SearchCountry } from './pages/SearchCountry';
import { SearchContinent } from './pages/SearchContinent';
import type { Continent, Country, City } from './types';
import './App.css';

function App() {
  // Navegação
  const [currentView, setCurrentView] = useState<'dashboard' | 'search' | 'search-country' | 'search-continent'>('dashboard');

  // Master lists (Dados do Dashboard)
  const [allContinents, setAllContinents] = useState<Continent[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);

  // Filter state
  const [selectedContinentId, setSelectedContinentId] = useState<string>('all');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');

  // Loading/Error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar dados
  const fetchData = async () => {
    try {
      // Não ativamos setLoading(true) aqui se for apenas um refresh silencioso, 
      // mas para manter simples, vamos manter o comportamento padrão ou ajustar se piscar muito.
      // Para esta versão, mantemos simples.
      const [continentsRes, countriesRes, citiesRes] = await Promise.all([
        apiClient.get('/local/continents'),
        apiClient.get('/local/countries'),
        apiClient.get('/local/cities'),
      ]);

      setAllContinents(continentsRes.data);
      setAllCountries(countriesRes.data);
      setAllCities(citiesRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar os dados do banco.');
    } finally {
      setLoading(false);
    }
  };

  // Busca dados na montagem inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Recarrega os dados sempre que voltarmos para o Dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchData();
    }
  }, [currentView]);

  // --- Lógica de Filtro ---
  const filteredCountries = useMemo(() => {
    if (selectedContinentId === 'all') {
      return allCountries;
    }
    return allCountries.filter(
      (c) => c.id_continente === Number(selectedContinentId)
    );
  }, [allCountries, selectedContinentId]);

  const filteredCities = useMemo(() => {
    if (selectedCountryId === 'all') {
      return allCities;
    }
    return allCities.filter((c) => c.id_pais === Number(selectedCountryId));
  }, [allCities, selectedCountryId]);

  const handleContinentFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedContinentId(e.target.value);
  };
  const handleCountryFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryId(e.target.value);
  };

  // --- Renderização da Página ---
  const renderContent = () => {
    if (currentView === 'search') {
      return <Search />;
    }

    if (currentView === 'search-country') {
      return <SearchCountry />;
    }

    if (currentView === 'search-continent') {
      return <SearchContinent />;
    }

    // View Dashboard
    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    
    return (
      <Dashboard
        allContinents={allContinents}
        allCountries={allCountries}
        allCities={allCities}
        filteredCountries={filteredCountries}
        filteredCities={filteredCities}
        onContinentFilterChange={handleContinentFilterChange}
        onCountryFilterChange={handleCountryFilterChange}
        onRefresh={fetchData} // Passando a função de refresh
      />
    );
  };

  return (
    <div className="app">
      <Navbar 
        currentPage={currentView} 
        onNavigate={setCurrentView} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;