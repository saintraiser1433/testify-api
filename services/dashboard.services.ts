// services/summaryService.ts

import { RegisterCompletedModel } from "../models";
import prisma from "../prisma/prisma";



export const getCourseCount = async () => {
    return await prisma.course.count();
};

export const getExamCount = async () => {
    return await prisma.exam.count({
        where: {
            status: true
        }
    });
};


export const getRegisteredExaminee = async (): Promise<RegisterCompletedModel[]> => {
    return await prisma.$queryRaw`
    SELECT 
      TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as keyDate,
      COUNT(*)::integer as count 
    FROM 
      "User" 
    WHERE role = 'examinee'
    GROUP BY 
      keyDate
    ORDER BY 
      keyDate ASC;
  `;
};

export const getCompletedExaminees = async (): Promise<RegisterCompletedModel[]> => {
    return await prisma.$queryRaw`
    SELECT 
      TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as keyDate,
      COUNT(DISTINCT examinee_id)::integer as count
    FROM 
      "ExamAttempt"
    GROUP BY
      keyDate
    ORDER BY 
      keyDate ASC;
  `;
};

export const getExamPassed = async () => {
    return await prisma.$queryRaw`
    SELECT
      ext.exam_id,
      ext.exam_title,
      COUNT(DISTINCT quest.question_id)::integer AS total_questions,
      COUNT(DISTINCT examans.examinee_id)::integer AS total_examinees,
      COALESCE(SUM(
          CASE 
              WHEN choice.status = true THEN 1 
              ELSE 0 
          END
      ), 0)::integer AS total_correct_answers
    FROM
      "Exam" ext
    LEFT JOIN "Question" quest ON ext.exam_id = quest.exam_id
    LEFT JOIN "Choices" choice ON quest.question_id = choice.question_id
    LEFT JOIN "Answers" examans ON choice.choices_id = examans.choices_id
    GROUP BY
      ext.exam_id,
      ext.exam_title
  `;
};

export const getCoursePassed = async (allResults: any[], allCourses: any[]) => {
    return allCourses.reduce((group: any, item: any) => {
        for (const ch of allResults) {
            const courseId = item.course_id;
            if (!group[courseId]) {
                group[courseId] = {
                    course_name: item.description,
                    totalPassed: 0
                };
            }
            const isPassed = ch.totalCorrect >= item.score;
            if (isPassed) {
                group[courseId].totalPassed++;
            }
        }
        return group;
    }, {});
};