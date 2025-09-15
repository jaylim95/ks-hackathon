// Load environment variables
require('dotenv').config();

const { processTranscriptWithOpenAI } = require("../lib/openai");

async function main() {
  const argv = process.argv.slice(2);
  const transcriptArg = argv.join(" ");

  const sampleTranscript =
    "Agent: Hi! Are you still interested in the Wifi Mesh promo? User: Yes, I'm keen. What's the total monthly fee? Agent: It's $10/mo. User: Great, let's proceed. Agent: I'll send the signup link now. User: Thanks.";

  const transcript = transcriptArg && transcriptArg.trim().length > 0 ? transcriptArg : sampleTranscript;

  console.log("=== Running processTranscriptWithOpenAI ===");
  console.log("Endpoint:", process.env.AZURE_OPENAI_ENDPOINT || "<not set>");
  console.log("Deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "<not set>");

  try {
    const raw = await processTranscriptWithOpenAI(transcript);

    console.log("\n--- Raw content (string) ---");
    console.log(raw);
    console.log(raw.call_outcome_new)

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
      console.log("\n--- Parsed JSON ---");
      console.dir(parsed, { depth: null });

      if (
        parsed &&
        typeof parsed === "object" &&
        Object.prototype.hasOwnProperty.call(parsed, "call_outcome_new")
      ) {
        const obj = parsed;
        console.log("\nKey fields:");
        console.log("call_outcome_new:", obj["call_outcome_new"]);
        console.log(obj.call_outcome_new)

      }

      console.log(
        "\nConclusion: The API returns a JSON string that SHOULD be parsed (JSON.parse) before use."
      );
    } catch (_err) {
      console.log(
        "\nConclusion: The API returned a non-JSON string. Use it directly as text, or adjust response_format."
      );
    }
  } catch (err) {
    console.error("\nError while calling processTranscriptWithOpenAI:", err);
    process.exitCode = 1;
  }
}

main();


