import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";


export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {

    interface RegisterCompletedModel {
      keyDate: string;
      count: number;
    }

    // Unified summary logic
    const getSummary = async () => {
      // Perform all queries in parallel
      const [
        examineeCount,
        courseCount,
        examCount,
        completedExaminee,
        registeredExaminee,
        completedExaminees,
      ] = await Promise.all([
        // Count examinees
        prisma.user.count({
          where: { role: 'examinee' },
        }),

        // Count courses
        prisma.course.count(),

        // Count active exams
        prisma.exam.count({
          where: { status: true },
        }),

        // Count examinees who completed all active exams
        (async () => {
          const activeExamCount = await prisma.exam.count({
            where: { status: true },
          });

          return prisma.examAttempt.groupBy({
            by: ['examinee_id'],
            _count: {
              exam_id: true,
            },
            having: {
              exam_id: {
                _count: {
                  equals: activeExamCount,
                },
              },
            },
          });
        })(),

        // Registered examinee summary
        prisma.$queryRaw<RegisterCompletedModel[]>`
          SELECT 
            TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') AS keyDate,
            COUNT(*)::integer AS count 
          FROM 
            "User" 
          GROUP BY 
            keyDate
          ORDER BY 
            keyDate ASC;
        `,

        // Completed examinees summary
        prisma.$queryRaw<RegisterCompletedModel[]>`
          SELECT 
            TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') AS keyDate,
            COUNT(DISTINCT examinee_id)::integer AS count
          FROM 
            "ExamAttempt"
          GROUP BY
            keyDate
          ORDER BY 
            keyDate ASC;
        `,
      ]);

      // Return all the data as a structured response
      return {
        examineeCount,
        courseCount,
        examCount,
        completedExaminee,
        registeredExaminee,
        completedExaminees,
      };
    };

    const datas = await getSummary();

    const totalCompleteExaminee = datas.completedExaminee.map((entry) => entry.examinee_id).length;
    const finalMap = {
      summary: {
        registeredExaminee: datas.examineeCount,
        completedExaminee: totalCompleteExaminee,
        totalCourse: datas.courseCount,
        totalExams: datas.examCount
      },
      registeredExaminee: datas.registeredExaminee,
      completedExaminees: datas.completedExaminees



    }
    return res.status(200).json(finalMap);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


