import axios from 'axios';

// O cliente aponta para o nosso backend que está rodando na porta 3000
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api'
});