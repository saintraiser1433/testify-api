import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";


export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {


    //for summary
    const [examineeCount, courseCount, examCount, completedExaminee] = await Promise.all([
      //for
      await prisma.user.count({
        where: {
          role: 'examinee'
        }
      }),
      await prisma.course.count(),
      await prisma.exam.count({
        where: {
          status: true
        }
      }),
      await prisma.examAttempt.groupBy({
        by: ['examinee_id'],
        _count: {
          exam_id: true
        },
        having: {
          examinee_id: {
            _count: {
              equals: await prisma.exam.count({
                where: { status: true },
              }),
            }
          }
        }
      })

    ])

    const totalCompleteExaminee = completedExaminee.map((entry) => entry.examinee_id).length;




    interface RegisterCompletedModel {
      keyDate: string,
      count: number,
    }





    const registeredExaminee = await prisma.$queryRaw<RegisterCompletedModel[]>`
      SELECT 
      TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as keyDate,
        COUNT(*)::integer as count 
      FROM 
        "User" 
      GROUP BY 
      keyDate
      ORDER BY 
      keyDate ASC;
    `;

    const completedExaminees = await prisma.$queryRaw<RegisterCompletedModel[]>`
          SELECT 
          TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as keyDate,
            COUNT(DISTINCT examinee_id)::integer as cnt
          FROM 
            "ExamAttempt"

          GROUP BY
          keyDate

          ORDER BY 
          keyDate ASC;
          `;

          
















    const finalMap = {
      summary: {
        registeredExaminee: examineeCount,
        completedExaminee: totalCompleteExaminee,
        totalCourse: courseCount,
        totalExams: examCount
      },
      registeredExaminee,
      completedExaminees



    }




    return res.status(200).json(finalMap);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


