// inngest/functions/handleEndOfCall.ts
import { inngest } from "@/lib/inngest";

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
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const apiKey = process.env.TWILIO_API_KEY!;
      const apiSecret = process.env.TWILIO_API_SECRET!;
      const from = "+13239876046";
      const to = "+16282895738";
      const body = data.summary;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("From", from);
      formData.append("Body", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
      }

      const messageData = await response.json();
      console.log("SMS sent, SID:", messageData.sid);
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }
);
