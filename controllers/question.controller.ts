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
  const { error: questionError } = questionValidation.insert({
    question,
    exam_id,
  });

  if (questionError) {
    return handleValidationError(questionError, res);
  }

  // Validate choices
  const choicesData = choicesList.map((choice: ChoicesModel) => ({
    description: choice.description,
    status: choice.status,
  }));
  const { error: choicesError } = choicesValidation.insert(choicesData);

  if (choicesError) {
    return handleValidationError(choicesError, res);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const results = await tx.question.create({
        data: {
          question: question,
          exam_id: exam_id,
          choicesList: {
            create: choicesData,
          },
        },
        include: {
          choicesList: true
        }
      })

      const resultMap = {
        question_id: results.question_id,
        question: results.question,
        choicesList: results.choicesList.map((item) => ({
          choices_id: item.choices_id,
          description: item.description,
          status: item.status
        }))
      }


      return res.status(201).json({
        message: "Created successfully",
        data: resultMap
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
  const { error: questionError } = questionValidation.update({
    question,
    question_id,
  });

  if (questionError) {
    return handleValidationError(questionError, res);
  }

  // Validate choices
  const { error: choicesError } = choicesValidation.update(choicesList);

  if (choicesError) {
    return handleValidationError(choicesError, res);
  }

  try {
    return await prisma.$transaction(async (tx) => {

      const existingChoices = await tx.choices.findMany({
        where: {
          question_id: question_id,
        },
      });
      //end
      const newChoiceId = choicesList.map(
        (choice: ChoicesModel) => choice.choices_id
      );
      


      const choicesToDelete = existingChoices
        .filter(
          (existingChoice) => !newChoiceId.includes(existingChoice.choices_id)
        )
        .map((item) => item.choices_id);

      await tx.question.update({
        data: {
          question: question,
          choicesList: {
            deleteMany: {
              choices_id: {
                in: choicesToDelete
              }
            }
          }
        },
        where: {
          question_id: question_id
        }
      })


      const createManyChoices =
        choicesList.map((choice: ChoicesModel) => ({
          description: choice.description,
          status: choice.status,
          choices_id: choice.choices_id,
        }));




      for (const choice of createManyChoices) {
        await prisma.choices.upsert({
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
            question_id: question_id,
          },
        });
      }
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
