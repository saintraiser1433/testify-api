import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { departmentValidation, handleValidationError } from "../util/validation";
import { appLogger } from "../util/logger";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
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
    return handlePrismaError(err, res);

  }
};

export const insertDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = departmentValidation.validate(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await prisma.department.create({
      data: value,
    });
    return res.status(201).json({
      message: "Department created successfully",
      data: response,
    });
  } catch (err: any) {
    return handlePrismaError(err, res);

  }
};

export const updateDepartment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = departmentValidation.validate(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await prisma.department.update({
      where: {
        department_id: Number(id),
      },
      data: value,
    });
    return res.status(200).json({
      message: "Department updated successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const deleteDepartment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await prisma.department.delete({
      where: {
        department_id: Number(id),
      },
    });
    return res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);

  }

};
