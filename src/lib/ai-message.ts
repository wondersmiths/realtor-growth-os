import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface MessageContext {
  contactName: string;
  realtorName: string;
  realtorCity?: string;
  realtorBio?: string;
  propertyDetails?: string;
  marketInsight?: string;
  template?: string;
}

export async function generateMessage(ctx: MessageContext): Promise<string> {
  const systemPrompt = `You are a friendly real estate assistant writing an SMS on behalf of a realtor.
Rules:
- Keep the message under 160 characters
- Include one local detail about the city or neighborhood
- Use a warm, personal tone
- Do NOT use hashtags or emojis
- Address the contact by first name`;

  const userPrompt = `Write a short SMS from ${ctx.realtorName}${ctx.realtorCity ? ` based in ${ctx.realtorCity}` : ""} to ${ctx.contactName}.
${ctx.realtorBio ? `Realtor bio: ${ctx.realtorBio}` : ""}
${ctx.propertyDetails ? `Property: ${ctx.propertyDetails}` : ""}
${ctx.marketInsight ? `Market insight: ${ctx.marketInsight}` : ""}
${ctx.template ? `Message purpose: ${ctx.template}` : "Purpose: general follow-up"}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}
