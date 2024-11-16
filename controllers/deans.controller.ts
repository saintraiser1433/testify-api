import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { deansValidation } from '../util/validation';


export const getDeans = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const data = await prisma.deans.findMany({
            select: {
                deans_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                username: true,
                status: true,
                department_id:true,
                department: {
                    select: {
                        department_id: true,
                        department_name: true,
                    },
                },
            },
            orderBy: [
                {
                    deans_id: "asc",
                },
                {
                    status: "desc",
                },
            ],
        });
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
};


export const insertDeans = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { error, value } = deansValidation.insert(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })

        }

        const deans = await tx.deans.findFirst({
            where: {
                AND: [{ first_name: value.first_name }, { last_name: value.last_name }],
            },
        });

        if (deans) {
            return res.status(409).json({
                error: "This deans already existing",
            })

        }

        const checkAssociateDept = await tx.deans.findFirst({
            where: {
                department_id: Number(value.department_id),
            },
        });

        if (checkAssociateDept) {
            return res.status(409).json({
                error: "Already taken department",
            })

        }

        const response = await tx.deans.create({
            data: value,
        });
        return res.status(201).json({
            message: "Dean created successfully",
            data: response,
        })

    });
}

export const updatedDeans = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { error, value } = deansValidation.update(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })

        }

        const deans = await tx.deans.findFirst({
            where: {
                deans_id: Number(id),
            },
        });



        if (!deans) {
            return res.status(400).json({
                error: "Deans not found",
            })

        }

        const checkAssociateDept = await tx.deans.findFirst({
            where: {
                department_id: Number(value.department_id),
            },
        });

        if (checkAssociateDept) {
            return res.status(409).json({
                error: "Already taken department",
            })

        }

        const response = await tx.deans.update({
            where: {
                deans_id: Number(id),
            },
            data: value,
        });
        return res.status(200).json({
            message: "Deans updated successfully",
            data: response,
        })
    });
}

export const deleteDeans = (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const course = await tx.course.findFirst({
            where: {
                course_id: Number(id),
            },
        });

        if (!course) {
            return res.status(404).json({
                error: "Course not found",
            })

        }

        await prisma.course.delete({
            where: {
                course_id: Number(id),
            },
        });
        return res.status(201).json({
            error: "Course deleted successfully",
        })

    });
}

//assigned Deans
export const assignDeans = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    try {
        const response = await prisma.assignDeans.create({
            data: body,
        });
        return res.status(201).json({
            message: "Successfully assigned course",
            data: response,
        })
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
}

export const getAssignDeans = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const id = req.params.id;
    try {
        const data = await prisma.assignDeans.findMany({
            select: {
                deans_id:true,
                course_id:true,
                course: {
                    select: {
                        course_id: true,
                        description: true,
                    },
                },
            },
            where: {
                deans_id: Number(id),
            },
        });

        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
};

export const deleteAssignDeans = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const deansId = req.params.deansId;
    const courseId = req.params.courseId
    try {
        const response = await prisma.assignDeans.delete({
            where: {
                deans_id_course_id: {
                    deans_id: Number(deansId),
                    course_id: Number(courseId),
                },
            },
        });

        return res.status(200).json({
            message: "Deleted successfully",
            data: response
        })
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
}



