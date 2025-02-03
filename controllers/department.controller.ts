import { NextFunction, Request, Response } from "express";
import { getDepartments, checkDepartmentIfExist, getDepartmentById, updateDepartmentFunc, deleteDepartmentFunc, insertDepartmentFunc } from "../services/department.services";
import {
  departmentValidation,
  handleValidationError,
} from "../util/validation";


export const getDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = await getDepartments();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const insertDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { error, value } = departmentValidation.validate(req.body);
    if (error) {
      next(error)
    }

    const checkDepartment = await checkDepartmentIfExist(
      value.department_name
    );
    if (checkDepartment) {
      return res.status(409).json({ message: "Department already exists" });
    }
    const response = await insertDepartmentFunc(value);
    return res
      .status(201)
      .json({ message: "Department created successfully", data: response });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { error, value } = departmentValidation.validate(req.body);
    if (error) {
      next(error)
    }

    const existingDepartment = await getDepartmentById(Number(req.params.id));
    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (value.department_name !== existingDepartment.department_name) {
      const checkDepartment = await checkDepartmentIfExist(value.department_name);
      if (checkDepartment) {
        return res.status(409).json({ message: "Department already exists" });
      }
    }

    const response = await updateDepartmentFunc(
      Number(req.params.id),
      value
    );
    return res
      .status(200)
      .json({ message: "Department updated successfully", data: response });
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    await deleteDepartmentFunc(Number(req.params.id));
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    next(err)
  }
};
