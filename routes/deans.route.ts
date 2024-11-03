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



const route = Router();


route.get('/', getDeans);
route.get('/assign/:id', getAssignDeans);
route.post('/assign', assignDeans);
route.delete('/assign/:deansId/:courseId', deleteAssignDeans);
route.post('/', insertDeans);
route.put('/:id', updatedDeans);
route.delete('/:id', deleteDeans)

export default route;