import { NextFunction, Request, Response } from "express";
import * as departmentService from "../services/department.services";
import { departmentValidation, handleValidationError } from "../util/validation";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getDepartment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const data = await departmentService.getDepartments();
    return res.status(200).json(data);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const insertDepartment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const { error, value } = departmentValidation.validate(req.body);
    if (error) return handleValidationError(error, res);

    const response = await departmentService.createDepartment(value);
    return res.status(201).json({ message: "Department created successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error, value } = departmentValidation.validate(req.body);
    if (error) return handleValidationError(error, res);

    const response = await departmentService.updateDepartment(Number(req.params.id), value);
    return res.status(200).json({ message: "Department updated successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<Response> => {
  try {
    await departmentService.deleteDepartment(Number(req.params.id));
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};
