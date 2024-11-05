import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { generateAccessToken, generateRefreshToken, validateToken } from '../services/authService.services';
import bcrypt from 'bcrypt'
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
            return res.status(201).json({ token: { accessToken, refreshToken } });

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



// export const verifyToken = (req: Request, res: Response): any => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ user: {}, message: 'No Token provided', status: 'unauthenticated' });
//     }

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async (err, decoded) => {
//         if (err) {
//             return res.status(403).json({ user: {}, message: 'Session expired or invalid token', status: 'unauthenticated' });
//         }
//         const { id } = decoded as DecodedPayload;
//         const user = await prisma.user.findFirst({
//             where: {
//                 id: id,
//                 accessToken: token
//             }
//         });
//         if (!user) {
//             return res.status(401).json({ user: {}, message: 'Invalid token or user not found', status: 'unauthenticated' });
//         }
//         return res.status(200).json({ user: user, status: 'authenticated' });
//     });
// }




export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: "No Token Provided "
        })
    }

    try {
        const decoded = validateToken(token) as DecodedPayload;
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
            role: user.role
        };
        const accessToken = generateAccessToken(users);

        return res.status(200).json({ accessToken, status: 'authenticated' });

    } catch (err) {
        return res.status(403).json({ message: 'Session expired or invalid token', status: 'unauthenticated' });
    }

}


