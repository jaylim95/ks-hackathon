import OpenAI from "openai";



export async function processTranscriptWithOpenAI(
  transcript: string,
): Promise<string> {

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const deployment_name = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1-mini"
  const api_key = process.env.AZURE_OPENAI_API_KEY

  const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key
  });

const systemMessage = `You are a helpful assistant at a Singapore-based telco, who specializes in summarizing information from a sales call.

            Your task:
            1. Summarize the call transcript from the perspective of the sales rep.
            2. Categorize the call into a variable called call_outcome_new, which  can take multiple possible values.

            ### Definitions for call_outcome_new:
            - Intent to buy: Customer shows clear intention to purchase the product.
            - Example: "Yes, I’d like to sign up today."
            - Intent to buy (fall outs): Customer initially showed buying intent but later backed out.
            - Example: "Customer showed clear intent to buy, but then changed his mind."
            - Sales and promotion related (outside of Wifi Mesh) - Call back: Customer asks about promotions or sales not related to Wifi Mesh.
            - Example: "I want to knowabout the new mobile plan discount."
            - Billing related enquiries - Call back: Customer asks about billing.
            - Example: "I need details about my last invoice"
            - Technical related enquiries - Call back: Customer raises technical issues.
            - Example: "My internet keeps dropping, I can;t hear you."
            - No response: Customer gives no meaningful input or stays silent.
            - Example: No reply, hangup, irrelevant noise.
            - Rejected: Customer firmly declines the offer.
            - Example: "No, I am not interested. Don’t call again."
            - Bomb threat: Customer makes a direct bomb threat.
            - Example: "I’m going to bomb your office."
            - Opt out from telemarketing calls: Customer asks not to be contacted again for sales.
            - Example: "Remove me from your call list. Don't call me again for marketing."

            Rules:
            - Ignore fillers, noise, or repetition.
            - Never mention the sales agent name.
            - If unsure, say "I don't know".
            `

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Summarize transcripts below for a sales call between the sales agent (assistant) and the customer (user): ${transcript}` }
      ],
      model: deployment_name,
      response_format: {
          "type": "json_schema",
          "json_schema": {
          "name": "call_summary_schema",
          "strict": true,
          "schema": {
              "type": "object",
              "properties": {
              "call_outcome_new": {
                  "type": "array",
                  "description": "Fine-grained call outcome; multiple selections allowed.",
                  "items": {
                  "type": "string",
                  "enum": [
                      "Intent to buy",
                      "Intent to buy (fall outs)",
                      "Sales and promotion related (outside of Wifi Mesh) - Call back",
                      "Billing related enquiries - Call back",
                      "Technical related enquiries - Call back",
                      "No response",
                      "Rejected",
                      "Bomb threat",
                      "Opt out from telemarketing calls"
                  ],
                  "description": "Choose one or more detailed outcomes."
                  }
              }
              },
              "required": [
              "call_outcome_new"
              ],
              "additionalProperties": false
          }
          }
      }
    });
    const content = completion.choices[0]?.message?.content ?? "";
    console.log(content)
    return content;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
