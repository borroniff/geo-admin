// Arquivo: backend/src/db.ts
import { PrismaClient, Continent, Country, City } from '@prisma/client';

export const prisma = new PrismaClient();

// --- Funções de Continente ---

export const createContinent = (nome: string, descricao: string) => {
  return prisma.continent.create({ data: { nome, descricao } });
};
export const findContinentByName = (nome: string) => {
  return prisma.continent.findUnique({ where: { nome } });
};
export const getContinents = () => {
  return prisma.continent.findMany({ include: { _count: { select: { countries: true } } } });
};
export const updateContinent = (id: number, nome: string, descricao: string) => {
  return prisma.continent.update({ where: { id }, data: { nome, descricao } });
};
export const deleteContinent = (id: number) => {
  return prisma.continent.delete({ where: { id } });
};

// --- Funções de País ---

export const createCountry = (data: {
  nome: string;
  code: string;
  populacao: number;
  idioma_oficial: string;
  moeda: string;
  id_continente: number;
}) => {
  return prisma.country.create({
    data: {
      ...data,
      populacao: BigInt(data.populacao),
    },
  });
};

export const findCountryByName = (nome: string) => {
  return prisma.country.findUnique({ where: { nome: nome.trim() } });
};

// NOVA FUNÇÃO: Busca por código (CCA2) para evitar duplicatas mesmo se o nome mudar
export const findCountryByCode = (code: string) => {
  return prisma.country.findFirst({ where: { code: code } });
};

export const getCountries = () => {
  return prisma.country.findMany({ include: { continent: true } });
};
export const getCountriesByContinent = (id_continente: number) => {
  return prisma.country.findMany({
    where: { id_continente },
    include: { continent: true },
  });
};
export const updateCountry = (
  id: number,
  data: {
    nome: string;
    populacao: number;
    idioma_oficial: string;
    moeda: string;
    id_continente: number;
  }
) => {
  return prisma.country.update({
    where: { id },
    data: { ...data, populacao: BigInt(data.populacao) },
  });
};
export const deleteCountry = (id: number) => {
  return prisma.country.delete({ where: { id } });
};

// --- Funções de Cidade ---

export const createCity = (data: {
  nome: string;
  populacao: number;
  latitude: number;
  longitude: number;
  id_pais: number;
}) => {
  return prisma.city.create({
    data: {
      ...data,
      populacao: BigInt(data.populacao),
    },
  });
};

// Busca cidade pelo nome E pelo ID do país
export const findCityByNameAndCountry = (cityName: string, countryId: number) => {
  return prisma.city.findFirst({
    where: {
      nome: cityName,
      id_pais: countryId,
    },
  });
};

// NOVA FUNÇÃO: Busca por coordenadas para evitar duplicatas mesmo se o nome mudar
export const findCityByCoordinates = (lat: number, lng: number) => {
  return prisma.city.findFirst({
    where: {
      latitude: lat,
      longitude: lng
    }
  });
};

export const getCities = () => {
  return prisma.city.findMany({ include: { country: true } });
};
export const getCitiesByCountry = (id_pais: number) => {
  return prisma.city.findMany({
    where: { id_pais },
    include: { country: true },
  });
};
export const updateCity = (
  id: number,
  data: {
    nome: string;
    populacao: number;
    latitude: number;
    longitude: number;
    id_pais: number;
  }
) => {
  return prisma.city.update({
    where: { id },
    data: { ...data, populacao: BigInt(data.populacao) },
  });
};
export const deleteCity = (id: number) => {
  return prisma.city.delete({ where: { id } });
};