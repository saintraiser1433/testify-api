import prisma from "../prisma/prisma";

export const getDeansFunc = async () => {
  return await prisma.deans.findMany({
    select: {
      deans_id: true,
      first_name: true,
      last_name: true,
      middle_name: true,
      username: true,
      status: true,
      department_id: true,
      department: {
        select: {
          department_id: true,
          department_name: true,
        },
      },
    },
    orderBy: [
      {
        deans_id: 'asc',
      },
      {
        status: 'desc',
      },
    ],
  });
};

export const insertDeansFunc = async (body: any) => {
  return await prisma.$transaction(async (tx) => {
    const response = await tx.deans.create({
      data: body,
    });
    return response;
  });
};

export const updateDeansFunc = async (id: string, body: any) => {
  return await prisma.$transaction(async (tx) => {
    const response = await tx.deans.update({
      where: {
        deans_id: Number(id),
      },
      data: body,
    });
    return response;
  });
};

export const deleteDeansFunc = async (id: string) => {
  await prisma.deans.delete({
    where: {
      deans_id: Number(id),
    },
  });
};

export const assignDeansFunc = async (body: any) => {
  return await prisma.assignDeans.create({
    data: body,
  });
};

export const getAssignDeansFunc = async (id: string) => {
  return await prisma.assignDeans.findMany({
    select: {
      deans_id: true,
      course_id: true,
      course: {
        select: {
          course_id: true,
          description: true,
        },
      },
    },
    where: {
      deans_id: Number(id),
    },
  });
};

export const deleteAssignDeansFunc = async (deansId: string, courseId: string) => {
  return await prisma.assignDeans.delete({
    where: {
      deans_id_course_id: {
        deans_id: Number(deansId),
        course_id: Number(courseId),
      },
    },
  });
};

export const checkIfDeansExist = async (
  first_name: string,
  last_name: string,
  middle_name: string
) => {
  return await prisma.deans.findFirst({
    where: {
      AND: [
        {
          first_name: {
            startsWith: first_name,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            startsWith: last_name,
            mode: "insensitive",
          },
        },
        {
          middle_name,
        },
      ],
    },
  });
};

export const findDeansByName = async (
  first_name: string,
  last_name: string,
  middle_name: string
) => {
  return await prisma.deans.findFirst({
    where: {
      AND: [
        {
          first_name: {
            startsWith: first_name,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            startsWith: last_name,
            mode: "insensitive",
          },
        },
        {
          middle_name: {
            startsWith: middle_name,
            mode: "insensitive",
          },
        },
      ],
    },
  });
};


export const getDeansById = async (id: number) => {
  return await prisma.deans.findUnique({
    where: { department_id: id }
  })
}