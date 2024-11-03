import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { courseValidation } from '../util/validation';


export const getCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const data = await prisma.course.findMany({
            select: {
                course_id: true,
                description: true,
                score: true,
            },
            orderBy: {
                course_id: "asc",
            },
        });
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
};

export const getCourseNoAssociated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const response = await prisma.course.findMany({
            where: {
                AND: [
                    {
                        AssignDeans: {
                            none: {},
                        },
                    },
                ],
            },
        });
        return res.status(200).json(response);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
};


export const insertCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const body = req.body;
    try {
        return prisma.$transaction(async (tx) => {
            const { error, value } = courseValidation.insert(body);

            if (error) {
                return res.status(400).json({
                    error: error.details[0].message,
                })

            }

            const course = await tx.course.findFirst({
                where: {
                    description: value.description,
                },
            });

            if (course) {
                throw new Error("Course already exist")
            }

            const response = await tx.course.create({
                data: value,
            });
            return res.status(201).json({
                message: "Course created successfully",
                data: response,
            })
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        })
    }

}

export const updateCourse = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const { error, value } = courseValidation.update(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })

        }

        const course = await tx.course.findFirst({
            where: {
                course_id: Number(id),
            },
        });

        if (!course) {
            return res.status(409).json({
                error: "Course not found",
            })

        }

        const response = await tx.course.update({
            where: {
                course_id: Number(id),
            },
            data: value,
        });
        return res.status(202).json({
            message: "Course updated successfully",
            data: response,
        })

    });
}

export const deleteCourse = (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const course = await tx.course.findFirst({
            where: {
                course_id: Number(id),
            },
        });

        if (!course) {
            return res.status(400).json({
                error: "Course not found",
            })

        }

        await prisma.course.delete({
            where: {
                course_id: Number(id),
            },
        });
        return res.status(201).json({
            message: "Course deleted successfully",
        })

    });
}

