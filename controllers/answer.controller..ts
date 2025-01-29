import { Request, Response, NextFunction } from 'express';
import * as answerService from '../services/answer.services';
import { handlePrismaError } from '../util/prismaErrorHandler';

export const insertAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;
  try {
    const response = await answerService.insertAnswer(body);
    return res.status(201).json({
      status: res.statusCode,
      message: 'Submitted Successfully',
      data: response,
    });
  } catch (err: unknown) {
    return handlePrismaError(err, res);
  }
};

export const getSessionAnswer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { examineeId, examId } = req.params;
  try {
    const sessionDetails = await answerService.getSessionAnswer(examineeId, examId);
    return res.status(200).json(sessionDetails);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const upsertSessionAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { examinee_id, exam_id, time_limit, question_id, choices_id } = req.body;
  try {
    await answerService.upsertSessionAnswer(
      examinee_id,
      exam_id,
      time_limit,
      question_id,
      choices_id
    );
    return res.status(200).json({
      status: res.statusCode,
      message: 'Successfully saved answer',
    });
  } catch (err: unknown) {
    return handlePrismaError(err, res);
  }
};

export const updateSessionTime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { examineeId, examId } = req.params;
  const { time_limit } = req.body;
  try {
    await answerService.updateSessionTime(examineeId, examId, time_limit);
    return res.status(200).json({
      status: res.statusCode,
      message: 'Successfully updated time',
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const deleteSessionAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { examineeId, examId } = req.params;
  try {
    await answerService.deleteSessionAnswer(examineeId, examId);
    return res.status(200).json({
      status: res.statusCode,
      message: 'Session removed successfully',
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const consolidateMyAnswer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { examineeId, examId } = req.params;
  try {
    const result = await answerService.consolidateMyAnswer(examineeId, examId);
    return res.status(200).json(result);
  } catch (err: unknown) {
    return handlePrismaError(err, res);
  }
};