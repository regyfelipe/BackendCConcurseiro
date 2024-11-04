import express from 'express';
import { 
    registerUser, 
    getUsers, 
    getQuestionById, 
    loginUser, 
    createQuestion, 
    getQuestions, 
    saveSimulado, 
    getSimuladoById
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);

router.get('/users', getUsers);

router.post('/login', loginUser);

router.post('/create', createQuestion);

router.get('/all', getQuestions);

router.post('/simulado', saveSimulado);

router.get('/questions/:id', getQuestionById);

router.get('/simulado/:id', getSimuladoById); 

export default router;
