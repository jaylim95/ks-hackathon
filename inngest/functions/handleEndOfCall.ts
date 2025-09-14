// inngest/functions/handleEndOfCall.ts
import { inngest } from "@/lib/inngest";
// import { writeDataToDB } from "@/lib/db";

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

    // const updateResult = await updateCalls(callID, {
    //   callReport: JSON.stringify(call),
    //   transcript: JSON.stringify(data.messages) || '',
    //   completedAt: new Date(),
    //   videoUrl: data.artifact?.videoRecordingUrl,
    //   audioUrl: data.recordingUrl
    // });

    // return { success: updateResult };
  }
);

export const handleStartOfCall = inngest.createFunction(
  { id: "handle-start-of-call" },
  { event: "vapi/call.started" },
  async ({ event }) => {
    const data = event.data;
    console.log("call started")

    console.log(data)
  //   const call = data.call;
  //   const callID = call?.id ;

  //   if (!callID) {
  //     console.warn("Missing callID in event");
  //     return { success: false };
  //   }

  //   const updateResult = await updateCalls(callID, {
  //     callReport: JSON.stringify(call),
  //     transcript: JSON.stringify(data.messages) || '',
  //     completedAt: new Date(),
  //     videoUrl: data.artifact?.videoRecordingUrl,
  //     audioUrl: data.recordingUrl
  //   });

  //   return { success: updateResult };
  }
);
