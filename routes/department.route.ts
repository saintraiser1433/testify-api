import { Router } from 'express';
import {
    getDepartment,
    insertDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/department.controller';
const route = Router();


route.get('/', getDepartment);
route.post('/', insertDepartment);
route.put('/:id', updateDepartment);
route.delete('/:id', deleteDepartment)

export default route;