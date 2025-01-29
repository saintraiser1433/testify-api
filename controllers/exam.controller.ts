import { NextFunction, Request, Response } from "express";
import { examValidation, handleValidationError } from "../util/validation";
import { handlePrismaError } from "../util/prismaErrorHandler";
import {
  getExamService,
  getExamByIdService,
  insertExamService,
  updateExamService,
  deleteExamService,
  checkIfExamFinishedService,
  checkExamAvailableService,
} from "../services/exam.services";

export const getExam = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const response = await getExamService();
    return res.status(200).json(response);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const getExamId = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const id = req.params.id;
  try {
    const response = await getExamByIdService(id);
    return res.status(200).json(response);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insert = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = examValidation.update(body);
    if (error) {
      return handleValidationError(error, res);
    }

    const exam = await getExamByIdService(value.exam_title);
    if (exam) {
      return res.status(409).json({ message: "Exam Title already exists" });
    }

    const response = await insertExamService(value);
    return res.status(200).json({ message: "Exam created successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body;
  const id = req.params.id;
  try {
    const { error, value } = examValidation.update(body);
    if (error) {
      return handleValidationError(error, res);
    }

    const response = await updateExamService(id, value);
    return res.status(200).json({ message: "Exam updated successfully", data: response });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    await deleteExamService(id);
    return res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const checkIfExamFinished = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    const response = await checkIfExamFinishedService(id);
    return res.status(200).json(response);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const checkExamAvailable = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.examineeId;
  try {
    const response = await checkExamAvailableService(id);

    if (response === null) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    if (response === "finished") {
      return res.status(404).json({ message: "The exam is finished" });
    }

    return res.status(200).json(response);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};
