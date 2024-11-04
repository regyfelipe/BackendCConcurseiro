import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id', 
            [email, name, hashedPassword] 
        );

        const userId = result.rows[0].id;

        res.status(201).json({ message: 'Cadastro realizado com sucesso!', userId });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(400).json({ error: 'Erro ao realizar o cadastro: ' + error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const result = await query('SELECT id, email, name FROM users'); 
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao consultar usuários:', error);
        res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha inválida.' });
        }

        res.status(200).json({ message: 'Login realizado com sucesso!', user });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

export const createQuestion = async (req, res) => {
    const {
        banca,
        instituicao,
        prova,
        nivel,
        disciplina,
        assunto,
        pergunta,
        textoAux,
        alternativas,
        respostaCorreta,
        explicacao
    } = req.body;

    if (!pergunta || !disciplina || !assunto || !alternativas || !respostaCorreta) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        const result = await query(
            `INSERT INTO questions (
                banca, instituicao, prova, nivel, disciplina, assunto, pergunta, 
                texto_aux, alternativas, resposta_correta, explicacao
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                banca, instituicao, prova, nivel, disciplina, assunto, pergunta, 
                textoAux, JSON.stringify(alternativas), respostaCorreta, explicacao
            ]
        );

        const questionId = result.rows[0].id;
        res.status(201).json({ message: 'Questão criada com sucesso!', questionId });
    } catch (error) {
        console.error('Erro ao criar questão:', error);
        res.status(500).json({ error: 'Erro ao salvar a questão no banco de dados.' });
    }
};

export const getQuestions = async (req, res) => {
    try {
        const result = await query(`SELECT * FROM questions`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar questões:", error);
        res.status(500).json({ error: "Erro ao buscar questões." });
    }
};

export const saveSimulado = async (req, res) => {
    const { fullName, examName, questions } = req.body;

    // Check for required fields
    if (!fullName || !examName || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Use the array directly for PostgreSQL
        const result = await query(
            'INSERT INTO simulados (full_name, exam_name, questions, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
            [fullName, examName, questions, new Date()]  // Use questions as is
        );

        const simuladoId = result.rows[0].id;

        res.status(201).json({
            message: "Simulado salvo com sucesso!",
            link: `https://cconcurseiro.up.railway.app/simulado/${simuladoId}`
        });
    } catch (error) {
        console.error('Erro ao salvar o simulado:', error.message);
        res.status(500).json({ error: "Erro ao salvar o simulado.", details: error.message });
    }
};


export const getQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('SELECT * FROM questions WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Questão não encontrada.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar questão:", error);
        res.status(500).json({ error: "Erro ao buscar questão." });
    }
};

export const getSimuladoById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('SELECT * FROM simulados WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Simulado não encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar simulado:', error);
        res.status(500).json({ error: 'Erro ao buscar simulado.' });
    }
};

