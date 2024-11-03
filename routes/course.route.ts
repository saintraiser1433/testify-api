import { Router } from 'express';
import {
    getCourse,
    getCourseNoAssociated,
    insertCourse,
    updateCourse,
    deleteCourse
} from '../controllers/course.controller';



const route = Router();


route.get('/', getCourse);
route.get('/filtered', getCourseNoAssociated);
route.post('/', insertCourse);
route.put('/:id', updateCourse);
route.delete('/:id', deleteCourse)

export default route;