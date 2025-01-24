import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { courseValidation, handleValidationError } from "../util/validation";
import { appLogger } from "../util/logger";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
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
    return handlePrismaError(err, res);
  }
};

export const getCourseNoAssociated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const response = await prisma.course.findMany({
      where: {
        AND: [
          {
            assignDeansList: {
              none: {},
            },
          },
        ],
      },
    });
    return res.status(200).json(response);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = courseValidation.insert(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await prisma.course.create({
      data: value,
    });
    return res.status(201).json({
      message: "Course created successfully",
      data: response,
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = courseValidation.update(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await prisma.course.update({
      where: {
        course_id: Number(id),
      },
      data: value,
    });
    return res.status(202).json({
      message: "Course updated successfully",
      data: response,
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }

};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await prisma.course.delete({
      where: {
        course_id: Number(id),
      },
    });
    return res.status(201).json({
      message: "Course deleted successfully",
    });
  } catch (err: unknown) {
    return handlePrismaError(err, res);
  }

};


