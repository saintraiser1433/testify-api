import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import { GroupedExamMap, Question } from "../models";
import { handlePrismaError } from "../util/prismaErrorHandler";


const listOfQuestions = async (id: string) => {
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
            },
            where: {
              examinee_id: id
            }
          }
        }
      },

    },
    where: {
      choicesList: {
        some: {
          answersList: {
            none: {
              examinee_id: id
            }
          }
        }
      }
    },

    orderBy: {
      exam_id: 'asc',
    }
  })

  return result;
}

const userInformation = async (id: string) => {
  const header = await prisma.user.findFirst({
    select: {
      id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      followupData: {
        select: {
          gender: true,
          birth_date: true,
          contact_number: true,
          school: true,
          email: true,
          address: true
        }
      }
    },
    where: {
      id: id
    },

  })
  return header;
}

const countAttempt = async (id: string) => {
  const countAttempt = await prisma.examAttempt.aggregate({
    _count: true,
    where: {
      examinee_id: id
    }
  })

  return countAttempt;
}

const countOfExam = async (id: string) => {
  const numberOfExams = await prisma.exam.aggregate({
    _count: true,
    where: {
      questionList: {
        some: {
          choicesList: {
            some: {}
          }
        }

      }
    }
  })

  return numberOfExams;
}

export const getSummaryByExaminee = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.examineeId;

  if (!id) {
    return res.status(400).json({ message: "Examinee ID is required" });
  }

  try {
    const [questions, userInfo, attemptCount, examCount] = await Promise.all([
      listOfQuestions(id),
      userInformation(id),
      countAttempt(id),
      countOfExam(id),
    ]);

    const detail = questions.reduce((group: GroupedExamMap, item: Question) => {
      const examId = item.examList.exam_id;
      if (!group[examId]) {
        group[examId] = {
          exam_id: examId,
          exam_title: item.examList.exam_title,
          totalQuestions: 0,
          correctAnswers: 0,
        };
      }

      group[examId].totalQuestions++;

      item.choicesList.forEach((choice) => {
        const isCorrect = choice.answersList.some(
          (answer) => answer.choices_id === choice.choices_id
        );

        if (isCorrect && choice.status) {
          group[examId].correctAnswers++;
        }
      });

      return group;
    }, {} as GroupedExamMap);

    const summaryArray = Object.values(detail);

    const combineData = {
      examinee_id: userInfo?.id || '',
      first_name: userInfo?.first_name || '',
      last_name: userInfo?.last_name || '',
      middle_name: userInfo?.middle_name || '',
      birth_date: userInfo?.followupData[0]?.birth_date || '',
      gender: userInfo?.followupData[0]?.gender || '',
      school: userInfo?.followupData[0]?.school || '',
      email: userInfo?.followupData[0]?.email || '',
      address: userInfo?.followupData[0]?.address || '',
      contact_number: userInfo?.followupData[0]?.contact_number || '',
      examineeAttempt: attemptCount._count,
      totalExams: examCount._count,
      examDetails: summaryArray,
    };

    return res.status(200).json(combineData);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};


export const getAllResult = async (req: Request, res: Response): Promise<Response> => {
  try {
    const [result, countQuestions] = await Promise.all([
      prisma.question.findMany({
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
                  examinee_id: true,
                  choices_id: true,
                  examineeList: {
                    select: {
                      first_name: true,
                      last_name: true,
                      middle_name: true,
                      followupData: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          exam_id: 'asc',
        },
      }),
      prisma.question.aggregate({
        _count: true,
      }),
    ]);

    const map = result.reduce((group: any, item: any) => {
      item.choicesList.forEach((choice: any) => {
        choice.answersList.forEach((answer: any) => {
          const examinee_id = answer.examinee_id;

          if (!group[examinee_id]) {
            group[examinee_id] = {
              examinee_id: examinee_id,
              first_name: answer.examineeList.first_name,
              last_name: answer.examineeList.last_name,
              middle_name: answer.examineeList.middle_name,
              birth_date: answer.examineeList.followupData[0]?.birth_date || '',
              school: answer.examineeList.followupData[0]?.school || '',
              email: answer.examineeList.followupData[0]?.email || '',
              address: answer.examineeList.followupData[0]?.address || '',
              contact_number: answer.examineeList.followupData[0]?.contact_number || '',
              gender: answer.examineeList.followupData[0]?.gender || '',
              totalCorrect: 0,
              totalQuestions: countQuestions._count,
            };
          }

          const isCorrect = choice.choices_id === answer.choices_id && choice.status;

          if (isCorrect) {
            group[examinee_id].totalCorrect++;
          }
        });
      });

      return group;
    }, {});

    const final = Object.values(map);

    return res.status(200).json(final);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};


