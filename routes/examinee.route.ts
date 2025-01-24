import { Router } from 'express';
import {
    getExaminee,
    insertExaminee,
    updateExaminee,
    deleteExaminee,
} from '../controllers/examinee.controller';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/', authenticateToken, getExaminee);
route.post('/', authenticateToken, insertExaminee);
route.put('/:id', updateExaminee);
route.delete('/:id', authenticateToken, deleteExaminee)

export default route;