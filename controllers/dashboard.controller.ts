// controllers/summaryController.ts
import { Request, Response, NextFunction } from 'express';
import { getCoursePassedFunc, getExamCount, getExamPassed, getQuestionPercentage, getRegisteredVsCompletedExaminees } 
from '../services/dashboard.services';
import { allResult } from '../services/results.services';
import { getCourse } from '../services/course.services';

export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const [examCount, summary, examPassed, summaryQuestions, allResults, allCourses] = await Promise.all([
      getExamCount(),
      getRegisteredVsCompletedExaminees(),
      getExamPassed(),
      getQuestionPercentage(),
      allResult(),
      getCourse()
    ]);
    const getCoursePassed = await getCoursePassedFunc(allResults, allCourses);
    const registeredExaminee = summary.reduce((a, b) => a + b.Registered, 0);
    const completedExaminee = summary.reduce((a, b) => a + b.Completed, 0);
    const courseCount = allCourses.length;

    const finalMap = {
      summary: {
        registeredExaminee: registeredExaminee,
        completedExaminee: completedExaminee,
        totalCourse: courseCount,
        totalExams: examCount
      },
      dailyRegisterVsCompleted: summary,
      summaryQuestions: summaryQuestions,
      coursesPassed: Object.values(getCoursePassed),
      examPassed: examPassed
    };

    return res.status(200).json(finalMap);
  } catch (err) {
    next(err)
  }
};