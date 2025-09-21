// inngest/functions/handleEndOfCall.ts
import twilio from "twilio";
import { inngest } from "@/lib/inngest";


// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export const handleEndOfCall = inngest.createFunction(
  { id: "handle-end-of-call" },
  { event: "vapi/call.ended" },
  async ({ event }) => {
    const data = event.data;
    console.log("call ended");
    console.log(data);

    // Make sure summary exists
    if (!data.summary) {
      console.log("No summary available to send via SMS.");
      return;
    }

    try {
      const message = await client.messages.create({
        body: data.summary,                  // Send the call summary
        from: "+13239876046", // e.g., "+15017122661"
        to: "16282895738",     // e.g., "+15558675310"
      });

      console.log("SMS sent, SID:", message.sid);
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }
);
