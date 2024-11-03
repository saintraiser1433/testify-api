import { Router } from 'express';
import {
    getExaminee,
    insertExaminee,
    updateExaminee,
    deleteExaminee
} from '../controllers/examinee.controller';



const route = Router();


route.get('/', getExaminee);
route.post('/', insertExaminee);
route.put('/:id', updateExaminee);
route.delete('/:id', deleteExaminee)

export default route;