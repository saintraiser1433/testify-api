import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { answerModel } from '../models';



export const insertAnswer = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const body = req.body;
    try {
        return prisma.$transaction(async (tx) => {
            // const { error, value } = courseValidation.insert(body);

            // if (error) {
            //     return res.status(400).json({
            //         message: error.details[0].message,
            //     })

            // }

            // const course = await tx.course.findFirst({
            //     where: {
            //         description: value.description,
            //     },
            // });

            // if (course) {
            //     return res.status(409).json({
            //         message: "Course already exist",

            //     })
            // }

            //insertion  attempt
            await tx.examAttempt.create({
                data: {
                    examinee_id: body.examinee_id,
                    exam_id: body.exam_id
                }
            })
            const response = await tx.answers.createMany({
                data: body.details.map((detail: answerModel) => ({
                    examinee_id: body.examinee_id,
                    exam_id: body.exam_id,
                    question_id: detail.question_id,
                    choices_id: detail.choices_id,
                })),
            });
            return res.status(201).json({
                message: "Submitted Successfully",
                data: response,
            })
        });
    } catch (err: any) {
        return res.status(500).json({
            message: err.message,
        })
    }

}


// export const getTotalScore = async(req:Request,res:Response) : Promise<Response> => {
//     const id = req.params.examineeId;

//     try{
//         const response = await prisma.
//     }catch(err:any){

//     }
// }


