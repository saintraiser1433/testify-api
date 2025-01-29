// services/questionService.ts

import { ChoicesModel } from "../models";
import prisma from "../prisma/prisma";


export const getQuestionsByExamId = async (examId: number) => {
  return await prisma.question.findMany({
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
      exam_id: examId,
    },
    orderBy: {
      question_id: "asc",
    },
  });
};

export const createQuestion = async (
  question: string,
  exam_id: number,
  choicesList: ChoicesModel[]
) => {
  return await prisma.$transaction(async (tx) => {
    const results = await tx.question.create({
      data: {
        question: question,
        exam_id: exam_id,
        choicesList: {
          create: choicesList.map((choice) => ({
            description: choice.description,
            status: choice.status,
          })),
        },
      },
      include: {
        choicesList: true,
      },
    });

    return {
      question_id: results.question_id,
      question: results.question,
      choicesList: results.choicesList.map((item) => ({
        choices_id: item.choices_id,
        description: item.description,
        status: item.status,
      })),
    };
  });
};

export const updateQuestion = async (
  question: string,
  question_id: number,
  choicesList: ChoicesModel[]
) => {
  return await prisma.$transaction(async (tx) => {
    const existingChoices = await tx.choices.findMany({
      where: {
        question_id: question_id,
      },
    });

    const newChoiceIds = choicesList.map((choice) => choice.choices_id);
    const choicesToDelete = existingChoices
      .filter((existingChoice) => !newChoiceIds.includes(existingChoice.choices_id))
      .map((item) => item.choices_id);

    await tx.question.update({
      data: {
        question: question,
        choicesList: {
          deleteMany: {
            choices_id: {
              in: choicesToDelete,
            },
          },
        },
      },
      where: {
        question_id: question_id,
      },
    });

    for (const choice of choicesList) {
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
          question_id: question_id,
        },
      });
    }
  });
};

export const deleteQuestion = async (questionId: number) => {
  return await prisma.question.delete({
    where: {
      question_id: questionId,
    },
  });
};