import prisma from "../prisma/prisma";

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
    try {
        const data = await prisma.exam.findFirstOrThrow({
            where: {
                exam_id: Number(id),
            },
        });
        return data;
    } catch (err) {
        throw err;
    }
}




