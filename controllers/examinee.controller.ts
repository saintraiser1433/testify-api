import { NextFunction, Request, Response } from "express";
import { examineeValidation, handleValidationError } from "../util/validation";
import {
  fetchExaminees,
  findExamineeByName,
  createExaminee,
  updateExamineeById,
  deleteExamineeById,
  getExamineeById,
} from "../services/examinee.services";

export const getExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = await fetchExaminees();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const insertExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  try {
    const { error, value } = examineeValidation.insert(body);

    if (error) {
      next(error)
    }

    const user = await findExamineeByName(value.first_name, value.last_name, value.middle_name);
    if (user) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const response = await createExaminee(value);
    return res.status(201).json({ message: "Student created successfully", data: response });
  } catch (err) {
    next(err);
  }
};

export const updateExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = examineeValidation.update(body);

    if (error) {
      next(error)
    }

    const existingExaminee = await getExamineeById(req.params.id);
    if (!existingExaminee) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    if (
      value.first_name !== existingExaminee.first_name &&
      value.last_name !== existingExaminee.last_name &&
      value.middle_name !== existingExaminee.middle_name
    ) {
      const user = await findExamineeByName(value.first_name, value.last_name, value.middle_name);
      if (user) {
        return res.status(409).json({ message: "Examinee already exists" });
      }
    }

    const response = await updateExamineeById(id, value);
    return res.status(200).json({ message: "Examinee updated successfully", data: response });
  } catch (err) {
    next(err);
  }
};

export const deleteExaminee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    await deleteExamineeById(id);
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
};
