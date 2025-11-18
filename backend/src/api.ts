import axios from 'axios';

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface Country {
  name: { common: string };
  capital: string[];
  region: string;
  cca2: string;
  population: number;
  latlng: [number, number];
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
}

export interface Weather {
  temperature: number;
  windspeed: number;
}

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string; // Adicionado: Código do país (ex: US, BR)
  feature_code: string;
  population: number;
}

const continentTranslator: Record<string, string> = {
  europa: 'europe',
  asia: 'asia',
  áfrica: 'africa',
  'america do sul': 'south america',
  'america do norte': 'north america',
  oceania: 'oceania',
  americas: 'americas',
};

// Busca por nome (Mantida como fallback)
export async function searchCountryByName(name: string): Promise<Country | null> {
  try {
    // Tenta primeiro pelo endpoint de nome completo que é mais abrangente
    const response = await axios.get(
      `${REST_COUNTRIES_URL}/name/${name}?fullText=false`
    );
    return response.data[0] as Country;
  } catch (error) {
    // Se falhar, tenta pelo endpoint de tradução (comportamento antigo)
    try {
      const responseTranslation = await axios.get(
        `${REST_COUNTRIES_URL}/translation/${name}?lang=por`
      );
      return responseTranslation.data[0] as Country;
    } catch (err) {
      return null;
    }
  }
}

// NOVA FUNÇÃO: Busca por Código (Muito mais seguro para siglas como EUA -> US)
export async function searchCountryByCode(code: string): Promise<Country | null> {
  try {
    const response = await axios.get(
      `${REST_COUNTRIES_URL}/alpha/${code}`
    );
    // O endpoint alpha pode retornar um array ou objeto dependendo da versão, 
    // mas na v3.1 costuma ser array.
    return (Array.isArray(response.data) ? response.data[0] : response.data) as Country;
  } catch (error) {
    return null;
  }
}

export async function searchCountriesByRegion(
  region: string
): Promise<Country[] | null> {
  const apiRegion = continentTranslator[region.toLowerCase()] || region;

  try {
    const response = await axios.get(
      `${REST_COUNTRIES_URL}/region/${apiRegion}?lang=por`
    );
    return response.data as Country[];
  } catch (error) {
    return null;
  }
}

export async function searchCity(city: string): Promise<City | null> {
  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        name: city,
        language: 'pt',
        count: 5,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const results = response.data.results as City[];

      const foundCity = results.find((res) =>
        res.feature_code.startsWith('PPL')
      );

      if (foundCity) {
        return foundCity;
      }

      return null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getWeather(
  lat: number,
  lon: number
): Promise<Weather | null> {
  try {
    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
      },
    });
    return response.data.current_weather as Weather;
  } catch (error) {
    return null;
  }
}