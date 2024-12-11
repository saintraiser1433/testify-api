import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { examineeValidation } from '../util/validation';


export const getExaminee = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const data = await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                username: true,
            },
            where: {
                role: 'examinee'
            }


        });
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            message: err.message
        })
    }
};


export const insertExaminee = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examineeValidation.insert(body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            })
        }
        const user = await tx.user.findFirst({
            where: {
                AND: [
                    { first_name: value.first_name },
                    { last_name: value.last_name },
                    { middle_name: value.middle_name },
                    { role: 'examinee' }
                ],

            },
        });

        if (user) {
            return res.status(409).json({
                message: "Student already exist",
            })

        }

        const response = await tx.user.create({
            data: value,
        });
        return res.status(201).json({
            message: "Student created successfully",
            data: response,
        })

    });
}

export const updateExaminee = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examineeValidation.update(body);

        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            })
        }

        const examinee = await tx.user.findFirst({
            where: {
                id: id,
            },
        });

        if (!examinee) {
            return res.status(409).json({
                message: "Student already exist",
            })
        }

        const response = await tx.user.update({
            where: {
                id: id,
            },
            data: value,
        });

        return res.status(200).json({
            message: "Student updated successfully",
            data: response,
        })
    });
}

export const deleteExaminee = (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const examinee = await tx.user.findFirst({
            where: {
                id: id,
            },
        });

        if (!examinee) {
            return res.status(404).json({
                message: "Student updated successfully",
            })
        }

        await prisma.user.delete({
            where: {
                id: id,
            },
        });
        return res.status(200).json({
            message: "Student deleted successfully",
        })
    });
}



