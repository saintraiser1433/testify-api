import { NextFunction, Request, Response } from "express";
import { examineeValidation, handleValidationError } from "../util/validation";
import { handlePrismaError } from "../util/prismaErrorHandler";
import {
  fetchExaminees,
  findExamineeByName,
  createExaminee,
  updateExamineeById,
  deleteExamineeById,
} from "../services/examinee.services";

export const getExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const data = await fetchExaminees();
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = examineeValidation.insert(body);

    if (error) return handleValidationError(error, res);

    const user = await findExamineeByName(value.first_name, value.last_name, value.middle_name);
    if (user) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const response = await createExaminee(value);
    return res.status(201).json({ message: "Student created successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const updateExaminee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = examineeValidation.update(body);

    if (error) return handleValidationError(error, res);

    const user = await findExamineeByName(value.first_name, value.last_name, value.middle_name);
    if (user) {
      return res.status(409).json({ message: "Student already exists" });
    }
    const response = await updateExamineeById(id, value);
    return res.status(200).json({ message: "Student updated successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const deleteExaminee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await deleteExamineeById(id);
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};
