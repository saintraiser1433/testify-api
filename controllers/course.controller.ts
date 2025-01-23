import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { courseValidation } from "../util/validation";
import { appLogger } from "../util/logger";

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
    appLogger.error("Error during fetching course:", { err, body: req.body, params: req.params });
    return res.status(500).json({
      message: err.message,
    });
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
    appLogger.error("Error during fetching course with no associate:", { err, body: req.body, params: req.params });
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const insertCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    return prisma.$transaction(async (tx) => {
      const { error, value } = courseValidation.insert(body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const course = await tx.course.findFirst({
        where: {
          description: value.description,
        },
      });

      if (course) {
        return res.status(409).json({
          message: "Course already exist",
        });
      }

      const response = await tx.course.create({
        data: value,
      });
      return res.status(201).json({
        message: "Course created successfully",
        data: response,
      });
    });
  } catch (err: any) {
    appLogger.error("Error during insertion course:", { err, body: req.body, params: req.params });
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    return prisma.$transaction(async (tx) => {
      const { error, value } = courseValidation.update(body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }

      const course = await tx.course.findFirst({
        where: {
          course_id: Number(id),
        },
      });

      if (!course) {
        return res.status(409).json({
          message: "Course not found",
        });
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
      });
    });
  } catch (err: any) {
    appLogger.error("Error during updating course:", { err, body: req.body, params: req.params });
    return res.status(500).json({
      message: err.message,
    });
  }

};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    return prisma.$transaction(async (tx) => {
      const course = await tx.course.findFirst({
        where: {
          course_id: Number(id),
        },
      });

      if (!course) {
        return res.status(400).json({
          message: "Course not found",
        });
      }

      await prisma.course.delete({
        where: {
          course_id: Number(id),
        },
      });
      return res.status(201).json({
        message: "Course deleted successfully",
      });
    });
  } catch (err: unknown) {
    // const error = err instanceof Error ? err : new Error('Unknown error');

    // appLogger.error("Error during course deletion:", {
    //   error: error.message,
    //   stack: error.stack,
    //   params: req.params
    // });

    return res.status(500).json({
      message: "Internal server error"
    });

  }

};
