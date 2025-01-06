import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';




export const insertFollowUp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;

    try {
        const data = await prisma.followUp.create({
            data: body
        })

        return res.status(201).json({
            status: res.statusCode,
            message: "Success created successfully",
            data: data,
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err.message,
        });
    }

}

export const getFollowup = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const examineeId = req.params.examineeId;

    try {
        const checkFollowupData = await prisma.followUp.findFirst({
            where: {
                examinee_id: examineeId
            }
        })

        return res.status(200).send(checkFollowupData);


    } catch (err: any) {
        return res.status(500).json({
            message: err.message,
        });
    }

} 
