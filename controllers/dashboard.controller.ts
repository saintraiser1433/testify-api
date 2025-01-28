import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { handlePrismaError } from "../util/prismaErrorHandler";
import { allResult } from "../services/results.services";
import { getCourse } from "../services/course.services";
import { CourseModel, Exam, ExamModel, GroupedCoursesMap, GroupedExamMap, GroupExamPassedMap } from "../models";
import { getExamService } from "../services/exam.services";

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

    const allResults = await allResult();
    const allCourses = await getCourse();
    const allExam = await getExamService();

    const getCoursePassed = allCourses.reduce((group: GroupedCoursesMap, item: CourseModel) => {
      for (const ch of allResults) {
        const courseId = item.course_id;
        if (!group[courseId]) {
          group[courseId] = {
            course_name: item.description,
            totalPassed: 0
          };
        }
        // Update the condition to include equality
        const isPassed = ch.totalCorrect >= item.score;

        if (isPassed) {
          group[courseId].totalPassed++;
        }
      }
      return group;
    }, {} as GroupedCoursesMap);


    // const getExamPassed = allExam.reduce((group: GroupExamPassedMap, item: Exam) => {
    //   for (const data of allResults) {
    //     const examId = item.exam_id;
    //     if (!group[examId]) {
    //       group[examId] = {
    //         exam_name: item.exam_title,
    //         totalPassed: 0
    //       };
    //     }
    //     const percentage = parseInt(((data.totalCorrect / data.totalQuestions) * 100).toFixed(2));
    //     const isPassed = percentage >
    //   }




    //   // const isPassed = item.score > ch.totalCorrect;

    //   // if (isPassed) {
    //   //   group[examId].totalPassed++;
    //   // }

    //   return group;
    // }, {} as GroupExamPassedMap)




    const finalMap = {
      summary: {
        registeredExaminee: examineeCount,
        completedExaminee: totalCompleteExaminee,
        totalCourse: courseCount,
        totalExams: examCount
      },
      regExaminee: registeredExaminee,
      comExaminee: completedExaminees,
      coursesPassed: Object.values(getCoursePassed)


    }

    return res.status(200).json(finalMap);
  } catch (err) {
    return handlePrismaError(err, res);

  }
};


