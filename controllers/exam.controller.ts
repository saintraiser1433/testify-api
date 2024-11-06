import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { examValidation } from '../util/validation';


export const getExam = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const data = await prisma.exam.findMany({
            select: {
                exam_id: true,
                description: true,
                exam_title: true,
                question_limit: true,
                status: true,
                time_limit: true,
            },
            orderBy: {
                exam_id: "asc",
            },
        });
        return res.status(200).json(data);
    } catch (err:any) {
        return res.status(500).json({
            error: err.message
        })
    }
};

export const getExamId = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const id = req.params.id;
    try {
        const response = await prisma.exam.findFirstOrThrow({
            where: {
                exam_id: Number(id),
            },
        });
        return res.status(200).json(response);
    } catch (err:any) {
        return res.status(500).json({
            error: err.message
        })
    }
};


export const insertExam = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examValidation.update(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })

        }

        const exam = await tx.exam.findFirst({
            where: {
                exam_title: value.exam_title,
            },
        });

        if (exam) {
            return res.status(409).json({
                error: "Exam Title already exist",
            })
        }

        const response = await tx.exam.create({
            data: value,
        });
        return res.status(200).json({
            message: "Exam created successfully",
            data: response,
        })

    });
}

export const updateExam = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const { error, value } = examValidation.update(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })

        }

        const department = await tx.exam.findFirst({
            where: {
                exam_id: Number(id),
            },
        });

        if (!department) {
            return res.status(404).json({
                error: "Exam not found"
            })

        }

        const response = await tx.exam.update({
            where: {
                exam_id: Number(id),
            },
            data: value,
        });
        return res.status(200).json({
            message: "Exam updated successfully",
            data: response,
        })

    });
}

export const deleteExam = (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const exam = await tx.exam.findFirst({
            where: {
                exam_id: Number(id),
            },
        });

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found",
            })

        }

        await prisma.exam.delete({
            where: {
                exam_id: Number(id),
            },
        });
        return res.status(200).json({
            message: "Exam deleted successfully",
        })
    });
}

