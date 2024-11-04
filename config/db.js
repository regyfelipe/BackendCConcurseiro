// backend/config/db.js
import pkg from 'pg'; // Importa o pacote pg como um todo
const { Pool } = pkg; // Desestrutura o Pool do pacote
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente

const pool = new Pool({
    host: process.env.DB_HOST,       // Host do banco de dados
    database: process.env.DB_NAME,   // Nome do banco de dados
    user: process.env.DB_USER,       // Usuário do banco de dados
    password: process.env.DB_PASSWORD, // Senha do banco de dados
    port: process.env.DB_PORT,       // Porta do banco de dados
});

// Função para executar consultas
const query = (text, params) => {
    return pool.query(text, params);
};

export { pool, query };
