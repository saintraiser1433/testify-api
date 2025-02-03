
import { answerModel, GroupedExamMap, Question } from "../models";
import prisma from "../prisma/prisma";

export const insertAnswerFunc = async (body: any) => {
  return await prisma.$transaction(async (tx) => {
    // Insert exam attempt
    await tx.examAttempt.create({
      data: {
        examinee_id: body.examinee_id,
        exam_id: body.exam_id,
      },
    });

    // Insert answers
    const response = await tx.answers.createMany({
      data: body.details.map((detail: answerModel) => ({
        examinee_id: body.examinee_id,
        exam_id: body.exam_id,
        question_id: detail.question_id,
        choices_id: detail.choices_id,
      })),
    });

    return response;
  });
};

export const getSessionAnswerFunc = async (examineeId: string, examId: string) => {
  return await prisma.sessionHeader.findMany({
    select: {
      session_id: true,
      timelimit: true,
      examinee_id: true,
      exam_id: true,
      sessionDetails: {
        select: {
          question_id: true,
          choices_id: true,
        },
      },
    },
    where: {
      examinee_id: examineeId,
      exam_id: Number(examId),
    },
  });
};

export const upsertSessionAnswerFunc = async (
  examinee_id: string,
  exam_id: string,
  time_limit: string,
  question_id: string,
  choices_id: string
) => {
  return await prisma.$transaction(async (tx) => {
    let existingSession = await tx.sessionHeader.findFirst({
      where: {
        examinee_id: examinee_id,
        exam_id: Number(exam_id),
      },
    });

    if (!existingSession) {
      existingSession = await tx.sessionHeader.create({
        data: {
          timelimit: parseInt(time_limit),
          examinee_id: examinee_id,
          exam_id: Number(exam_id),
        },
      });
    }

    await tx.sessionDetails.upsert({
      where: {
        question_id_sessionHeader_id: {
          question_id: Number(question_id),
          sessionHeader_id: existingSession.session_id,
        },
      },
      update: {
        choices_id: Number(choices_id),
      },
      create: {
        sessionHeader_id: existingSession.session_id,
        question_id: Number(question_id),
        choices_id: Number(choices_id),
      },
    });
  });
};

export const updateSessionTimeFunc = async (
  examineeId: string,
  examId: string,
  time_limit: string
) => {
  const sessionId = await prisma.sessionHeader.findFirst({
    where: {
      examinee_id: examineeId,
      exam_id: Number(examId),
    },
  });

  if (sessionId) {
    await prisma.sessionHeader.update({
      where: {
        session_id: sessionId.session_id,
      },
      data: {
        timelimit: Number(time_limit),
      },
    });
  }


};

export const deleteSessionAnswerFunc = async (examineeId: string, examId: string) => {
  const sessionId = await prisma.sessionHeader.findFirst({
    where: {
      examinee_id: examineeId,
      exam_id: Number(examId),
    },
  });

  if (!sessionId) {
    throw new Error('No session to remove');
  }

  await prisma.sessionHeader.delete({
    where: {
      session_id: sessionId.session_id,
    },
  });
};

export const consolidateMyAnswerFunc = async (examineeId: string, examId: string) => {
  const result = await prisma.question.findMany({
    select: {
      question: true,
      question_id: true,
      examList: {
        select: {
          exam_id: true,
          exam_title: true,
        },
      },
      choicesList: {
        select: {
          choices_id: true,
          description: true,
          status: true,
          answersList: {
            select: {
              choices_id: true,
              examinee_id: true,
            },
            where: {
              examinee_id: examineeId,
            },
          },
        },
      },
    },
    where: {
      exam_id: Number(examId),
      choicesList: {
        some: {
          answersList: {
            none: {
              examinee_id: examineeId,
            },
          },
        },
      },
    },
    orderBy: {
      question: 'asc',
    },
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
      });
    });
    return group;
  }, {});

  const valueMap = Object.values(initialMap);

  return {
    summaryScore: valueMap,
    data: result,
  };
};