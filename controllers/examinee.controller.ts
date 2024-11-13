import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { examineeValidation } from '../util/validation';


export const getExaminee = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { q, _page, _limit, _sort, _order } = req.query; //{ q: '', _page: '1', _limit: '5', _sort: 'id', _order: 'asc' }

    try {
        const page = parseInt(_page as string, 10);
        const limit = parseInt(_limit as string, 10);
        const skip = (page - 1) * limit;


        const totalItems = await prisma.examinee.count({
            where: {
                OR: [
                    { first_name: { contains: q as string, mode: 'insensitive' } },
                    { last_name: { contains: q as string, mode: 'insensitive' } },
                ]
            }
        });

        const totalPages = Math.ceil(totalItems / limit);

        const data = await prisma.examinee.findMany({
            where: {
                OR: [
                    { first_name: { contains: q as string, mode: 'insensitive' } },
                    { last_name: { contains: q as string, mode: 'insensitive' } },
                ]
            },
            select: {
                examinee_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                username: true,
            },
            orderBy: {
                [_sort as any]: _order as 'asc' | 'desc'
            },
            skip,
            take: limit

        });
        return res.status(200).json({
            data,
            totalPages
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        })
    }
};


export const insertExaminee = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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

export const updateExaminee = async (req: Request, res: Response): Promise<Response> => {
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

export const deleteExaminee = (req: Request, res: Response): Promise<Response> => {
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

