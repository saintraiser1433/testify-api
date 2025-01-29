import prisma from "../prisma/prisma";

export const fetchExaminees = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      first_name: true,
      last_name: true,
      middle_name: true,
      username: true,
    },
    where: {
      role: "examinee",
    },
  });
};

export const findExamineeByName = async (first_name: string, last_name: string, middle_name: string) => {
  return await prisma.user.findFirst({
    where: {
      AND: [
        { first_name },
        { last_name },
        { middle_name },
        { role: "examinee" },
      ],
    },
  });
};

export const createExaminee = async (data: any) => {
  return await prisma.user.create({ data });
};

export const updateExamineeById = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteExamineeById = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};
