// this code works on 4 -pillar

// 1️⃣ System instructions

// 2️⃣ Previous conversation summary

// 3️⃣ Old messages

// 4️⃣ Current user message

const SYSTEM_PROMPT = `
You are a helpful AI assistant.
Answer the user's question clearly and accurately.
If the user asks for code, provide clean and practical code.
If the user asks for explanation, explain in a simple and structured way.
If you are unsure, say that you are unsure instead of guessing.
`;



//karna chaiye..??.

export const buildMessagesForAI = ({ chat, oldMessages, currentMessage }) => {
  const messages = [
    { 
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];


  if (chat.summary && chat.summary.trim() !== "") {
    messages.push({
      role: "system",
      content: `Previous conversation summary:\n${chat.summary}`,
    });
  } 


  for (const msg of oldMessages) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.push({
    role: "user",
    content: currentMessage,
  });


  return messages;
};
