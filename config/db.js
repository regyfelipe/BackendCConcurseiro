import pkg from 'pg'; 
const { Pool } = pkg; 
import dotenv from 'dotenv';

dotenv.config(); 

const pool = new Pool({
    host: process.env.DB_HOST,       
    database: process.env.DB_NAME,  
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,      
});

const query = (text, params) => {
    return pool.query(text, params);
};

export { pool, query };
