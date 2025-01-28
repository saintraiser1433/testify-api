import { GroupedExamMap, Question, QuestionModel, UserInformation } from "../models";
import prisma from "../prisma/prisma";

export const listOfQuestions = async (id: string) => {
    try {
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
    } catch (err) {
        throw err
    }

}

export const userInformation = async (id: string) => {
    try {
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
    } catch (err) {
        throw err;
    }

}

export const countAttempt = async (id: string) => {
    try {
        const countAttempt = await prisma.examAttempt.aggregate({
            _count: true,
            where: {
                examinee_id: id
            }
        })

        return countAttempt;
    } catch (err) {
        throw err;
    }

}

export const countOfExam = async (id: string) => {
    try {
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
    } catch (err) {
        throw err
    }

}


export const groupSummaryByExam = async (data: Question[]) => {
    const detail = data.reduce((group: GroupedExamMap, item: Question) => {
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


    return Object.values(detail)
}










export const allResult = async (): Promise<UserInformation[]> => {
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

        return Object.values(map);
    } catch (err) {
        throw err; // Throw the error to be handled by the caller
    }
};