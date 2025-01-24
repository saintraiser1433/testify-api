import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { answerModel, GroupedExamMap, Question } from "../models";
import { appLogger } from "../util/logger";
import { handlePrismaError } from "../util/prismaErrorHandler";


export const insertAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
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
                    exam_id: body.exam_id,
                },
            });
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
            });
        });
    } catch (err: unknown) {
        return handlePrismaError(err, res);
    }
};

export const getSessionAnswer = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { examineeId, examId } = req.params;
    try {
        const sessionDetails = await prisma.sessionHeader.findMany({
            select: {
                session_id: true,
                timelimit: true,
                examinee_id: true,
                exam_id: true,
                sessionDetails: {
                    select: {
                        question_id: true,
                        choices_id: true,
                    }
                }
            },
            where: {
                examinee_id: examineeId,
                exam_id: Number(examId),
            }
        });

        return res.status(200).json(sessionDetails)
    } catch (err: any) {
        return handlePrismaError(err, res);
    }
};

export const upsertSessionAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { examinee_id, exam_id, time_limit, question_id, choices_id } =
        req.body;

    if (!examinee_id || !exam_id || !time_limit || !question_id || !choices_id) {
        return res.status(400).json({
            status: 400,
            message: "All fields are required.",
        });
    }
    try {
        await prisma.$transaction(async (prisma) => {
            let existingSession = await prisma.sessionHeader.findFirst({
                where: {
                    examinee_id: examinee_id,
                    exam_id: exam_id,
                },
            });

            if (!existingSession) {
                existingSession = await prisma.sessionHeader.create({
                    data: {
                        timelimit: parseInt(time_limit),
                        examinee_id: examinee_id,
                        exam_id: exam_id,
                    },
                })
            }


            await prisma.sessionDetails.upsert({
                where: {
                    question_id_sessionHeader_id: {
                        question_id: question_id,
                        sessionHeader_id: existingSession.session_id,
                    },
                },
                update: {
                    choices_id: choices_id,
                },
                create: {
                    sessionHeader_id: existingSession.session_id,
                    question_id: question_id,
                    choices_id: choices_id,
                },
            });

        });

        return res.status(200).json({
            status: res.statusCode,
            message: "Successfully save answer",
        });
    } catch (err: unknown) {
        return handlePrismaError(err, res);
    }
};


export const updateSessionTime = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { examineeId, examId } = req.params;
    const { time_limit } = req.body;
    try {
        const sessionId = await prisma.sessionHeader.findFirst({
            where: {
                examinee_id: examineeId,
                exam_id: Number(examId),
            },
        });

        if (!sessionId) {
            return res.status(200).json({
                status: res.statusCode,
                message: "No session to update",
            });
        }

        await prisma.sessionHeader.update({
            where: {
                session_id: sessionId.session_id,
            },
            data: {
                timelimit: time_limit,
            },
        });

        return res.status(200).json({
            status: res.statusCode,
            message: "Successfully updated time",
        });
    } catch (err: any) {
        return handlePrismaError(err, res);
    }
}


export const deleteSessionAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { examineeId, examId } = req.params;
    try {
        const sessionId = await prisma.sessionHeader.findFirst({
            where: {
                examinee_id: examineeId,
                exam_id: Number(examId),
            },
        });

        if (!sessionId) {
            return res.status(200).json({
                status: res.statusCode,
                message: "No session to remove",
            });
        }


        await prisma.sessionHeader.delete({
            where: {
                session_id: sessionId.session_id,
            },
        });

        return res.status(200).json({
            status: res.statusCode,
            message: "Session remove successfully",
        });
    } catch (err: any) {
        return handlePrismaError(err, res);
    }
};


export const consolidateMyAnswer = async (req: Request, res: Response): Promise<Response> => {
    const { examineeId, examId } = req.params;

    try {
        const result = await prisma.question.findMany({
            select: {
                question: true,
                question_id: true,
                examList: {
                    select: {
                        exam_id: true,
                        exam_title: true
                    }
                },
                choicesList: {
                    select: {
                        choices_id: true,
                        description: true,
                        status: true,
                        answersList: {
                            select: {
                                choices_id: true,
                                examinee_id: true
                            },
                            where: {
                                examinee_id: examineeId
                            }
                        }
                    }
                },
            },
            where: {
                exam_id: Number(examId),
                choicesList: {
                    some: {
                        answersList: {
                            none: { // Use "none" to find unanswered questions
                                examinee_id: examineeId
                            }
                        },

                    }
                }
            },
            orderBy: {
                question: 'asc',
            }
        });

        const initialMap = result.reduce((group: GroupedExamMap, item: Question) => {
            item.choicesList.forEach((choice: any) => {
                choice.answersList.forEach((answer: any) => {
                    const id = answer.examinee_id;
                    if (!group[id]) {
                        group[id] = {
                            totalQuestions: 0,
                            correctAnswers: 0,
                        };
                    }
                    group[id].totalQuestions++;


                    const isCorrect = choice.choices_id === answer.choices_id;

                    if (isCorrect === choice.status) {
                        group[id].correctAnswers++;
                    }

                })
            })



            return group;
        }, {});

        const valueMap = Object.values(initialMap);

        const enrichedResult = {
            summaryScore: valueMap,
            data: result
        }

        return res.status(200).json(enrichedResult);

    } catch (err: unknown) {
        return handlePrismaError(err, res);
    }
}
