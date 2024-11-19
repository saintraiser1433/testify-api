import { Router } from 'express';
import { signIn, signup, refreshToken,validateTokens, signOut } from '../controllers/auth.controller';


const route = Router();

route.post('/signup', signup)
route.post('/signOut', signOut)
route.get('/refresh', refreshToken)
route.get('/validate', validateTokens)
route.post('/signIn', signIn);

export default route;
