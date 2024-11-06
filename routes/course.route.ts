import { Router } from 'express';
import {
    getCourse,
    getCourseNoAssociated,
    insertCourse,
    updateCourse,
    deleteCourse
} from '../controllers/course.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const route = Router();


route.get('/', authenticateToken, getCourse);
route.get('/filtered', authenticateToken, getCourseNoAssociated);
route.post('/', authenticateToken, insertCourse);
route.put('/:id', authenticateToken, updateCourse);
route.delete('/:id', authenticateToken, deleteCourse)

export default route;