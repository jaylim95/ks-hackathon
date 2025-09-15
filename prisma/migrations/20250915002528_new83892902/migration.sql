/*
  Warnings:

  - The `call_outcome_new` column on the `call` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."call" DROP COLUMN "call_outcome_new",
ADD COLUMN     "call_outcome_new" TEXT[];
