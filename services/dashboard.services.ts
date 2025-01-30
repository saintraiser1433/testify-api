// services/summaryService.ts

import { KeyValue } from "../models";
import prisma from "../prisma/prisma";


export const getExamineeCount = async() => {
  return await prisma.user.count({
    where: {
      role: 'examinee'
    }
  })
}


  

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


export const getRegisteredExaminee = async (): Promise<KeyValue[]> => {
    return await prisma.$queryRaw`
    SELECT 
      TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as "name",
      COUNT(*)::integer as "value" 
    FROM 
      "User" 
    WHERE role = 'examinee'
    GROUP BY 
    name
    ORDER BY 
    name ASC;
  `;
};

export const getCompletedExaminees = async (): Promise<KeyValue[]> => {
    return await prisma.$queryRaw`
    SELECT 
      TO_CHAR(DATE("createdAt"), 'Mon DD, YYYY') as "name",
      COUNT(DISTINCT examinee_id)::integer as "value"
    FROM 
      "ExamAttempt"
    GROUP BY
    name
    ORDER BY 
    name ASC;
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
                    name: item.description,
                    value: 0
                };
            }
            const isPassed = ch.totalCorrect >= item.score;
            if (isPassed) {
                group[courseId].value++;
            }
        }
        return group;
    }, {});
};