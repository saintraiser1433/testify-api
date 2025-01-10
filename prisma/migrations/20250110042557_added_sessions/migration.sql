-- CreateTable
CREATE TABLE "SessionDetails" (
    "question_id" INTEGER NOT NULL,
    "choices_id" INTEGER NOT NULL,
    "sessionHeader_id" TEXT NOT NULL,

    CONSTRAINT "SessionDetails_pkey" PRIMARY KEY ("question_id","choices_id")
);

-- CreateTable
CREATE TABLE "SessionHeader" (
    "session_id" TEXT NOT NULL,
    "examinee_id" VARCHAR(100) NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "timelimit" INTEGER NOT NULL,

    CONSTRAINT "SessionHeader_pkey" PRIMARY KEY ("session_id")
);

-- AddForeignKey
ALTER TABLE "SessionDetails" ADD CONSTRAINT "SessionDetails_sessionHeader_id_fkey" FOREIGN KEY ("sessionHeader_id") REFERENCES "SessionHeader"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
