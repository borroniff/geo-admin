import { Router } from 'express';
import * as db from '../db';
import * as api from '../api';
import { Country as ApiCountry, City as ApiCity } from '../api';

const router = Router();

// --- CONTINENTES ---
router.get('/continents', async (req, res) => {
  res.json(await db.getContinents());
});
router.post('/continents', async (req, res) => {
  const { nome, descricao } = req.body;
  try {
    const existing = await db.findContinentByName(nome);
    if (existing) {
      return res.status(409).json({ message: 'Continente já existe', data: existing });
    }
    res.json(await db.createContinent(nome, descricao || 'Descrição não especificada'));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar continente' });
  }
});
router.put('/continents/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  try {
    res.json(await db.updateContinent(Number(id), nome, descricao));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar continente' });
  }
});
router.delete('/continents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    res.json(await db.deleteContinent(Number(id)));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar continente' });
  }
});

// --- PAÍSES ---
router.get('/countries', async (req, res) => {
  res.json(await db.getCountries());
});

router.put('/countries/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body; 
  try {
    res.json(await db.updateCountry(Number(id), data));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar país' });
  }
});

router.delete('/countries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    res.json(await db.deleteCountry(Number(id)));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar país' });
  }
});

// --- CIDADES ---
router.get('/cities', async (req, res) => {
  res.json(await db.getCities());
});

router.put('/cities/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    res.json(await db.updateCity(Number(id), data));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar cidade' });
  }
});

router.delete('/cities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    res.json(await db.deleteCity(Number(id)));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar cidade' });
  }
});


// --- LÓGICA DE "ADICIONAR DA API" ---

router.post('/add-continent', async (req, res) => {
  const { regionName, description } = req.body;
  try {
    const existing = await db.findContinentByName(regionName);
    if (existing) {
      return res.status(409).json({ message: 'Continente já existe', data: existing });
    }
    const newContinent = await db.createContinent(regionName, description || 'Descrição não especificada');
    res.status(201).json(newContinent);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar continente' });
  }
});

router.post('/add-country', async (req, res) => {
  const country: ApiCountry & { cca2: string } = req.body;

  try {
    // 1. VALIDAÇÃO ROBUSTA: Nome OU Código
    const existingByName = await db.findCountryByName(country.name.common);
    const existingByCode = await db.findCountryByCode(country.cca2);
    
    if (existingByName || existingByCode) {
      return res.status(409).json({ 
        message: 'País já existe (nome ou código duplicado)', 
        data: existingByName || existingByCode 
      });
    }

    // 2. Garante que o continente exista
    let continent = await db.findContinentByName(country.region);
    let continentAutoCreated = false;

    if (!continent) {
      continent = await db.createContinent(country.region, 'Descrição não especificada');
      continentAutoCreated = true;
    }

    const currencyKey = country.currencies ? Object.keys(country.currencies)[0] : null;
    const langKey = country.languages ? Object.keys(country.languages)[0] : null;

    const newCountry = await db.createCountry({
      nome: country.name.common,
      code: country.cca2,
      populacao: country.population,
      idioma_oficial: langKey ? country.languages[langKey] : 'N/A',
      moeda: currencyKey ? country.currencies[currencyKey].name : 'N/A',
      id_continente: continent.id,
    });

    res.status(201).json({ 
      ...newCountry, 
      continentAutoCreated, 
      continentName: continent.nome 
    });
  } catch (e) {
    console.error("Erro ao salvar país:", e);
    res.status(500).json({ error: 'Erro ao salvar país' });
  }
});

router.post('/add-city', async (req, res) => {
  const city: ApiCity = req.body;
  try {
    // Tenta achar o país pelo NOME
    let dbCountry = await db.findCountryByName(city.country);
    
    // Se não achou pelo nome, e temos o CÓDIGO, tenta pelo código (Ex: EUA falha nome, mas acha por US)
    if (!dbCountry && city.country_code) {
      dbCountry = await db.findCountryByCode(city.country_code);
    }

    let continentAutoCreated = false;
    let continentName = '';

    if (!dbCountry) {
      // Se o país não existe no BD, busca na API para criar (Cascata)
      let countryApiData = null;

      // 1. Tenta buscar na API pelo CÓDIGO (Mais seguro, resolve o problema do "EUA" -> "US")
      if (city.country_code) {
        countryApiData = await api.searchCountryByCode(city.country_code);
      }

      // 2. Se falhou ou não tem código, tenta pelo NOME (Fallback)
      if (!countryApiData) {
        countryApiData = await api.searchCountryByName(city.country);
      }

      if (!countryApiData) {
        return res.status(404).json({ error: `País "${city.country}" (${city.country_code}) não encontrado na API externa.` });
      }
      
      // Garante o continente
      let continent = await db.findContinentByName(countryApiData.region);
      if (!continent) {
        continent = await db.createContinent(countryApiData.region, 'Descrição não especificada');
        continentAutoCreated = true;
        continentName = continent.nome;
      }

      const currencyKey = countryApiData.currencies ? Object.keys(countryApiData.currencies)[0] : null;
      const langKey = countryApiData.languages ? Object.keys(countryApiData.languages)[0] : null;
      
      dbCountry = await db.createCountry({
        nome: countryApiData.name.common,
        code: countryApiData.cca2,
        populacao: countryApiData.population,
        idioma_oficial: langKey ? countryApiData.languages[langKey] : 'N/A',
        moeda: currencyKey ? countryApiData.currencies[currencyKey].name : 'N/A',
        id_continente: continent.id,
      });
    }

    // Validação de duplicidade da cidade (Nome+País OU Coordenadas)
    const existingByName = await db.findCityByNameAndCountry(city.name, dbCountry.id);
    const existingByLocation = await db.findCityByCoordinates(city.latitude, city.longitude);

    if (existingByName || existingByLocation) {
      return res.status(409).json({ 
        message: 'Cidade já existe (nome ou localização duplicada)', 
        data: existingByName || existingByLocation 
      });
    }

    const newCity = await db.createCity({
      nome: city.name,
      populacao: city.population,
      latitude: city.latitude,
      longitude: city.longitude,
      id_pais: dbCountry.id,
    });

    res.status(201).json({
      ...newCity,
      continentAutoCreated,
      continentName
    });

  } catch (e) {
    console.error("Erro ao salvar cidade:", e);
    res.status(500).json({ error: 'Erro ao salvar cidade' });
  }
});

export default router;