import { NextFunction, Request, Response } from "express";
import { courseValidation, handleValidationError } from "../util/validation";
import { handlePrismaError } from "../util/prismaErrorHandler";
import { courseNoAssociated, deleteCourse, getCourse, insertCourse, updateCourse } from "../services/course.services";

export const getAllCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const data = await getCourse();
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
    const data = await courseNoAssociated()
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error } = courseValidation.insert(body);
    if (error) {
      return handleValidationError(error, res);
    }

    const response = await insertCourse(body);
    return res.status(201).json({
      message: "Course created successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error } = courseValidation.update(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await updateCourse(body, id);
    return res.status(202).json({
      message: "Course updated successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await deleteCourse(id);
    return res.status(201).json({
      message: "Course deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};


