import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'; // Importando as rotas de usuário

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita o CORS para todas as origens
app.use(cors());

// Habilita o uso de JSON
app.use(express.json());

// Usando as rotas de usuário
app.use('/api', userRoutes); // Prefixo para todas as rotas de usuário

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
