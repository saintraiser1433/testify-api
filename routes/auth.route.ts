import { Router } from 'express';
import { signIn, signup, refreshToken, verifyToken, signOut } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const route = Router();

route.post('/signup', signup)
route.post('/signOut', signOut)
route.get('/verifyToken', verifyToken)
route.post('/token', refreshToken)
// route.get('/test', authenticateToken, getTest)
route.post('/signIn', signIn);


export default route;
