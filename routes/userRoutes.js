import express from 'express';
import { 
    registerUser, 
    getUsers, 
    getQuestionById, 
    loginUser, 
    createQuestion, 
    getQuestions, 
    saveSimulado, 
    getSimuladoById // Importe a função que você acabou de criar
} from '../controllers/userController.js';

const router = express.Router();

// Rota para registro de novos usuários
router.post('/register', registerUser);

// Rota para consulta de todos os usuários
router.get('/users', getUsers);

// Rota para login de usuários
router.post('/login', loginUser);

// Rota para criar nova questão
router.post('/create', createQuestion);

// Rota para obter todas as questões
router.get('/all', getQuestions);

// Rota para salvar simulado
router.post('/simulado', saveSimulado);


router.get('/questions/:id', getQuestionById);

// Rota para obter simulado por ID
router.get('/simulado/:id', getSimuladoById); // Adicione esta linha

export default router;
