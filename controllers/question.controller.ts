// controllers/questionController.ts
import { NextFunction, Request, Response } from "express";
import * as questionService from "../services/question.services";
import { choicesValidation, handleValidationError, questionValidation } from "../util/validation";
import { ChoicesModel } from "../models";
import { handlePrismaError } from "../util/prismaErrorHandler";

export const getQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = req.params.id;
  try {
    const data = await questionService.getQuestionsByExamId(Number(id));
    return res.status(200).json(data);
  } catch (err: any) {
    return handlePrismaError(err, res);
  }
};

export const insertQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { question, exam_id, choicesList } = req.body;

  // Validate question
  const { error: questionError } = questionValidation.insert({
    question,
    exam_id,
  });

  if (questionError) {
    return handleValidationError(questionError, res);
  }

  // Validate choices
  const choicesData = choicesList.map((choice: ChoicesModel) => ({
    description: choice.description,
    status: choice.status,
  }));
  const { error: choicesError } = choicesValidation.insert(choicesData);

  if (choicesError) {
    return handleValidationError(choicesError, res);
  }

  try {
    const result = await questionService.createQuestion(question, exam_id, choicesList);
    return res.status(201).json({
      message: "Created successfully",
      data: result,
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { question, question_id, choicesList } = req.body;

  // Validate question
  const { error: questionError } = questionValidation.update({
    question,
    question_id,
  });

  if (questionError) {
    return handleValidationError(questionError, res);
  }

  // Validate choices
  const { error: choicesError } = choicesValidation.update(choicesList);

  if (choicesError) {
    return handleValidationError(choicesError, res);
  }

  try {
    await questionService.updateQuestion(question, question_id, choicesList);
    return res.status(200).json({
      message: "Updated successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;
  try {
    await questionService.deleteQuestion(Number(id));
    return res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (err) {
    return handlePrismaError(err, res);
  }
};