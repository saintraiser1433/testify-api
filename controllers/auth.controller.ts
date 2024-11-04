import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { generateAccessToken, generateRefreshToken, validateToken } from '../services/authService.services';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { DecodedPayload } from '../models';

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password ' });
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },

        })
        if (user) {

            const isCorrect = await bcrypt.compare(password, user.password)

            if (!isCorrect) {
                return res.status(400).json({ error: 'Incorrect Credentials' });
            }
            const users: DecodedPayload = {
                id: user.id,
                email: user.email,
                role: user.role
            }
            const accessToken = generateAccessToken(users)
            const refreshToken = generateRefreshToken(users);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            })
            return res.status(201).json({ user: users, token: { accessToken, refreshToken } });

        }
        return res.status(400).json({ error: 'Incorrect Credentials' });

    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        })
    }


}


export const signup = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(401).json({ error: "Please provide email and password" });
        }
        const hashPass = await bcrypt.hash(password, 10);

        const checkUser = await prisma.user.findUnique({
            where: { email }
        });

        if (checkUser) {
            return res.status(401).json({ error: "Email Already Exist" });

        }

        const user = await prisma.user.create({
            data: { email, password: hashPass, role: 'examinee' }
        });

        return res.status(201).json(user);

    } catch (err: any) {
        return res.status(500).json({ error: err.message });

    }
};

export const signOut = async (req: Request, res: Response): Promise<any> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No Token provided', status: 'unauthenticated' });
    }
    const decoded = validateToken(token, process.env.ACCESS_TOKEN_SECRET as string);
    return await prisma.user.update({
        where: {
            id: (decoded as { id: string }).id
        },
        data: {
            accessToken: null,
            refreshToken: null,
        }
    })
}



export const verifyToken = (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No Token provided', status: 'unauthenticated' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Session expired or invalid token', status: 'unauthenticated' });
        }
        const { id } = decoded as DecodedPayload;
        const user = await prisma.user.findFirst({
            where: {
                id: id,
                accessToken: token
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid token or user not found', status: 'unauthenticated' });
        }
        return res.status(200).json({ user: user, status: 'authenticated' });
    });
}




export const refreshToken = (req: Request, res: Response, next: NextFunction): any => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({
            error: "No Refresh Token "
        })
    }
    // if (!refreshTokens.includes(refreshToken)) {
    //     return res.status(403).json({
    //         error: "No access"
    //     })
    // }
    try {
        const decoded = validateToken(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
        const accessToken = generateAccessToken({ role: '1' });
        return res.json({ accessToken: accessToken })
    } catch (err) {
        return res.status(403).json({ message: 'Session expired or invalid token', status: 'unauthenticated' });
    }

}


