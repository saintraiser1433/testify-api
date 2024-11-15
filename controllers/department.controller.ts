import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { departmentValidation } from '../util/validation';


export const getDepartment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const data = await prisma.department.findMany({
            select: {
                department_id: true,
                department_name: true,
                status: true,
            },
            orderBy: {
                department_id: "asc",
            },
        });
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        });

    }
};


export const insertDepartment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    try {
        const data = prisma.$transaction(async (tx) => {
            const { error, value } = departmentValidation.validate(body);

            if (error) {
                return res.status(400).json({
                    error: error.details[0].message,
                })
            }

            const department = await tx.department.findFirst({
                where: {
                    department_name: value.department_name,
                },
            });

            if (department) {
                return res.status(409).json({
                    error: "Department already exist",
                })
            }

            const response = await tx.department.create({
                data: value,
            });
            return res.status(201).json({
                message: "Department created successfully",
                data: response,
            })
        });
        return data;
    } catch (err:any) {
        return res.status(500).json({
            error: err.message
        });
    }

}

export const updateDepartment = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const { error, value } = departmentValidation.validate(body);

        if (error) {
            return res.status(400).json({
                error: error.details[0].message,
            })
        }

        const department = await tx.department.findFirst({
            where: {
                department_id: Number(id),
            },
        });

        if (!department) {
            return res.status(404).json({
                error: "Department not found",
            })
        }

        const response = await tx.department.update({
            where: {
                department_id: Number(id),
            },
            data: value,
        });
        return res.status(200).json({
            message: "Department updated successfully",
            data: response,
        })
    });
}

export const deleteDepartment = (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const department = await tx.department.findFirst({
            where: {
                department_id: Number(id),
            },
        });

        if (!department) {
            return res.status(404).json({
                error: "Department not found",
            })
        }

        await prisma.department.delete({
            where: {
                department_id: Number(id),
            },
        });
        return res.status(200).json({
            message: "Department deleted successfully",
        })

    });
}

