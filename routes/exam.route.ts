import { Router } from 'express';
import {
    getExam,
    getExamId,
    insertExam,
    updateExam,
    deleteExam
} from '../controllers/exam.controller';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/', authenticateToken, getExam);
route.get('/:id', authenticateToken, getExamId);
route.post('/', authenticateToken, insertExam);
route.put('/:id', authenticateToken, updateExam);
route.delete('/:id', authenticateToken, deleteExam)

export default route;