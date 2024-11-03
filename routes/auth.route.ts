import { Router } from 'express';
import { signIn, getTest, signup, refreshToken } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
// import { signup } from '../controllers/auth2.controller';

const route = Router();

route.post('/signup', signup)




route.post('/token', refreshToken)

route.get('/test', authenticateToken, getTest)
route.post('/signIn', signIn);


export default route;
