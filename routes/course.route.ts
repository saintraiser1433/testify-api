import { Router } from 'express';
import {
    getAllCourse,
    getCourseNoAssociated,
    insert,
    update,
    remove
} from '../controllers/course.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const route = Router();


route.get('/', authenticateToken, getAllCourse);
route.get('/filtered', authenticateToken, getCourseNoAssociated);
route.post('/', authenticateToken, insert);
route.put('/:id', authenticateToken, update);
route.delete('/:id', authenticateToken, remove)

export default route;