import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { generateAccessToken, generateRefreshToken, validateRefreshToken } from '../services/authService.services';
import bcrypt from 'bcrypt'
import { DecodedPayload } from '../models';

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(401).json({ error: 'Please provide email and password ' });
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [

                    {
                        username: username
                    },
                    {
                        email: username
                    },
                ]
            }
        })


        if (user) {

            // const isCorrect = await bcrypt.compare(password, user.password)


            if (password !== user.password) {
                return res.status(401).json({ error: 'Incorrect Credentials' });
            }
            const users: DecodedPayload = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
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
            return res.status(201).json({ token: { accessToken, refreshToken } });

        }
        return res.status(401).json({ error: 'Incorrect Credentialss' });

    } catch (err: any) {
        return res.status(401).json({
            message: err.message
        })
    }


}


export const signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, first_name, last_name, middle_name, password } = req.body;

    try {

        if (!username || !password) {
            return res.status(401).json({ error: "Please provide email and password" });
        }
        const hashPass = await bcrypt.hash(password, 10);

        const checkUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: username
                    },
                    {
                        username: username
                    },
                ]
            }
        });

        if (checkUser) {
            return res.status(401).json({ error: "Email Already Exist" });

        }

        const user = await prisma.user.create({
            data: {
                first_name: first_name,
                middle_name: middle_name,
                last_name: last_name,
                username: username,
                password: hashPass,
                role: 'examinee'
            }
        });

        return res.status(201).json(user);

    } catch (err: any) {
        return res.status(500).json({ message: err.message });

    }
};

export const signOut = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.body;
    await prisma.user.update({
        where: {
            id: id
        },
        data: {
            accessToken: null,
            refreshToken: null,
        }
    })
    return res.sendStatus(200);

}



export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: "No Token Provided "
        })
    }

    try {
        const decoded = validateRefreshToken(token) as DecodedPayload;
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id,
                refreshToken: token
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token or user not found', status: 'unauthenticated' });
        }

        const users: DecodedPayload = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: user.middle_name,
            role: user.role
        };

        const accessToken = generateAccessToken(users);
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                accessToken: accessToken,
            }
        })
        return res.status(200).json({ accessToken, status: 'authenticated' });

    } catch (err) {
        return res.status(403).json({ message: 'Session expired or invalid token', status: 'unauthenticated' });
    }

}


