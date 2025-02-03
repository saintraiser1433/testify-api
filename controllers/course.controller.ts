import { NextFunction, Request, Response } from "express";
import { courseValidation, handleValidationError } from "../util/validation";
import { checkCourseIfExist, courseNoAssociated, deleteCourse, getCourse, getCourseById, insertCourse, updateCourse } from "../services/course.services";

export const getAllCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = await getCourse();
    return res.status(200).json(data);
  } catch (err) {
    next(err)
  }
};

export const getCourseNoAssociated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = await courseNoAssociated()
    return res.status(200).json(data);
  } catch (err) {
    next(err)
  }
};

export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  try {
    const { error, value } = courseValidation.insert(body);
    if (error) {
      next(error)
    }

    const existingCourse = await checkCourseIfExist(value.description);
    if (existingCourse) {
      return res.status(409).json({ message: "Course already exists" });
    }

    const response = await insertCourse(body);
    return res.status(201).json({
      message: "Course created successfully",
      data: response,
    });
  } catch (err) {
    next(err)
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = courseValidation.update(body);

    if (error) {
      next(error)
    }

    const existingCourse = await getCourseById(Number(req.params.id));
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (value.description !== existingCourse.description) {
      const existingCourse = await checkCourseIfExist(value.description);
      if (existingCourse) {
        return res.status(409).json({ message: "Course already exists" });
      }
    }

    const response = await updateCourse(body, id);
    return res.status(202).json({
      message: "Course updated successfully",
      data: response,
    });
  } catch (err) {
    next(err)
  }

};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    await deleteCourse(id);
    return res.status(201).json({
      message: "Course deleted successfully",
    });
  } catch (err) {
    next(err)
  }

};


