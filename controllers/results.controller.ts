import { Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { ScoreSummary, TotalScoreResult } from '../models';




export const getTotalScoreByExaminee = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.examineeId;

    try {
        const result = await prisma.$queryRaw<TotalScoreResult[]>`
            SELECT
                COUNT(DISTINCT quest.question_id) AS total_questions,
                COUNT(
                    DISTINCT CASE WHEN choice.status = true THEN ans.question_id END
                ) AS total_correct_answers,
                (SELECT COUNT(exam_id) from "Exam") as "examCnt",
                (SELECT COUNT(exam_id) from "ExamAttempt" where examinee_id = ${id}) as "attemptCnt"

            FROM
                "Exam" ext
            LEFT JOIN "Question" quest ON
                ext.exam_id = quest.exam_id
            LEFT JOIN "Choices" choice ON
                quest.question_id = choice.question_id
            LEFT JOIN "Answers" ans ON
                choice.choices_id = ans.choices_id AND ans.examinee_id = ${id}
            GROUP BY
                ext.exam_id,
                ext.exam_title
        `;

        const serializedResult = result.map((item: TotalScoreResult) => ({
            questions: Number(item.total_questions),
            correctAnswer: Number(item.total_correct_answers),
            examcnt: Number(item.examCnt),
            examAttempt: Number(item.attemptCnt)
        }));


        const sumTotalQuestions = serializedResult.reduce((sum, item) => sum + item.questions, 0);
        const sumTotalCorrectAnswers = serializedResult.reduce((sum, item) => sum + item.correctAnswer, 0);
        const data = {
            total_correct_answers: sumTotalCorrectAnswers,
            total_questions: sumTotalQuestions,
            examCnt: serializedResult[0]?.examcnt || 0,
            examAttempt: serializedResult[0]?.examAttempt || 0
        }

        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({
            message: 'An error occurred while fetching total score',
            error: err.message
        });
    }
}



export const getSummaryByExaminee = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.examineeId;

    try {
        const result = await prisma.$queryRaw<ScoreSummary[]>`
         SELECT
        ext.exam_id,
        ext.exam_title,
        COALESCE(COUNT(DISTINCT quest.question_id), 0) AS total_questions,
        COALESCE(COUNT(DISTINCT CASE choice.status WHEN true THEN examans.question_id END), 0) AS total_correct_answers,
    CASE
        WHEN COALESCE(COUNT(DISTINCT CASE choice.status WHEN true THEN examans.question_id END), 0) = 0 THEN 0
        ELSE CAST(
            COALESCE(COUNT(DISTINCT CASE choice.status WHEN true THEN examans.question_id END), 0) * 1.0 /
            COALESCE(COUNT(DISTINCT quest.question_id), 1) * 100
            AS NUMERIC(10, 2)
        )
    END AS success_rate
    FROM
        "Exam" ext
    LEFT JOIN "Question" quest ON
        ext.exam_id = quest.exam_id
    LEFT JOIN "Choices" choice ON
        quest.question_id = choice.question_id
    LEFT JOIN "Answers" examans ON
        choice.choices_id = examans.choices_id AND examans.examinee_id = ${id}
    GROUP BY
        ext.exam_id,
        ext.exam_title`;

        const serializedResult = result.map((item) => ({
            exam_id: Number(item.exam_id),
            exam_title: item.exam_title,
            total_questions: Number(item.total_questions),
            total_correct_answer: Number(item.total_correct_answers),
            success_rate: Number(item.success_rate),
        }))


        return res.status(200).json(serializedResult);
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        });
    }
}


export const getAllResult = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await prisma.$queryRaw<TotalScoreResult[]>`
        SELECT
            COALESCE(COUNT(DISTINCT quest.question_id), 0) AS total_questions,
            COALESCE(COUNT(DISTINCT CASE WHEN choice.status = true THEN ans.question_id END), 0) AS total_correct_answers,
            (SELECT COUNT(exam_id) FROM "Exam") AS "examCnt",
            (SELECT COUNT(exam_id) FROM "ExamAttempt" WHERE examinee_id = examinee.id) AS "attemptCnt",
            CONCAT(examinee.last_name, ' ', examinee.first_name, ' ',SUBSTRING(examinee.middle_name, 1, 1)) AS fullname
           
        FROM
            "Exam" ext
        LEFT JOIN "Question" quest ON ext.exam_id = quest.exam_id
        LEFT JOIN "Choices" choice ON quest.question_id = choice.question_id
        LEFT JOIN "Answers" ans ON choice.choices_id = ans.choices_id
        INNER JOIN "User" examinee ON examinee.id = ans.examinee_id
        LEFT JOIN "ExamAttempt" ea ON ea.examinee_id = examinee.id
        GROUP BY
            examinee.id
        ORDER BY 
            total_correct_answers DESC
    `;

        const serializedResult = result.map((item: TotalScoreResult) => ({
            total_questions: Number(item.total_questions),
            total_correct_answers: Number(item.total_correct_answers),
            examCnt: Number(item.examCnt),
            examAttempt: Number(item.attemptCnt),
            examineeName: item.fullname,
        })).filter((data) => data.examCnt === data.examAttempt);


        return res.status(200).json(serializedResult);
    } catch (err: any) {
        return res.status(500).json({
            message: 'An error occurred while fetching total score',
            error: err.message
        });
    }
}