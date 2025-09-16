-- DropForeignKey
ALTER TABLE "public"."call_transcript" DROP CONSTRAINT "call_transcript_call_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."call_transcript" ADD CONSTRAINT "call_transcript_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "public"."call"("id") ON DELETE CASCADE ON UPDATE CASCADE;
