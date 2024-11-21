import { Router } from 'express';
import { signIn, signup, refreshToken, signOut } from '../controllers/auth.controller';


const route = Router();

route.post('/signup', signup)
route.post('/signOut', signOut)
route.get('/refresh', refreshToken)
route.post('/signIn', signIn);

export default route;
