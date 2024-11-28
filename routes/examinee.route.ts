import { Router } from 'express';
import {
    getExaminee,
    insertExaminee,
    updateExaminee,
    deleteExaminee,
    insertFollowUp
} from '../controllers/examinee.controller';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/', authenticateToken, getExaminee);
route.post('/', authenticateToken, insertExaminee);
route.post('/followup', authenticateToken, insertFollowUp);
route.put('/:id', authenticateToken, updateExaminee);
route.delete('/:id', authenticateToken, deleteExaminee)

export default route;