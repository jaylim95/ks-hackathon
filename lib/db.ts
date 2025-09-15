"use server"

import { PrismaClient, call, call_transcript } from '@prisma/client';

const prisma = new PrismaClient();


// export async function uploadBlobToStorage(recordingURL: string) {

// }

export async function upsertCallToDB(data: call) {
  const { id, ...updateData } = data;
  console.log(process.env.DATABASE_URL)
  try {
    const result = await prisma.call.upsert({
      where: {
        id: id, // must be unique
      },
      update: {
        ...updateData,
        raw_metrics: {},
        updated_at: new Date()
      },
      create: {
        ...data,
        raw_metrics: {},
        created_at: new Date(),
        updated_at: new Date()
      },
    })
    


    console.log("data updated into db")
    return result;
  } catch (error) {
    console.error('Error writing call data to DB:', error);
    throw error;
  }
}

export async function createTranscriptInDB(transcriptData:call_transcript[]) {
  try{
    await prisma.call_transcript.createMany({
      data: transcriptData,
      skipDuplicates: true
    });
  } catch (error) {
    console.error('Error writing call data to DB:', error);
    throw error;
  }
}

