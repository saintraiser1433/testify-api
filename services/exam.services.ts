import { ExamHeader } from "../models";
import prisma from "../prisma/prisma";
import { examValidation } from "../util/validation";

export const getExamService = async () => {
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
    return data;
  } catch (err) {
    throw err;
  }
}


export const getExamByIdService = async (id: string) => {
  const data = await prisma.exam.findUniqueOrThrow({
    where: {
      exam_id: Number(id),
    },
  });
  return data;
}


export const checkExamIfExist = async (examTitle: string) => {
  return await prisma.exam.findFirst({
    where: {
      exam_title: {
        startsWith: examTitle,
        mode: "insensitive",
      },
    },
  });
};




export const insertExamService = async (data: any) => {
  return await prisma.exam.create({
    data,
  });
};

export const updateExamService = async (id: string, data: any) => {
  return await prisma.exam.update({
    where: {
      exam_id: Number(id),
    },
    data,
  });
};

export const deleteExamService = async (id: string) => {
  return await prisma.exam.delete({
    where: {
      exam_id: Number(id),
    },
  });
};

export const checkIfExamFinishedService = async (examineeId: string) => {
  const data = await prisma.examAttempt.findMany({
    select: {
      exam_id: true,
    },
    where: {
      examinee_id: examineeId,
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

  return exam.sort(() => Math.random() - 0.5);
};

export const checkExamAvailableService = async (examineeId: string) => {
  const checkExaminee = await prisma.user.findFirst({
    where: {
      id: examineeId,
    },
  });

  if (!checkExaminee) {
    return null;
  }

  const attemptData = await prisma.examAttempt.findMany({
    select: {
      exam_id: true,
    },
    where: {
      examinee_id: examineeId,
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

  if (!exam || exam.length === 0) {
    return "finished";
  }

  const data = await prisma.question.findMany({
    select: {
      question: true,
      question_id: true,
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
      exam_id: Number(exam[0].exam_id),
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
        choices: item.choicesList
          .map((choice: any) => ({
            value: choice.choices_id,
            label: choice.description,
          }))
          .sort(() => Math.random() - 0.5),
      })).sort(() => Math.random() - 0.5),
    };
  };

  return formatExamDetails(data);
};