// Base Timestamp Interface
import { Request } from 'express';

interface Timestamped {
    createdAt?: Date;
    updatedAt?: Date;
}


// Examinee Model
export interface ExamineeModel extends Timestamped {
    examinee_id?: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    username: string;
    password: string;
    Answers?: AnswersModel[]; // Optional relationship
    ExamAttempt?: ExamAttemptModel[]; // Optional relationship
}

// Course Model
export interface CourseModel extends Timestamped {
    course_id?: number;
    description: string;
    score: string;
    AssignDeans?: AssignDeansModel[]; // Optional relationship
}

// Exam Model
export interface ExamModel extends Timestamped {
    exam_id?: number;
    exam_title: string;
    description: string;
    time_limit: number;
    question_limit: number;
    status: boolean;
    Question?: QuestionModel[]; // Optional relationship
    Answers?: AnswersModel[]; // Optional relationship
    ExamAttempt?: ExamAttemptModel[]; // Optional relationship
}

// Question Model
export interface QuestionModel extends Timestamped {
    question_id?: number;
    question: string;
    exam_id?: number;
    Exam?: ExamModel[]; // Optional relationship
    Choices?: ChoicesModel[]; // Optional relationship
    Answers?: AnswersModel[]; // Optional relationship
}

// Choices Model
export interface ChoicesModel extends Timestamped {
    choices_id?: number;
    question_id: number;
    questionList?: QuestionModel; // Optional relationship
    description: string;
    status: boolean;
    Answers?: AnswersModel[]; // Optional relationship
}

// Answers Model
export interface AnswersModel extends Timestamped {
    examinee_id: number;
    exam_id: number;
    question_id: number;
    choices_id: number;
    examineeList?: ExamineeModel; // Optional relationship
    examList?: ExamModel; // Optional relationship
    questionList?: QuestionModel; // Optional relationship
    choicesList?: ChoicesModel; // Optional relationship
}

// ExamAttempt Model
export interface ExamAttemptModel extends Timestamped {
    examinee_id: number;
    exam_id: number;
    examineeList?: ExamineeModel; // Optional relationship
    examList?: ExamModel; // Optional relationship
}

// Department Model
export interface DepartmentModel extends Timestamped {
    department_id?: number;
    department_name: string;
    status: boolean;
    Deans?: DeansModel; // Optional relationship
}

// Deans Model
export interface DeansModel extends Timestamped {
    deans_id?: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    username: string;
    password: string;
    department_id: number; // Unique
    department?: DepartmentModel; // Optional relationship
    AssignDeans?: AssignDeansModel[]; // Optional relationship
}

// AssignDeans Model
export interface AssignDeansModel extends Timestamped {
    deans_id: number;
    course_id: number;
    deans?: DeansModel; // Optional relationship
    course?: CourseModel; // Optional relationship
}


export interface AuthModel {
    id?: string,
    username?: string,
    password?: string
    role: string
}


export interface DecodedPayload {
    id: string;
    email: string | null;
    first_name: string;
    last_name: string,
    middle_name: string,
    role: string

}

export interface answerModel {
    examinee_id: string,
    exam_id: number,
    choices_id: number,
    question_id: number
}



export interface AllResultModel {
    examineeId: string,
    first_name: string,
    last_name: string,
    middle_name: string,
    total_questions: number;
    total_correct_answers: number;
    fullname?: string
}

export interface ExamHeader {
    exam_id: number;
    time_limit: number;
    exam_title: string;
    data: ExamDetailsModel[];
}


export interface ExamDetailsModel {
    question_id: number,
    question: string,
    choices: {
        value: number,
        label: string
    }[];
}

export interface SummaryResult {
    examinee_id: string,
    first_name: string,
    last_name: string,
    middle_name: string,
    birth_date: string,
    school: string,
    email: string,
    address: string,
    contact_number: string,
    examattempt: number,
    examcnt: number,
    exam_id: number,
    exam_title: string,
    total_correct_answers: number,
    total_questions: number,

}






declare module 'express' {
    interface Request {
        user?: any; // Replace `any` with your specific user type if available
    }
}

