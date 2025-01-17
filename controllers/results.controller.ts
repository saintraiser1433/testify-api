import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import { AllResultModel, SummaryResult } from "../models";



export const getSummaryByExaminee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.examineeId;

  try {

    const checkExamineeId = await prisma.user.findFirst({
      where: {
        id: id
      }
    });

    if (!checkExamineeId) {
      return res.status(404).json({
        status: res.statusCode,
        message: "Examinee not found",
      })
    }

    // Fetch results
    const results = await prisma.$queryRaw<SummaryResult[]>`		
    SELECT 
    e.exam_id,
    e.exam_title,
    u.id "examinee_id",
    u.first_name,
    u.last_name,
    u.middle_name,
    f.birth_date,
    f.school,
    f.email,
    f.address,
	  f.gender,
    f.contact_number,
	(SELECT COUNT(*) FROM "ExamAttempt" WHERE examinee_id = u.id )::integer as examAttempt,
	(SELECT COUNT(exam_id) FROM "Exam")::integer as examCnt,	
    COUNT(DISTINCT q.question_id)::integer AS total_questions,
    COUNT(DISTINCT 
        CASE 
            WHEN ch.status = true AND a.question_id IS NOT NULL 
            THEN a.question_id 
        END
    )::integer AS total_correct_answers
FROM 
    "Exam" e
INNER JOIN 
    "Question" q ON e.exam_id = q.exam_id
INNER JOIN 
    "Choices" ch ON q.question_id = ch.question_id 
LEFT JOIN 
    "Answers" a ON ch.question_id = a.question_id 
        AND a.examinee_id = ${id}
CROSS JOIN 
    (SELECT
        id,
        first_name,
        last_name,
        middle_name
     FROM 
        "User" 
     WHERE 
        id = ${id}
    ) u
CROSS JOIN 
    (SELECT
        birth_date,
        school,
        email,
        address,
        contact_number,
	    gender
     FROM 
        "FollowUp" 
     WHERE 
        examinee_id = ${id}
    ) f
GROUP BY 
    e.exam_id,
    e.exam_title,
    u.id,
    u.first_name,
    u.last_name,
    u.middle_name,
    f.birth_date,
    f.school,
    f.email,
    f.address,
    f.contact_number,
	  f.gender`;



    const mapData = results.map((item) => ({
      exam_id: item.exam_id,
      exam_title: item.exam_title,
      total_correct_answers: item.total_correct_answers,
      total_questions: item.total_questions,
    }))
    const summaryHeader = {
      examinee_id: results[0].examinee_id,
      first_name: results[0].first_name,
      last_name: results[0].last_name,
      middle_name: results[0].middle_name,
      birth_date: results[0].birth_date,
      school: results[0].school,
      email: results[0].email,
      address: results[0].address,
      contact_number: results[0].contact_number,
      examCnt: results[0].examcnt,
      examAttempt: results[0].examattempt,
      examDetails: mapData
    }




    return res.status(200).json(results[0].examinee_id ? summaryHeader : []);

  } catch (err: any) {
    await prisma.$executeRaw`ROLLBACK`;
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await prisma.$queryRaw<AllResultModel[]>`
        SELECT 
        u.id::TEXT as examinee_id,
        u.first_name,
        u.last_name,
        u.middle_name,
        
          (SELECT COUNT(*) FROM "Question")::integer as total_questions,
          COUNT(DISTINCT 
              CASE 
                  WHEN ch.status = true AND a.question_id IS NOT NULL 
                  THEN a.question_id 
              END
          )::integer AS total_correct_answers
      FROM 
          "Question" q 
      INNER JOIN "Exam" e ON e.exam_id = q.exam_id
      INNER JOIN 
          "Choices" ch ON q.question_id = ch.question_id 
      RIGHT JOIN  
          "Answers" a ON ch.question_id = a.question_id
      INNER JOIN
          "User" u ON a.examinee_id = u.id
      GROUP BY 
          u.id,
        u.first_name,
        u.last_name,
        u.middle_name`;

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      message: "An error occurred while fetching total score",
      error: err.message,
    });
  }
};


