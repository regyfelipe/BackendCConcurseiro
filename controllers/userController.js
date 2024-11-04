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

    try {
        const result = await query(
            `INSERT INTO questions (
                banca, instituicao, prova, nivel, disciplina, assunto, pergunta, 
                texto_aux, alternativas, resposta_correta, explicacao
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                banca || null, 
                instituicao || null, 
                prova || null, 
                nivel || null, 
                disciplina || null,
                assunto || null, 
                pergunta || null,
                textoAux || null,
                alternativas ? JSON.stringify(alternativas) : null, 
                respostaCorreta || null,
                explicacao || null 
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

export const getSimulados = async (req, res) => {
    try {
        const result = await query(`SELECT * FROM simulados`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar questões:", error);
        res.status(500).json({ error: "Erro ao buscar questões." });
    }
};

export const saveSimulado = async (req, res) => {
    const { fullName, examName, questions } = req.body;

    if (!fullName || !examName || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const result = await query(
            'INSERT INTO simulados (full_name, exam_name, questions, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
            [fullName, examName, questions, new Date()]  
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


export const saveAnswers = async (req, res) => {
    const { name, answers } = req.body;

    if (!name || !answers) {
        return res.status(400).json({ error: 'Nome e respostas são obrigatórios.' });
    }

    try {
        const result = await query(
            'INSERT INTO answers (name, answers, created_at) VALUES ($1, $2, $3) RETURNING id',
            [name, answers, new Date()]
        );

        const answerId = result.rows[0].id;

        res.status(201).json({
            message: "Respostas salvas com sucesso!",
            answerId
        });
    } catch (error) {
        console.error('Erro ao salvar respostas:', error.message);
        res.status(500).json({ error: "Erro ao salvar respostas.", details: error.message });
    }
};
