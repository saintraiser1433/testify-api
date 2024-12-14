import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import { validateAccesToken } from '../services/authService.services';
import { DecodedPayload } from '../models';
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    try {
        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = validateAccesToken(token) as DecodedPayload;
        const tokenizer = await prisma.user.findFirst({
            where: {
                id: decoded.id,
                accessToken: token
            }
        })
        console.log(tokenizer);
        if (!tokenizer) {
            return res.status(401).json({ message: 'Undefined token detected', status: 'unauthenticated' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Session expired', status: 'unauthenticated' });
    }


};
