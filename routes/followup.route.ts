import { Router } from 'express';
import {
    getFollowup,
    insertFollowUp
} from '../controllers/followup.controller.ts';
import { authenticateToken } from '../middlewares/auth.middleware';



const route = Router();


route.get('/:examineeId', authenticateToken, getFollowup);
route.post('/', authenticateToken, insertFollowUp);

export default route;