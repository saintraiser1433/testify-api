import prisma from "../prisma/prisma";
export const insertFollowUp = async (data: any) => {
    return await prisma.followUp.create({ data });
}

export const getFollowup = async (examineeId: string) => {
    const checkFollowupData = await prisma.followUp.findFirst({
        where: {
            examinee_id: examineeId,
        },
    });
    return checkFollowupData;
}