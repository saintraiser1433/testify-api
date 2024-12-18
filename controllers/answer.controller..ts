import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { answerModel, TotalScoreResult } from '../models';



export const insertAnswer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    try {
        return prisma.$transaction(async (tx) => {
            // const { error, value } = courseValidation.insert(body);

            // if (error) {
            //     return res.status(400).json({
            //         message: error.details[0].message,
            //     })

            // }

            // const course = await tx.course.findFirst({
            //     where: {
            //         description: value.description,
            //     },
            // });

            // if (course) {
            //     return res.status(409).json({
            //         message: "Course already exist",

            //     })
            // }

            //insertion  attempt
            await tx.examAttempt.create({
                data: {
                    examinee_id: body.examinee_id,
                    exam_id: body.exam_id
                }
            })
            const response = await tx.answers.createMany({
                data: body.details.map((detail: answerModel) => ({
                    examinee_id: body.examinee_id,
                    exam_id: body.exam_id,
                    question_id: detail.question_id,
                    choices_id: detail.choices_id,
                })),
            });
            return res.status(201).json({
                message: "Submitted Successfully",
                data: response,
            })
        });
    } catch (err: any) {
        return res.status(500).json({
            message: err.message,
        })
    }

}


export const getTotalScore = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.examineeId;

    try {
        const result = await prisma.$queryRaw<TotalScoreResult[]>`
            SELECT
                COUNT(DISTINCT quest.question_id) AS total_questions,
                COUNT(
                    DISTINCT CASE WHEN choice.status = true THEN ans.question_id END
                ) AS total_correct_answers,
                (SELECT COUNT(exam_id) from "Exam") as examcnt,
                (SELECT COUNT(exam_id) from "ExamAttempt" where examinee_id = ${id}) as "examAttempt"

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
            total_questions: Number(item.total_questions),
            total_correct_answers: Number(item.total_correct_answers),
            examcnt: Number(item.examcnt),
            examAttempt: Number(item.examAttempt)
        }));


        const sumTotalQuestions = serializedResult.reduce((sum, item) => sum + item.total_questions, 0);
        const sumTotalCorrectAnswers = serializedResult.reduce((sum, item) => sum + item.total_correct_answers, 0);
        const data = {
            correct: sumTotalCorrectAnswers,
            questions: sumTotalQuestions,
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


