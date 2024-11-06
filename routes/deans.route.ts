import { Router } from 'express';
import {
    getDeans,
    insertDeans,
    updatedDeans,
    deleteDeans,
    assignDeans,
    getAssignDeans,
    deleteAssignDeans
} from '../controllers/deans.controller';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/', authenticateToken, getDeans);
route.get('/assign/:id',authenticateToken, getAssignDeans);
route.post('/assign',authenticateToken, assignDeans);
route.delete('/assign/:deansId/:courseId',authenticateToken, deleteAssignDeans);
route.post('/',authenticateToken, insertDeans);
route.put('/:id',authenticateToken, updatedDeans);
route.delete('/:id',authenticateToken, deleteDeans)

export default route;