import { Router } from 'express';
import {
    getExam,
    getExamId,
    insert,
    update,
    remove,
    checkIfExamFinished,
    checkExamAvailable
} from '../controllers/exam.controller';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/', authenticateToken, getExam);
route.get('/:id', authenticateToken, getExamId);
route.get('/existing/:id', authenticateToken, checkIfExamFinished);
route.get('/available/:examineeId', authenticateToken, checkExamAvailable);
route.post('/', authenticateToken, insert);
route.put('/:id', authenticateToken, update);
route.delete('/:id', authenticateToken, remove)

export default route;