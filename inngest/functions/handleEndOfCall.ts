// inngest/functions/handleEndOfCall.ts
import { inngest } from "@/lib/inngest";
import { call , ConnectionOutcome} from "@prisma/client";

import { upsertCallToDB , createTranscriptInDB } from "@/lib/db";

interface MessageData {
  message?: string;
  role: string;
  secondsFromStart?: number;
  time: number;
  duration?: number;
  endTime?: number;
  source?: string;
  // Additional fields that might exist
  name?: string;
  result?: string;
  toolCalls?: unknown[];
  toolCallId?: string;
}

export const handleEndOfCall = inngest.createFunction(
  { id: "handle-end-of-call" },
  { event: "vapi/call.ended" },
  async ({ event }) => {
    const data = event.data;
    console.log("call ended")
    console.log(data)
    const call = data.call;
    const callID = call?.id ;

    if (!callID) {
      console.warn("Missing callID in event");
      return { success: false };
    }

    // Map endedReason to connection_outcome
    const getConnectionOutcome = (endedReason: string): ConnectionOutcome => {
      switch (endedReason) {
        case 'assistant-request-failed':
        case 'twilio-failed-to-connect-call':
        case 'assistant-request-returned-invalid-assistant':
          return ConnectionOutcome.FAILED_TO_START_CALL;
        case 'customer-ended-call':
          return ConnectionOutcome.CUSTOMER_ENDED_CALL;
        case 'assistant-ended-call':
          return ConnectionOutcome.ASSISTANT_ENDED_CALL;
        case 'call.forwarding.operator-busy':
          return ConnectionOutcome.CALL_FORWARDED_FAILED;
        case 'assistant-forwarded-call':
          return ConnectionOutcome.CALL_FORWARDED_SUCCESSFUL;
        case 'twilio-reported-customer-misdialed':
          return ConnectionOutcome.INVALID_NUMBER;
        case 'customer-busy':
        case 'customer-did-not-answer':
          return ConnectionOutcome.DID_NOT_ANSWER;
        case 'exceeded-max-duration':
          return ConnectionOutcome.EXCEEDED_MAX_DURATION;
        case 'silence-timed-out':
          return ConnectionOutcome.SILENCE_TIMED_OUT;
        case 'voicemail':
          return ConnectionOutcome.VOICEMAIL_REACHED;
        default:
          return ConnectionOutcome.UNKNOWN_ERROR;
      }
    };

    const connection_outcome = getConnectionOutcome(data.call.endedReason);

    const callData: call = {
      id: callID,
      customer_id: Math.random().toString(36).substring(2, 15), // generate a random string
      first_name: "Charles",
      company_id: "na",
      company_name: "na",
      campaign_id: "camp_001",
      campaign_name: "WiFi Mesh",
      phone_number: data?.customer?.number,
      room_name: Math.random().toString(36).substring(2, 15), // generate a random string,
      call_duration: data.durationSeconds,
      call_type: "OUTBOUND_PHONE_CALL",   // must match enum
      call_status: "ENDED",                  // must match enum, set to null for now
      call_outcome: "CALL_IDLE",                 // nullable
      call_attempt_num: 1,
      assistant_id: data.assistant.id,
      assistant_name: null,
      summarized_transcript: data.summary,
      call_recording_url: data.artifact.recordingUrl,
      llm_prompt_tokens: data.costBreakdown.llmPromptTokens ,
      llm_prompt_cached_tokens: null,
      llm_completion_tokens: data.costBreakdown.llmCompletionTokens,
      tts_characters_count: data.costBreakdown.ttsCharacters,
      tts_audio_duration: data.costs.minutes * 60,
      stt_audio_duration: null,
      total_latency: data.artifact.performanceMetrics.turnLatencyAverage,
      eou_end_of_utterance_delay: data.artifact.performanceMetrics.endpointingLatencyAverage,
      llm_ttft: null,
      tts_ttfb: null,
      total_cost: null,
      stt_cost: null,
      tts_cost: null,
      llm_cost: null,
      raw_metrics: {},
      started_at: data.startedAt,
      ended_at: data.endedAt,
      created_at: data.startedAt, // has @default(now()), but TS type still requires it
      updated_at: null,
      connection_outcome: connection_outcome,
      call_outcome_new: ["no response"]
    };

    const result = await upsertCallToDB(callData);
    
    // Create transcript records
    if (data.message && data.message.length > 0) {
      const filteredMessages = data.message.filter((msg: MessageData) => 
        msg.role === 'bot' || msg.role === 'user'
      );
      
      const transcriptData = filteredMessages.map((msg: MessageData, index: number) => ({
        id: `${callID}_transcript_${index}`,
        call_id: callID,
        transcript_seq: index + 1,
        transcript_id: `${callID}_msg_${index}`,
        role: msg.role === 'bot' ? 'ASSISTANT' : 'USER',
        transcript: msg.message,
        type: 'message',
        interrupted: false,
        transcript_confidence: null,
        created_at: null,
        updated_at: null
      }));

      // Create transcript records
      await createTranscriptInDB(transcriptData)

    } 
    
    return { success: result };
  }
);

export const handleStartOfCall = inngest.createFunction(
  { id: "handle-start-of-call" },
  { event: "vapi/call.started" },
  async ({ event }) => {
    const data = event.data;
    console.log("call started 1")

    console.log(data)
    const call = data.call;
    const callID = call?.id ;

    if (!callID) {
      console.warn("Missing callID in event");
      return { success: false };
    }

    const callData: call = {
      id: callID,
      customer_id: Math.random().toString(36).substring(2, 15), // generate a random string
      first_name: "Charles",
      company_id: "na",
      company_name: "na",
      campaign_id: "camp_001",
      campaign_name: "WiFi Mesh",
      phone_number: data?.customer?.number,
      room_name: Math.random().toString(36).substring(2, 15), // generate a random string,
      call_duration: null,
      call_type: "OUTBOUND_PHONE_CALL",   // must match enum
      call_status: "IN_PROGRESS",                  // must match enum, set to null for now
      call_outcome: "CALL_IDLE",                 // nullable
      call_attempt_num: 1,
      assistant_id: data.assistant.id,
      assistant_name: null,
      summarized_transcript: null,
      call_recording_url: null,
      llm_prompt_tokens: null,
      llm_prompt_cached_tokens: null,
      llm_completion_tokens: null,
      tts_characters_count: null,
      tts_audio_duration: null,
      stt_audio_duration: null,
      total_latency: null,
      eou_end_of_utterance_delay: null,
      llm_ttft: null,
      tts_ttfb: null,
      total_cost: null,
      stt_cost: null,
      tts_cost: null,
      llm_cost: null,
      raw_metrics: {},
      started_at: null,
      ended_at: null,
      created_at: data.call.createdAt, // has @default(now()), but TS type still requires it
      updated_at: null,
      connection_outcome: ConnectionOutcome.IN_PROGRESS,
      call_outcome_new: []
    };

    console.log("call-start event")
    const result = await upsertCallToDB(callData);

    return { success: result };
  }
);
