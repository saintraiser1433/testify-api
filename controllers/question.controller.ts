import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { choicesValidation, handleValidationError, questionValidation } from "../util/validation";
import { ChoicesModel } from "../models";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = req.params.id;
  try {
    // const checkIfExist = await prisma.exam.findFirst({
    //   where: {
    //     exam_id: Number(id),
    //   },
    // });

    // if (!checkIfExist) {
    //   return res.status(404).json({
    //     error: "Exam not found",
    //   });
    // }

    const data = await prisma.question.findMany({
      select: {
        question_id: true,
        question: true,
        choicesList: {
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
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { question, exam_id, choicesList } = req.body;

  // Validate question
  const { error: questionError, value: validatedQuestion } = questionValidation.insert({
    question,
    exam_id,
  });

  if (questionError) {
    return handleValidationError(questionError, res);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Check if the exam exists
      const existingExam = await tx.exam.findFirst({
        where: {
          exam_id: Number(validatedQuestion.exam_id),
        },
      });

      if (!existingExam) {
        return res.status(404).json({
          message: `Exam with ID ${validatedQuestion.exam_id} not found`,
        });
      }

      // Create the question
      const createdQuestion = await tx.question.create({
        data: validatedQuestion,
      });

      // Prepare choices data
      const choicesData = choicesList.map((choice: ChoicesModel) => ({
        description: choice.description,
        question_id: createdQuestion.question_id,
        status: choice.status,
      }));

      // Validate choices
      const { error: choicesError, value: validatedChoices } = choicesValidation.insert(choicesData);

      if (choicesError) {
        return handleValidationError(choicesError, res);
      }

      // Create choices
      await tx.choices.createMany({
        data: validatedChoices,
      });

      return res.status(201).json({
        message: "Created successfully",
      });
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { question, question_id, choicesList } = req.body;

  // Validate question
  const { error: questionError, value: validatedQuestion } = questionValidation.update({
    question,
    question_id,
  });

  if (questionError) {
    return res.status(400).json({
      message: questionError.details[0].message,
    });
  }

  // Validate choices
  const { error: choicesError, value: validatedChoices } = choicesValidation.update(choicesList);

  if (choicesError) {
    return res.status(400).json({
      message: choicesError.details[0].message,
    });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Check if the question exists
      const existingQuestion = await tx.question.findFirst({
        where: {
          question_id: Number(validatedQuestion.question_id),
        },
      });

      if (!existingQuestion) {
        return res.status(404).json({
          message: "Question not found",
        });
      }

      // Get existing choices for the question
      const existingChoices = await tx.choices.findMany({
        where: {
          question_id: validatedQuestion.question_id,
        },
      });

      // Determine choices to delete
      const newChoiceIds = validatedChoices.map((choice: ChoicesModel) => choice.choices_id);
      const choicesToDelete = existingChoices
        .filter((choice) => !newChoiceIds.includes(choice.choices_id))
        .map((choice) => choice.choices_id);

      // Delete choices not in the updated list
      if (choicesToDelete.length > 0) {
        await tx.choices.deleteMany({
          where: {
            choices_id: {
              in: choicesToDelete,
            },
          },
        });
      }

      // Update or create choices
      await Promise.all(
        validatedChoices.map(async (choice: ChoicesModel) => {
          await tx.choices.upsert({
            where: {
              choices_id: choice.choices_id || -1,
            },
            update: {
              description: choice.description,
              status: choice.status,
            },
            create: {
              description: choice.description,
              status: choice.status,
              question_id: validatedQuestion.question_id,
            },
          });
        })
      );

      return res.status(200).json({
        message: "Updated successfully",
      });
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await prisma.question.delete({
      where: {
        question_id: Number(id),
      },
    });
    return res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};
