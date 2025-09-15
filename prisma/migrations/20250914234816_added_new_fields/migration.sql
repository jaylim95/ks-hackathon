/*
  Warnings:

  - Added the required column `call_outcome_new` to the `call` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ConnectionOutcome" AS ENUM ('FAILED_TO_START_CALL', 'IN_PROGRESS', 'CUSTOMER_ENDED_CALL', 'ASSISTANT_ENDED_CALL', 'CALL_FORWARDED_FAILED', 'CALL_FORWARDED_SUCCESSFUL', 'INVALID_NUMBER', 'DID_NOT_ANSWER', 'EXCEEDED_MAX_DURATION', 'SILENCE_TIMED_OUT', 'VOICEMAIL_REACHED', 'UNKNOWN_ERROR');

-- AlterTable
ALTER TABLE "public"."call" ADD COLUMN     "assistant_name" TEXT,
ADD COLUMN     "call_outcome_new" TEXT NOT NULL,
ADD COLUMN     "connection_outcome" "public"."ConnectionOutcome";
