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
                status: res.statusCode,
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


export const upsertSessionAnswer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { examinee_id, exam_id, time_limit, question_id, choices_id } = req.body;

    try {
        await prisma.$transaction(async (prisma) => {

            const existingSession = await prisma.sessionHeader.findFirst({
                where: {
                    examinee_id: examinee_id,
                    exam_id: exam_id
                }
            });


            const upsertSessionHeader = await prisma.sessionHeader.upsert({
                where: {
                    session_id: existingSession?.session_id || ''
                },
                update: {
                    timelimit: parseInt(time_limit),
                    examinee_id: examinee_id,
                    exam_id: exam_id
                },
                create: {
                    timelimit: parseInt(time_limit),
                    examinee_id: examinee_id,
                    exam_id: exam_id
                },
            });


            const upsertSessionDetail = await prisma.sessionDetails.upsert({
                where: {
                    question_id_sessionHeader_id: {
                        question_id: question_id,
                        sessionHeader_id: upsertSessionHeader.session_id
                    }
                },
                update: {
                    sessionHeader_id: upsertSessionHeader.session_id,
                    question_id: question_id,
                    choices_id: choices_id
                },
                create: {
                    sessionHeader_id: upsertSessionHeader.session_id,
                    question_id: question_id,
                    choices_id: choices_id
                },
            });

            return { upsertSessionHeader, upsertSessionDetail };
        });

        return res.status(200).json({
            status: res.statusCode,
            message: "Upsert operation successful",
        });
    } catch (err: any) {

        return res.status(500).json({
            status: res.statusCode,
            message: "An error occurred during the upsert operation.",
            error: err.message,
        });
    }
};



export const deleteSessionAnswer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { examineeId, examId } = req.params;
    try {
        const sessionId = await prisma.sessionHeader.findFirst({
            where: {
                examinee_id: examineeId,
                exam_id: Number(examId)
            }
        })

        if (!sessionId) {
            return res.status(404).json({
                status: res.statusCode,
                message: "Session not found",
            });
        }
        console.log(sessionId)

        await prisma.sessionHeader.delete({
            where: {
                session_id: sessionId.session_id
            }
        });

        return res.status(200).json({
            status: res.statusCode,
            message: "Session deleted successfully",
        });
    } catch (err: any) {
        return res.status(500).json({
            status: res.statusCode,
            message: "An error occurred during the delete operation.",
            error: err.message
        });
    }

}