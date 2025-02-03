// controllers/questionController.ts
import { NextFunction, Request, Response } from "express";
import { createQuestionFunc, deleteQuestionFunc, getQuestionsByExamId, updateQuestionFunc } from "../services/question.services";
import { choicesValidation, questionValidation } from "../util/validation";
import { ChoicesModel } from "../models";


export const getQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    const data = await getQuestionsByExamId(Number(id));
    return res.status(200).json(data);
  } catch (err) {
    next(err)
  }
};

export const insertQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { question, exam_id, choicesList } = req.body;

  // Validate question
  const { error: questionError } = questionValidation.insert({
    question,
    exam_id,
  });

  if (questionError) {
    next(questionError)
  }

  // Validate choices
  const choicesData = choicesList.map((choice: ChoicesModel) => ({
    description: choice.description,
    status: choice.status,
  }));
  const { error: choicesError } = choicesValidation.insert(choicesData);

  if (choicesError) {
    next(choicesError)
  }

  try {
    const result = await createQuestionFunc(question, exam_id, choicesList);
    return res.status(201).json({
      message: "Created successfully",
      data: result,
    });
  } catch (err) {
    next(err)
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { question, question_id, choicesList } = req.body;

  // Validate question
  const { error: questionError } = questionValidation.update({
    question,
    question_id,
  });

  if (questionError) {
    next(questionError)
  }

  // Validate choices
  const { error: choicesError } = choicesValidation.update(choicesList);

  if (choicesError) {
    next(choicesError)
  }

  try {
    await updateQuestionFunc(question, question_id, choicesList);
    return res.status(200).json({
      message: "Updated successfully",
    });
  } catch (err) {
    next(err)
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  try {
    await deleteQuestionFunc(Number(id));
    return res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (err) {
    next(err)
  }
};