import { Request, Response, NextFunction } from 'express';
import * as deanService from '../services/deans.services';
import { deansValidation, handleValidationError } from '../util/validation';
import { handlePrismaError } from '../util/prismaErrorHandler';

export const getDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const data = await deanService.getDeans();
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const { error, value } = deansValidation.insert(body);
    if (error) {
      return handleValidationError(error, res);
    }

    const response = await deanService.insertDeans(value);
    return res.status(201).json({
      message: 'Dean created successfully',
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const updatedDeans = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  const body = req.body;
  try {
    const { error, value } = deansValidation.update(body);
    if (error) {
      return handleValidationError(error, res);
    }

    const response = await deanService.updateDeans(id, value);
    return res.status(200).json({
      message: 'Deans updated successfully',
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const deleteDeans = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await deanService.deleteDeans(id);
    return res.status(201).json({
      message: 'Dean deleted successfully',
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const assignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const response = await deanService.assignDeans(body);
    return res.status(201).json({
      message: 'Successfully assigned course',
      data: response,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const getAssignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = req.params.id;
  try {
    const data = await deanService.getAssignDeans(id);
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const deleteAssignDeans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const deansId = req.params.deansId;
  const courseId = req.params.courseId;
  try {
    const response = await deanService.deleteAssignDeans(deansId, courseId);
    return res.status(200).json({
      message: 'Deleted successfully',
      data: response,
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};