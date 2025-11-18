// Arquivo: frontend/src/types.ts

export interface Continent {
  id: number;
  nome: string;
  descricao: string | null;
  _count: {
    countries: number;
  };
}

export interface Country {
  id: number;
  nome: string;
  code: string;
  populacao: bigint;
  idioma_oficial: string;
  moeda: string;
  id_continente: number;
  continent: {
    nome: string;
  };
}

export interface City {
  id: number;
  nome: string;
  populacao: bigint;
  latitude: number;
  longitude: number;
  id_pais: number;
  country: {
    nome: string;
  };
}