import { Router } from 'express';
import {
    getQuestion,
    insertQuestion,
    updateQuestion,
    deleteQuestion
} from '../controllers/question.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
const route = Router();


route.get('/:id', authenticateToken, getQuestion);
route.post('/', authenticateToken, insertQuestion);
route.put('/:id', authenticateToken, updateQuestion);
route.delete('/:id', authenticateToken, deleteQuestion)

export default route;