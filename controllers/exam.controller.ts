import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { examValidation, handleValidationError } from "../util/validation";
import { ExamHeader } from "../models";
import { appLogger } from "../util/logger";
import { Prisma } from "@prisma/client";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const data = await prisma.exam.findMany({
      select: {
        exam_id: true,
        description: true,
        exam_title: true,
        status: true,
        time_limit: true,
      },
      orderBy: {
        exam_id: "asc",
      },
    });
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);


  }
};

export const getExamId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = req.params.id;
  try {
    const response = await prisma.exam.findFirstOrThrow({
      where: {
        exam_id: Number(id),
      },
    });
    return res.status(200).json(response);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = examValidation.update(body);

    if (error) {
      return handleValidationError(error, res);
    }
    const exam = await prisma.exam.findFirst({
      where: {
        exam_title: {
          equals: value.exam_title,
          mode: "insensitive",
        },
      },
    });
    if (exam) {
      return res.status(409).json({
        message: "Exam Title already exist",
      });
    }

    const response = await prisma.exam.create({
      data: value,
    });
    return res.status(200).json({
      message: "Exam created successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);

  }
};

export const updateExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = examValidation.update(body);

    if (error) {
      return handleValidationError(error, res);
    }

    const response = await prisma.exam.update({
      where: {
        exam_id: Number(id),
      },
      data: value,
    });
    return res.status(200).json({
      message: "Exam updated successfully",
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const deleteExam = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    await prisma.exam.delete({
      where: {
        exam_id: Number(id),
      },
    });
    return res.status(200).json({
      message: "Exam deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const checkIfExamFinished = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    const data = await prisma.examAttempt.findMany({
      select: {
        exam_id: true,
      },
      where: {
        examinee_id: id,
      },
    });
    const examId = data.map((item) => item.exam_id);

    const exam = await prisma.exam.findMany({
      select: {
        exam_id: true,
      },
      where: {
        exam_id: {
          notIn: examId,
        },
      },
    });

    const shuffledExam = exam.sort(() => Math.random() - 0.5);

    return res.status(200).json(shuffledExam);
  } catch (err) {
    return handlePrismaError(err, res);
  }

};

export const checkExamAvailable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.examineeId;

  try {
    const checkExaminee = await prisma.user.findFirst({
      where: {
        id: id
      }
    })

    if (!checkExaminee) {
      return res.status(404).json({
        message: "Examinee not found"
      })
    }


    const attemptData = await prisma.examAttempt.findMany({
      select: {
        exam_id: true,
      },
      where: {
        examinee_id: id,
      },
    });

    const attemptedExamIds = attemptData.map((item) => item.exam_id);

    const exam = await prisma.exam.findMany({
      select: {
        exam_id: true,
      },
      where: {
        exam_id: {
          notIn: attemptedExamIds,
        },
      },
    });

    const shuffledExam = exam.sort(() => Math.random() - 0.5);

    if (!shuffledExam || shuffledExam.length === 0) {
      return res.status(404).json({
        status: res.statusCode,
        message: 'The exam is finished',
      })
    }

    const data = await prisma.question.findMany({
      select: {
        question: true,
        question_id: true,
        // exam_id: true,
        examList: {
          select: {
            exam_id: true,
            time_limit: true,
            exam_title: true,
          },
        },
        choicesList: {
          select: {
            choices_id: true,
            description: true,
          },
        },
      },
      where: {
        exam_id: Number(shuffledExam[0].exam_id),
      },
    });

    const formatExamDetails = (data: any): ExamHeader => {
      return {
        exam_id: data[0].examList.exam_id,
        time_limit: data[0].examList.time_limit,
        exam_title: data[0].examList.exam_title,
        data: data.map((item: any) => ({
          question_id: item.question_id,
          question: item.question,
          choices: item.choicesList.map((choice: any) => ({
            value: choice.choices_id,
            label: choice.description,
          })),
        })),
      };
    };
    const examDetails = formatExamDetails(data);

    return res.status(200).json(examDetails);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};
