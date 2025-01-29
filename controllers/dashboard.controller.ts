// controllers/summaryController.ts
import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.services';
import { handlePrismaError } from '../util/prismaErrorHandler';
import { allResult } from '../services/results.services';
import { getCourse } from '../services/course.services';

export const getTotalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const [courseCount, examCount, registeredExaminee, completeExaminee, examPassed, allResults, allCourses] = await Promise.all([
      dashboardService.getCourseCount(),
      dashboardService.getExamCount(),
      dashboardService.getRegisteredExaminee(),
      dashboardService.getCompletedExaminees(),
      dashboardService.getExamPassed(),
      allResult(), 
      getCourse()  
    ]);
    const getCoursePassed = await dashboardService.getCoursePassed(allResults, allCourses);


    const regCount = registeredExaminee.reduce((a, b) => a + b.count, 0);
    const comCount = completeExaminee.reduce((a, b) => a + b.count, 0);

    const finalMap = {
      summary: {
        registeredExaminee: regCount,
        completedExaminee: comCount,
        totalCourse: courseCount,
        totalExams: examCount
      },
      regExaminee: registeredExaminee,
      comExaminee: completeExaminee,
      coursesPassed: Object.values(getCoursePassed),
      examPassed: examPassed
    };

    return res.status(200).json(finalMap);
  } catch (err) {
    return handlePrismaError(err, res);
  }
};