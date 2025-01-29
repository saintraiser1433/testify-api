import prisma from "../prisma/prisma";

export const getDeans = async () => {
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
  
  export const insertDeans = async (body: any) => {
    return await prisma.$transaction(async (tx) => {
      const response = await tx.deans.create({
        data: body,
      });
      return response;
    });
  };
  
  export const updateDeans = async (id: string, body: any) => {
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
  
  export const deleteDeans = async (id: string) => {
    await prisma.deans.delete({
      where: {
        deans_id: Number(id),
      },
    });
  };
  
  export const assignDeans = async (body: any) => {
    return await prisma.assignDeans.create({
      data: body,
    });
  };
  
  export const getAssignDeans = async (id: string) => {
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
  
  export const deleteAssignDeans = async (deansId: string, courseId: string) => {
    return await prisma.assignDeans.delete({
      where: {
        deans_id_course_id: {
          deans_id: Number(deansId),
          course_id: Number(courseId),
        },
      },
    });
  };