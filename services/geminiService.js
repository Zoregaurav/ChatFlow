import ai from "../config/gemini.js";

// AI ko messages bhejna aur AI ka reply return karna.
// Reusable function.

export const generateAIResponse = async ({ model, messages }) => {

  // 1. Convert our application's messages
  // into Gemini's format

  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));


  // 2. Find system message

  const systemMessage = messages.find(
    (message) => message.role === "system"
  );


  // 3. Send request to Gemini

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemMessage?.content || "",
    },
  });


  // 4. Get AI reply

  const aiReply = response.text;

  if (!aiReply) {
    throw new Error("AI response is empty");
  }


  // 5. Get token usage

  const promptTokens =
    response.usageMetadata?.promptTokenCount || 0;

  const completionTokens =
    response.usageMetadata?.candidatesTokenCount || 0;


  // 6. Return same structure your controller already expects

  return {
    aiReply,

    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
  };
};