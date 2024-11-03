import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { examineeValidation } from '../util/validation';


export const getExaminee = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const data = await prisma.examinee.findMany({
            select: {
                examinee_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                username: true,
            },
            orderBy: {
                examinee_id: "asc",
            },
        });
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};


export const insertExaminee = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examineeValidation.insert(body);
        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })
        }
        const user = await tx.examinee.findFirst({
            where: {
                AND: [
                    { first_name: value.first_name },
                    { last_name: value.last_name },
                    { middle_name: value.middle_name },
                ],
            },
        });

        if (user) {
            return res.status(409).json({
                error: "Student already exist",
            })

        }

        const response = await tx.examinee.create({
            data: value,
        });
        return res.status(201).json({
            message: "Student created successfully",
            data: response,
        })

    });
}

export const updateExaminee = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examineeValidation.update(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })
        }

        const examinee = await tx.examinee.findFirst({
            where: {
                examinee_id: Number(id),
            },
        });

        if (!examinee) {
            return res.status(409).json({
                error: "Student already exist",
            })
        }

        const response = await tx.examinee.update({
            where: {
                examinee_id: Number(id),
            },
            data: value,
        });

        return res.status(200).json({
            message: "Student updated successfully",
            data: response,
        })
    });
}

export const deleteExaminee = (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const examinee = await tx.examinee.findFirst({
            where: {
                examinee_id: Number(id),
            },
        });

        if (!examinee) {
            return res.status(404).json({
                message: "Student updated successfully",
            })
        }

        await prisma.examinee.delete({
            where: {
                examinee_id: Number(id),
            },
        });
        return res.status(200).json({
            message: "Student deleted successfully",
        })
    });
}

