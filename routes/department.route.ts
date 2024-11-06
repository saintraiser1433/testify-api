import { Router } from 'express';
import {
    getDepartment,
    insertDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/department.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
const route = Router();


route.get('/', authenticateToken, getDepartment);
route.post('/', authenticateToken, insertDepartment);
route.put('/:id', authenticateToken, updateDepartment);
route.delete('/:id', authenticateToken, deleteDepartment)

export default route;