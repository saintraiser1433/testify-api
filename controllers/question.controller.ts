import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { choicesValidation, questionValidation } from '../util/validation';
import { ChoicesModel } from '../models';


export const getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const id = req.params.id;
    try {
        const checkIfExist = await prisma.exam.findFirst({
            where: {
                exam_id: Number(id),
            },
        });

        if (!checkIfExist) {
            return res.status(404).json({
                error: "Exam not found",
            })
        }

        const data = await prisma.question.findMany({
            select: {
                question_id: true,
                question: true,
                Choices: {
                    select: {
                        choices_id: true,
                        description: true,
                        status: true,
                    },
                },
            },
            where: {
                exam_id: Number(id),
            },
            orderBy: {
                question_id: "asc",
            },
        });
        return res.status(200).json(data);
    } catch (err:any) {
        return res.status(500).json({
            message: err.message
        })
    }
};


export const insertQuestion = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { question, exam_id, Choices } = body;

        const questBody = {
            question: question,
            exam_id: exam_id,
        };

        const { error: err, value } = questionValidation.insert(questBody);
        if (err) {
            return res.status(400).json({
                message: err.details[0].message,
            })
        }

        const checkExamIsExist = await tx.exam.findFirst({
            where: {
                exam_id: Number(value.exam_id),
            },
        });

        if (!checkExamIsExist) {
            return res.status(404).json({
                message: "Exam not found",
            })
        }

        const response = await tx.question.create({
            data: value,
        });

        const choiceBody = Choices.map((choice: ChoicesModel) => ({
            description: choice.description,
            question_id: response.question_id,
            status: choice.status,
        }));

        const { error: errorChoice, value: choicesValue } =
            choicesValidation.insert(choiceBody);

        if (errorChoice) {
            return res.status(400).json({
                error: errorChoice.details[0].message,
            })
        }

        await tx.choices.createMany({
            data: choicesValue,
        });
        return res.status(201).json({
            message: "Created successfully",
        })
    });
}

export const updateQuestion = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body;
    return prisma.$transaction(async (tx) => {
        const { question, question_id, Choices } = body;
        const questBody = {
            question: question,
            question_id: question_id,
        };
        // validate question
        const { error: err, value } = questionValidation.update(questBody);
        if (err) {
            return res.status(400).json({
                message: err.details[0].message,
            })

        }

        //end
        //validate if question is existing
        const checkQuestionIsExist = await tx.question.findFirst({
            where: {
                question_id: Number(value.question_id),
            },
        });

        if (!checkQuestionIsExist) {
            return res.status(404).json({
                message: "Question not found",
            })

        }
        //end

        //choices validate
        const { error: errorChoice, value: choicesValue } =
            choicesValidation.update(Choices);

        // Check for validation errors
        if (errorChoice) {
            return res.status(400).json({
                message: errorChoice.details[0].message,
            })
        }

        const existingChoices = await tx.choices.findMany({
            where: {
                question_id: value.question_id,
            },
        });

        //end
        const newChoiceId = Choices.map(
            (choice: ChoicesModel) => choice.choices_id
        );

        const choicesToDelete = existingChoices
            .filter(
                (existingChoice) => !newChoiceId.includes(existingChoice.choices_id)
            )
            .map((item) => item.choices_id);

        //deleted
        await tx.choices.deleteMany({
            where: {
                choices_id: {
                    in: choicesToDelete,
                },
            },
        });

        const createManyChoices = choicesValue.map((choice: ChoicesModel) => ({
            description: choice.description,
            status: choice.status,
            choices_id: choice.choices_id,
        }));

        for (const ch of createManyChoices) {
            await prisma.choices.upsert({
                where: {
                    choices_id: ch.choices_id || -1,
                },
                update: {
                    description: ch.description,
                    status: ch.status,
                },
                create: {
                    description: ch.description,
                    status: ch.status,
                    question_id: question_id,
                },
            });
        }

        return res.status(200).json({
            message: "Updated successfully",
        })

    });
}

export const deleteQuestion = (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    return prisma.$transaction(async (tx) => {
        const question = await tx.question.findFirst({
            where: {
                question_id: Number(id),
            },
        });

        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            })
        }

        await prisma.question.delete({
            where: {
                question_id: Number(id),
            },
        });
        return res.status(200).json({
            message: "Question deleted successfully",
        })

    });
}

