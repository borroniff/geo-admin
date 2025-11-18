// Arquivo: backend/src/routes/search.ts
import { Router } from 'express';
import * as api from '../api';

const router = Router();

/**
 * Rota principal de busca. Tenta encontrar por região, país ou cidade.
 * GET /api/search/:term
 */
router.get('/:term', async (req, res) => {
  const { term } = req.params;

  // Verifica se é a rota de weather e pula (caso o express confunda :term com 'weather')
  if (term === 'weather') return req.next!();

  if (!term) {
    return res.status(400).json({ error: 'Termo de busca é obrigatório' });
  }

  try {
    // 1. Tenta Região
    const countriesInRegion = await api.searchCountriesByRegion(term.trim());
    if (countriesInRegion) {
      return res.json({ type: 'region', data: countriesInRegion, name: term });
    }

    // 2. Tenta País
    const country = await api.searchCountryByName(term.trim());
    if (country) {
      const [lat, lon] = country.latlng;
      const weather = await api.getWeather(lat, lon); // Pode ser null
      return res.json({ type: 'country', data: country, weather });
    }

    // 3. Tenta Cidade
    const city = await api.searchCity(term.trim());
    if (city) {
      const weather = await api.getWeather(city.latitude, city.longitude); // Pode ser null
      return res.json({ type: 'city', data: city, weather });
    }

    // 4. Nada encontrado
    return res.status(404).json({ error: `Nada encontrado para "${term}".` });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

/**
 * Rota para obter o clima por coordenadas
 * GET /api/search/weather/now?lat=-22.9&lon=-43.1
 */
router.get('/weather/now', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude e Longitude são obrigatórias' });
  }

  try {
    const weather = await api.getWeather(Number(lat), Number(lon));
    res.json(weather);
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    res.status(500).json({ error: 'Erro ao buscar clima' });
  }
});

export default router;