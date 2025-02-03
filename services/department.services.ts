import { DepartmentModel } from "../models";
import prisma from "../prisma/prisma";

export const getDepartments = async (): Promise<DepartmentModel[]> => {
  return await prisma.department.findMany({
    select: {
      department_id: true,
      department_name: true,
      status: true,
    },
    orderBy: {
      department_id: "asc",
    },
  });
};

export const checkDepartmentIfExist = async (departmentName: string) => {
  return await prisma.department.findFirst({
    where: {
      department_name: {
        startsWith: departmentName,
        mode: "insensitive",
      },
    },
  });
};

export const getDepartmentById = async (id: number) => {
  return await prisma.department.findUnique({
    where: { department_id: id },
  });
};

export const insertDepartmentFunc = async (data: DepartmentModel) => {
  return await prisma.department.create({ data });
};

export const updateDepartmentFunc = async (id: number, data: DepartmentModel) => {
  return await prisma.department.update({
    where: { department_id: id },
    data,
  });
};

export const deleteDepartmentFunc = async (id: number) => {
  return await prisma.department.delete({
    where: { department_id: id },
  });
};
