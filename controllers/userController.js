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
            link: `https://c-concurseiro.vercel.app//simulado/${simuladoId}`
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

export const getSimuladoResult = async (req, res) => {
    const { id } = req.params; 

    try {
        const simuladoResult = await query(
            `SELECT s.id AS simulado_id, s.exam_name, q.pergunta, q.resposta_correta, qa.given_answer
            FROM simulados AS s
            JOIN question_answers AS qa ON qa.simulado_id = s.id
            JOIN questions AS q ON q.id = qa.question_id
            WHERE s.id = $1`,
            [id]
        );

        if (simuladoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Resultado do simulado não encontrado.' });
        }

        const results = simuladoResult.rows.map((row) => ({
            pergunta: row.pergunta,
            respostaCorreta: row.resposta_correta,
            respostaDada: row.given_answer,
            acertou: row.resposta_correta === row.given_answer,
        }));

        const totalQuestions = results.length;
        const correctAnswers = results.filter(r => r.acertou).length;
        const score = (correctAnswers / totalQuestions) * 100;

        res.status(200).json({
            simuladoId: id,
            examName: simuladoResult.rows[0].exam_name,
            results,
            score: `${score}%`,
            correctAnswers,
            totalQuestions,
        });
    } catch (error) {
        console.error('Erro ao buscar o resultado do simulado:', error);
        res.status(500).json({ error: 'Erro ao buscar o resultado do simulado.' });
    }
};


export const getSimuladoClassificacao = async (req, res) => {
    const { id } = req.params; 

    try {
        const result = await query(`
            SELECT 
                a.name AS nome,
                COUNT(CASE WHEN qa.given_answer = qa.correct_answer THEN 1 END) AS totalAcertos,
                COUNT(CASE WHEN qa.given_answer != qa.correct_answer THEN 1 END) AS totalErros
            FROM 
                answers a
            JOIN 
                question_answers qa ON a.id = qa.answer_id
            WHERE 
                a.simulado_id = $1
            GROUP BY 
                a.name
            ORDER BY 
                totalAcertos DESC
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Classificação não encontrada.' });
        }

        // Adiciona a posição
        const finalResults = result.rows.map((row, index) => ({
            posicao: index + 1,
            nome: row.nome,
            totalAcertos: row.totalacertos,
            totalErros: row.totalerros,
        }));

        res.status(200).json(finalResults);
    } catch (error) {
        console.error('Erro ao buscar classificação do simulado:', error);
        res.status(500).json({ error: 'Erro ao buscar classificação do simulado.' });
    }
};


export const saveAnswers = async (req, res) => {
    const { simuladoID, name, questao } = req.body;

    if (!simuladoID || !name || !Array.isArray(questao)) {
        return res.status(400).json({ error: 'Simulado ID, nome e questões são obrigatórios.' });
    }

    try {
        const result = await query(
            'INSERT INTO answers (simulado_id, name, created_at) VALUES ($1, $2, $3) RETURNING id',
            [simuladoID, name, new Date()]
        );

        const answerId = result.rows[0].id; 

        const promises = questao.map(async (item) => {
            const { question_id, resultado } = item;

            await query(
                'INSERT INTO question_answers (answer_id, question_id, given_answer, correct_answer) VALUES ($1, $2, $3, $4)',
                [answerId, question_id, resultado.given_answer, resultado.correct_answer]
            );
        });

        await Promise.all(promises); 

        res.status(201).json({
            message: "Respostas salvas com sucesso!",
            answerId 
        });
    } catch (error) {
        console.error('Erro ao salvar respostas:', error.message);
        res.status(500).json({ error: "Erro ao salvar respostas.", details: error.message });
    }
};

export const getFilterOptions = async (req, res) => {
    try {
        const disciplinaResult = await query('SELECT DISTINCT disciplina FROM questions');
        const assuntoResult = await query('SELECT DISTINCT assunto FROM questions');
        const bancaResult = await query('SELECT DISTINCT banca FROM questions');
        const nivelResult = await query('SELECT DISTINCT nivel FROM questions');
        const instituicaoResult = await query('SELECT DISTINCT instituicao FROM questions');

        const options = {
            disciplina: disciplinaResult.rows.map(item => ({ label: item.disciplina, value: item.disciplina })),
            assunto: assuntoResult.rows.map(item => ({ label: item.assunto, value: item.assunto })),
            banca: bancaResult.rows.map(item => ({ label: item.banca, value: item.banca })),
            nivel: nivelResult.rows.map(item => ({ label: item.nivel, value: item.nivel })),
            instituicao: instituicaoResult.rows.map(item => ({ label: item.instituicao, value: item.instituicao })),
        };

        res.status(200).json(options);
    } catch (error) {
        console.error('Erro ao buscar opções de filtro:', error);
        res.status(500).json({ error: 'Erro ao buscar opções de filtro.' });
    }
};
