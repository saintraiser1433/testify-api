import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";


export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    // const data = await prisma.user.aggregate({
    //   _count: {
    //     id: true,

    //   },

    //   where: {
    //     role:'examinee'
    //   }

    // });

    const data = await prisma.user.count({
      where: {
        role: 'examinee'
      }
    });

    const exams = await prisma.exam.count({
      where: {
        status: true
      }
    })

    const course = await prisma.course.count()

    


    return res.status(200).json(exams);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


