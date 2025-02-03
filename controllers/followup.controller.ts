import { NextFunction, Request, Response } from "express";
import { getFollowupFunc, insertFollowUpFunc } from "../services/followup.services";
export const insertFollowUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body;

  try {
    const data = await insertFollowUpFunc(body);

    return res.status(201).json({
      status: res.statusCode,
      message: "Success created successfully",
      data: data,
    });
  } catch (err) {
    next(err)
  }
};

export const getFollowup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const examineeId = req.params.examineeId;

  try {
    const checkFollowupData = await getFollowupFunc(examineeId);
    return res.status(200).send(checkFollowupData);
  } catch (err: any) {
    next(err)
  }
};
