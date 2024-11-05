import jwt from 'jsonwebtoken';
import { AuthModel } from '../models';



export const generateAccessToken = (user: AuthModel) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15s' });
}

export const generateRefreshToken = (user: AuthModel) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1d' });
}

export const validateToken = (token: string, secretKey: string) => {
    return jwt.verify(token, secretKey);
}

