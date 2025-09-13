// "use server"

// import { PrismaClient, call, call_transcript } from '@prisma/client';

// // const prisma = new PrismaClient();


// export async function uploadBlobToStorage(recordingURL: string) {

// }

// export async function writeDataToDB(data: any) {


//   // try {
//   //   const { call_transcripts, raw_metrics, ...callData } = data;
    
//   //   const createdCall = await prisma.call.create({
//   //     data: {
//   //       ...callData,
//   //       raw_metrics: raw_metrics as any,
//   //       call_transcript: call_transcripts
//   //         ? { create: call_transcripts }
//   //         : undefined,
//   //     },
//   //     include: { call_transcript: true },
//   //   });

//   //   return createdCall;
//   // } catch (error) {
//   //   console.error('Error writing call data to DB:', error);
//   //   throw error;
//   // }
// }
