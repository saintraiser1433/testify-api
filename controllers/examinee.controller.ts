import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { examineeValidation, handleValidationError } from "../util/validation";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
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
        role: "examinee",
      },
    });
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = examineeValidation.insert(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { first_name: value.first_name },
          { last_name: value.last_name },
          { middle_name: value.middle_name },
          { role: "examinee" },
        ],
      },
    });

    if (user) {
      return res.status(409).json({
        message: "Student already exist",
      });
    }

    const response = await prisma.user.create({
      data: value,
    });
    return res.status(201).json({
      message: "Student created successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const updateExaminee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = examineeValidation.update(body);

    if (error) {
      return handleValidationError(error, res);
    }


    const response = await prisma.user.update({
      where: {
        id: id,
      },
      data: value,
    });

    return res.status(200).json({
      message: "Student updated successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const deleteExaminee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};
