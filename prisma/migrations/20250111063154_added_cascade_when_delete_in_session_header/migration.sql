-- DropForeignKey
ALTER TABLE "SessionDetails" DROP CONSTRAINT "SessionDetails_sessionHeader_id_fkey";

-- AddForeignKey
ALTER TABLE "SessionDetails" ADD CONSTRAINT "SessionDetails_sessionHeader_id_fkey" FOREIGN KEY ("sessionHeader_id") REFERENCES "SessionHeader"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;
