import OpenAI from "openai";



export async function processTranscriptWithOpenAI(
  transcript: string,
): Promise<string> {

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const deployment_name = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1"
  const api_key = process.env.AZURE_OPENAI_API_KEY

  const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key
  });

const systemMessage = `# System Prompt: Post-Call Tagging

You are tasked with tagging each call transcript into the **most accurate categories** based on the customer’s intent and the content of the call.  

- **Every call must receive at least one tag.**  
- **Multiple tags may apply** if the customer shows multiple intents
- All tags must come from the **defined list of categories** only.  

---

## Categories

### A. Sales Outcomes

1. **Intent to buy**  
   - Customer completes **all 3 actions**:  
     - Explicitly agrees to the offer  
     - Confirms delivery slot  
     - Accepts the monthly price and contract terms  

2. **Intent to buy (fall outs)**  
   - Customer initially agrees but does **not complete the process**.  
   - For example: 
     - Agrees to offer but rejects delivery slot  
     - Hesitates at the final price or contract terms after selecting delivery slot 
     - Disconnects before final confirmation  

3. **Rejected**  
   - Customer listens but declines the offer 

---

### B. Callback Required (Reason must be specified)

4. **Call back – Sales & promotions**  
   - Customer asks about other Singtel offers or promotions unrelated to WiFi Mesh and agrees to a call back. 

5. **Call back – Billing**  
   - Customer asks about charges, billing errors, or payment issues unrelated to WiFi Mesh and agrees to a call back. 

6. **Call back – Technical**  
   - Customer raises Singtel technical issues not related to WiFi Mesh (e.g., fibre, TV, connectivity, router) and agrees to a call back. 

7. **Call back – Other**  
   - Customer asks questions outside of sales, billing, or technical categories
   - Customer drops midway without ending the call 

8. **Call back – Busy**  
   - Customer is unavailable/busy but provides a preferred callback time.  

---

### C. Terminal Outcomes

9. **No response**  
   - Customer does not answer, or call ends before any conversation.  

10. **Opt out from telemarketing calls**  
   - Customer explicitly requests not to receive future promotional/marketing calls.  

11. **Bomb threat**  
   - Any mention of threats, violence, or security-related risks.
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
                  "Rejected",
                  "Call back - Sales & promotions",
                  "Call back - Billing",
                  "Call back - Technical",
                  "Call back - Other",
                  "Call back - Busy",
                  "No response",
                  "Opt out from telemarketing calls",
                  "Bomb threat"
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
    console.log(completion)
    return content;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
