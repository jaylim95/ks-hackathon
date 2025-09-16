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

                        You are tasked with tagging each call transcript into *all relevant categories* based on the customer’s intent and the content of the call.  
                        - There must be at least one tag 
                        - Multiple tags can be applied if the customer shows multiple intents.  
                          - Example: A customer asks about billing (→ Billing related enquiries – Call back) and also rejects the WiFi Mesh offer (→ Rejected).  
                        - Tags must always come from the defined list below.  


                        ## Categories:

                        1. *Intent to buy*  
                          - Customer completes all the following 3 actions: explicitly agrees to the offer, confirms the delivery slot, and accepts the monthly price.  

                        2. *Intent to buy (fall outs)*  
                          - Customer initially agrees but does not complete the process (e.g., rejects delivery options, declines final monthly price, or hesitates at confirmation).  

                        3. *Sales and promotion related (outside of WiFi Mesh) – Call back*  
                          - Customer asks about other offers or promotions unrelated to WiFi Mesh that cannot be resolved during the call and agrees to a callback.  

                        4. *Billing related enquiries – Call back*  
                          - Customer asks about current plan charges, billing errors, or payment issues, related to Singtel but unrelated to Wifi mesh that cannot be resolved during the call and agrees to a callback.  

                        5. *Technical related enquiries – Call back*  
                          - Customer raises Singtel technical issues not related to WiFi Mesh (e.g., fibre, connectivity, router issues) that cannot be resolved during the call and agrees to a callback.  

                        6. *Other enquiries – Call back*  
                          - Customer raises questions not covered by sales, promotion, billing, or technical categories (e.g., account holder details, administrative queries) and agrees to a callback.  This can be related to or not related to Wifi mesh. 

                        7. *No response*  
                          - Customer does not answer or hangs up before any meaningful conversation occurs.  

                        8. *Rejected*  
                          - Customer explicitly declines the offer and does not request further follow-up.  

                        9. *Bomb threat*  
                          - Any mention of threats, violence, or security-related risks.  

                        10. *Opt out from telemarketing calls*  
                          - Customer explicitly asks not to receive future promotional or marketing calls.

                        11. *Customer busy - Call back*  
                          - Customer is currently unavailable/ busy, and has provided an alternative time for a call back.
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
                      "Opt out from telemarketing calls",
                      "Customer busy - Call back"
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
