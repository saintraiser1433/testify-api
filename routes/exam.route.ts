import { Router } from 'express';
import {
    getExam,
    getExamId,
    insertExam,
    updateExam,
    deleteExam
} from '../controllers/exam.controller';



const route = Router();


route.get('/', getExam);
route.get('/:id', getExamId);
route.post('/', insertExam);
route.put('/:id', updateExam);
route.delete('/:id', deleteExam)

export default route;