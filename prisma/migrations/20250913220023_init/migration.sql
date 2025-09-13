-- CreateEnum
CREATE TYPE "public"."CallOutcome" AS ENUM ('OFFER_DECLINED', 'CALL_FORWARDING_FAILED', 'CALL_FORWARDING_SUCCEED', 'AI_CALLBACK_REQUESTED', 'CALL_DECLINED', 'CALL_TIMED_OUT', 'VOICEMAIL_REACHED', 'CALL_ERROR', 'CALL_HUNG_UP_IMMEDIATELY', 'CALL_IDLE');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('IN_PROGRESS', 'FORWARDING', 'ENDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."CallType" AS ENUM ('INBOUND_PHONE_CALL', 'OUTBOUND_PHONE_CALL', 'WEBCALL');

-- CreateEnum
CREATE TYPE "public"."ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."call" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "first_name" TEXT,
    "company_id" TEXT NOT NULL,
    "company_name" TEXT,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT,
    "phone_number" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "call_duration" DOUBLE PRECISION,
    "call_type" "public"."CallType" NOT NULL DEFAULT 'OUTBOUND_PHONE_CALL',
    "call_status" "public"."CallStatus",
    "call_outcome" "public"."CallOutcome",
    "call_attempt_num" INTEGER NOT NULL DEFAULT 0,
    "assistant_id" TEXT,
    "summarized_transcript" TEXT,
    "call_recording_url" TEXT,
    "llm_prompt_tokens" INTEGER,
    "llm_prompt_cached_tokens" INTEGER,
    "llm_completion_tokens" INTEGER,
    "tts_characters_count" INTEGER,
    "tts_audio_duration" DOUBLE PRECISION,
    "stt_audio_duration" DOUBLE PRECISION,
    "total_latency" DOUBLE PRECISION,
    "eou_end_of_utterance_delay" DOUBLE PRECISION,
    "llm_ttft" DOUBLE PRECISION,
    "tts_ttfb" DOUBLE PRECISION,
    "total_cost" DOUBLE PRECISION,
    "stt_cost" DOUBLE PRECISION,
    "tts_cost" DOUBLE PRECISION,
    "llm_cost" DOUBLE PRECISION,
    "raw_metrics" JSONB,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_transcript" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "transcript_seq" INTEGER,
    "transcript_id" TEXT,
    "role" "public"."ChatRole",
    "transcript" TEXT,
    "type" TEXT,
    "interrupted" BOOLEAN,
    "transcript_confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "call_transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "first_name" TEXT,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT,
    "phone_number" TEXT NOT NULL,
    "call_attempts" INTEGER DEFAULT 0,
    "last_call_id" TEXT,
    "last_call_status" TEXT,
    "last_call_timestamp" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_room_name_key" ON "public"."call"("room_name");

-- CreateIndex
CREATE UNIQUE INDEX "call_call_recording_url_key" ON "public"."call"("call_recording_url");

-- CreateIndex
CREATE UNIQUE INDEX "customer_last_call_id_key" ON "public"."customer"("last_call_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_customer_id_campaign_id_key" ON "public"."customer"("customer_id", "campaign_id");

-- AddForeignKey
ALTER TABLE "public"."call_transcript" ADD CONSTRAINT "call_transcript_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "public"."call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
