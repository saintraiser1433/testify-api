import { Request, Response } from "express";
import { handlePrismaError } from "../util/prismaErrorHandler";
import { listOfQuestions, userInformation, countAttempt, countOfExam, allResult, groupSummaryByExam } from "../services/results.services";




export const getSummaryByExaminee = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.examineeId;

  if (!id) {
    return res.status(400).json({ message: "Examinee ID is required" });
  }

  try {
    const [questions, userInfo, attemptCount, examCount] = await Promise.all([
      listOfQuestions(id),
      userInformation(id),
      countAttempt(id),
      countOfExam(id),
    ]);

    const groupSummary = await groupSummaryByExam(questions);
    const combineData = {
      examinee_id: userInfo?.id || '',
      first_name: userInfo?.first_name || '',
      last_name: userInfo?.last_name || '',
      middle_name: userInfo?.middle_name || '',
      birth_date: userInfo?.followupData[0]?.birth_date || '',
      gender: userInfo?.followupData?.[0]?.gender || '',
      school: userInfo?.followupData?.[0]?.school || '',
      email: userInfo?.followupData?.[0]?.email || '',
      address: userInfo?.followupData?.[0]?.address || '',
      contact_number: userInfo?.followupData?.[0]?.contact_number || '',
      examineeAttempt: attemptCount,
      totalExams: examCount,
      examDetails: groupSummary,
    };

    return res.status(200).json(combineData);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};


export const getAllResult = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await allResult();
    return res.status(200).json(result);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};


