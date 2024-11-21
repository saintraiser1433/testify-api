import { Router } from 'express';
import examinee from './examinee.route';
import course from './course.route';
import deans from './deans.route';
import exam from './exam.route';
import department from './department.route';
import question from './question.route';
import auth from './auth.route'
import fileUpload from './file.route'
const router = Router();
router.use('/auth', auth)
router.use('/exam', exam);
router.use('/question', question);
router.use('/department', department);
router.use('/examinee', examinee);
router.use('/course', course);
router.use('/deans', deans);
router.use('/file', fileUpload);

export default router;
