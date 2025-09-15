// app/api/webhooks/vapi/route.ts
import { inngest } from "@/lib/inngest";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const message = payload?.message;
    // console.log(payload)

    if (!message ) {
      return NextResponse.json({ error: "Invalid or missing event type" }, { status: 400 });
    } else if (message.type == "end-of-call-report") {
      console.log("call ended")
      await inngest.send({
        name: "vapi/call.ended",
        data: message, // send only the message portion
      });
    } else if (message.type == "status-update" && message.status == "in-progress") {
      console.log("call started")
      await inngest.send({
        name: "vapi/call.started",
        data: message, // send only the message portion
      });
    } else {
      console.log("unknown event")
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
