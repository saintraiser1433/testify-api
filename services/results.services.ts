import prisma from "../prisma/prisma";

export const listOfQuestions = async (id: string) => {
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

export const userInformation = async (id: string) => {
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

export const countAttempt = async (id: string) => {
    const countAttempt = await prisma.examAttempt.aggregate({
        _count: true,
        where: {
            examinee_id: id
        }
    })

    return countAttempt;
}

export const countOfExam = async (id: string) => {
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