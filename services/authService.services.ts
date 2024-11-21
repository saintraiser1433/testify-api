import jwt from 'jsonwebtoken';
import { AuthModel } from '../models';

export const generateAccessToken = (user: AuthModel) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '5hr' });
}

export const generateRefreshToken = (user: AuthModel) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1d' });
}

export const validateRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
}

export const validateAccesToken = (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
}

