// services/summaryService.ts

import { ExamPassed, QuestionPercentage, RegisteredVsCompletedModel } from "../models";
import prisma from "../prisma/prisma";

export const getExamCount = async () => {
  return await prisma.exam.count({
    where: {
      status: true,
    },
  });
};

export const getRegisteredVsCompletedExaminees = async (): Promise<RegisteredVsCompletedModel[]> => {
  return await prisma.$queryRaw`
    SELECT 
      TO_CHAR(dates.createdDate, 'Mon DD, YYYY') AS formatted_date,
      COALESCE(reg.registered, 0) "Registered",
      COALESCE(com.completed, 0) "Completed"
    FROM (
      -- Get unique dates from both tables
      SELECT DISTINCT DATE("createdAt") AS createdDate 
      FROM "User"
      WHERE role = 'examinee'
      UNION
      SELECT DISTINCT DATE("createdAt") 
      FROM "ExamAttempt"
    ) AS dates
    LEFT JOIN (
      -- Count registered examinees per day
      SELECT 
        DATE("createdAt") AS createdDate,
        COUNT(*)::integer AS registered
      FROM "User"
      WHERE role = 'examinee'
      GROUP BY createdDate
    ) AS reg ON dates.createdDate = reg.createdDate
    LEFT JOIN (
      -- Count completed examinees per day
      SELECT 
        DATE("createdAt") AS createdDate,
        COUNT(DISTINCT examinee_id)::integer AS completed
      FROM "ExamAttempt"
      GROUP BY createdDate
    ) AS com ON dates.createdDate = com.createdDate
    ORDER BY dates.createdDate
  `;
};

export const getExamPassed = async (): Promise<ExamPassed[]> => {
  return await prisma.$queryRaw`
    SELECT
      ext.exam_id,
      ext.exam_title,
      COUNT(DISTINCT quest.question_id)::integer "totalQuestions",
      COUNT(DISTINCT examans.examinee_id)::integer "totalExaminee",
      COALESCE(SUM(
        CASE 
          WHEN choice.status = true THEN 1 
          ELSE 0 
        END
      ), 0)::integer "totalCorrect"
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


export const getQuestionPercentage = async () : Promise<QuestionPercentage[]> => {
  return await prisma.$queryRaw`
  SELECT
      exam.exam_title,
      quest.question,
      COALESCE(eqt.correct_answer_count, 0)::integer "totalCorrect",
      COALESCE(a.exam_attempt_count, 0)::integer "totalAttempt"
  FROM
      "Exam" exam
  INNER JOIN
      "Question" quest ON exam.exam_id = quest.exam_id
  LEFT JOIN (
      SELECT
          ea.question_id,
          COUNT(ea.examinee_id) AS correct_answer_count
      FROM
          "Answers" ea
      JOIN
          "Choices" ch ON ea.choices_id = ch.choices_id AND ch.status = true
      GROUP BY
          ea.question_id
  ) eqt ON quest.question_id = eqt.question_id
  LEFT JOIN (
      SELECT
          exam_id,
          COUNT(exam_id) AS exam_attempt_count
      FROM
          "ExamAttempt"
      GROUP BY
          exam_id
  ) a ON exam.exam_id = a.exam_id
  ORDER BY
      exam.exam_id,
      quest.question_id
`;
}

export const getCoursePassed = async (allResults: any[], allCourses: any[]) => {
  return allCourses.reduce((group: any, item: any) => {
    for (const ch of allResults) {
      const courseId = item.course_id;
      if (!group[courseId]) {
        group[courseId] = {
          name: item.description,
          value: 0,
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