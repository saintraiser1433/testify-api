import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../services/authService.services';
import bcrypt from 'bcrypt'
let refreshTokens: string[] = [];

const post = [
    {
        id: 1,
        username: 'john'
    },
    {
        id: 2,
        username: 'rey'
    }
]

export const getTest = (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json(post.filter((item) => item.username === req.user.name))
}






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
            if (isCorrect) {
                const accessToken = generateAccessToken(user)
                const refreshToken = generateRefreshToken(user);
                const token = {
                    accessToken,
                    refreshToken
                }
                res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
                return res.status(201).json(token)
            }

        }
        return res.status(400).json({ error: 'Incorrect Credentials' });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        })
    }


}
// refreshTokens.push(refreshToken);
// res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken })

export const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw new Error('Please provide email and password ');
        }
        const hashPass = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashPass
            }
        })
        // const accessToken = generateAccessToken(user)
        // res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
        res.status(201).json(user)
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        })
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
}



export const refreshToken = (req: Request, res: Response, next: NextFunction): any => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({
            error: "No Refresh Token "
        })
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({
            error: "No access"
        })
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Session is expired or invalid token' });
        }
        const accessToken = generateAccessToken({ username: user.name });
        return res.json({ accessToken: accessToken })
    })
}


