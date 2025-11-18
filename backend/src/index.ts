// Arquivo: backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';
import searchRoutes from './routes/search';
import localRoutes from './routes/local';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

// Carrega as variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Habilita o parsing de JSON no body

// Rotas da API
app.use('/api/search', searchRoutes);
app.use('/api/local', localRoutes);

// Rota de "saúde"
app.get('/', (req, res) => {
  res.send('API do Explorador de Países está no ar! 🌎');
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});

// Garante que o Prisma desconecte ao fechar o servidor
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Servidor encerrado.');
  });
});