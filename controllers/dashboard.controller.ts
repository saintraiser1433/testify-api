import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {


    //for summary
    const [examineeCount, courseCount, examCount, completedExaminee] = await Promise.all([
      //count total registered examinee
      await prisma.user.count({
        where: {
          role: 'examinee'
        }
      }),
      //count total courses
      await prisma.course.count(),
      //count total exams
      await prisma.exam.count({
        where: {
          status: true
        }
      }),
      //count total completed examinee
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
      regExaminee: registeredExaminee,
      comExaminee: completedExaminees



    }

    return res.status(200).json(finalMap);
  } catch (err: any) {
    return handlePrismaError(err, res);

  }
};


