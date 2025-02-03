import prisma from "../prisma/prisma";
export const getCourse = async () => {
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
};

export const courseNoAssociated = async () => {
  const response = await prisma.course.findMany({
    where: {
      assignDeansList: {
        none: {},
      },
    },
  });
  return response;
};

export const insertCourse = async (body: any) => {
  const response = await prisma.course.create({
    data: body,
  });

  return response;
};

export const updateCourse = async (body: any, id: string) => {
  const response = await prisma.course.update({
    where: {
      course_id: Number(id),
    },
    data: body,
  });

  return response;
};

export const checkCourseIfExist = async (courseName: string) => {
  return await prisma.course.findFirst({
    where: {
      description: {
        startsWith: courseName,
        mode: "insensitive",
      },
    },
  });
};

export const getCourseById = async (id: number) => {
  return await prisma.course.findUnique({
    where: {
      course_id: id
    }
  })
}

export const deleteCourse = async (id: string) => {
  const response = await prisma.course.delete({
    where: {
      course_id: Number(id),
    },
  });

  return response;
};
