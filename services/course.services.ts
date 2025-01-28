import prisma from "../prisma/prisma";
export const getCourse = async () => {
    try {
        const data = await prisma.course.findMany({
            select: {
                course_id: true,
                description: true,
                score: true,
            },
            orderBy: {
                course_id: "asc",
            },
        });
        return data;
    } catch (err: any) {
        throw err;
    }
}

export const courseNoAssociated = async () => {
    try {
        const response = await prisma.course.findMany({
            where: {
                assignDeansList: {
                    none: {},
                },
            },
        });
        return response;
    } catch (err) {
        throw err;
    }

}

export const insertCourse = async (body: any) => {
    try {
        const response = await prisma.course.create({
            data: body,
        });

        return response;
    } catch (err) {
        throw err;
    }

}

export const updateCourse = async (body: any, id: string) => {
    try {
        const response = await prisma.course.update({
            where: {
                course_id: Number(id),
            },
            data: body,
        });

        return response;
    } catch (err) {
        throw err;
    }

}

export const deleteCourse = async (id: string) => {
    try {
        const response =   await prisma.course.delete({
            where: {
              course_id: Number(id),
            },
          });

        return response;
    } catch (err) {
        throw err;
    }
}