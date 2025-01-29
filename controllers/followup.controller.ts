import { NextFunction, Request, Response } from "express";
import { handlePrismaError } from "../util/prismaErrorHandler";
import * as followupService from "../services/followup.services";
export const insertFollowUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const body = req.body;

  try {
    const data = await followupService.insertFollowUp(body);

    return res.status(201).json({
      status: res.statusCode,
      message: "Success created successfully",
      data: data,
    });
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const getFollowup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const examineeId = req.params.examineeId;

  try {
    const checkFollowupData = await followupService.getFollowup(examineeId);
    return res.status(200).send(checkFollowupData);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};
