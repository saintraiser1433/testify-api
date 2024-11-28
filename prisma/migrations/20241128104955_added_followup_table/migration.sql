-- CreateTable
CREATE TABLE "FollowUp" (
    "examineeId" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "birth_date" VARCHAR(50) NOT NULL,
    "contact_number" VARCHAR(50) NOT NULL,
    "school" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("examineeId")
);

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_examineeId_fkey" FOREIGN KEY ("examineeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
