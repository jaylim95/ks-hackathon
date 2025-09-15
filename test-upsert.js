import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Replace with a valid ID in your schema
    const testCall = await prisma.call.upsert({
      where: { id: "test-call-123" }, // primary key in your model
      update: {
        call_duration: 45.5,
        room_name: "test-room-updated",
      },
      create: {
        id: "test-call-123",
        customer_id: "cust_001",
        company_id: "comp_001",
        campaign_id: "camp_001",
        phone_number: "+1234567890",
        room_name: "test-room-created",
        call_duration: 30.0,
      },
    });

    console.log("✅ Upsert successful:", testCall);
  } catch (err) {
    console.error("❌ Upsert failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
