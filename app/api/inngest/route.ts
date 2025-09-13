// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { handleEndOfCall, handleStartOfCall } from "@/inngest/functions/handleEndOfCall";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleEndOfCall, handleStartOfCall],
});
