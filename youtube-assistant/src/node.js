import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ temperature: 0.5 });

export async function classifyIntent({ message }) {
  const res = await model.invoke([
    { role: "system", content: "Classify the user's intent as one of: explain, quiz, chat." },
    { role: "user", content: message }
  ]);
  const content = res.content.toLowerCase();
  if (content.includes("explain")) return { next: "explain", message };
  if (content.includes("quiz")) return { next: "quizgen", message };
  return { next: "chat", message };
}

export async function getExplanation({ message }) {
  const res = await model.invoke([
    { role: "system", content: "Explain this concept clearly to a student." },
    { role: "user", content: message }
  ]);
  return { result: res.content };
}

export async function generateQuiz({ message }) {
  const res = await model.invoke([
    { role: "system", content: "Generate a multiple choice quiz based on this topic." },
    { role: "user", content: message }
  ]);
  return { result: res.content };
}

export async function generalChat({ message }) {
  const res = await model.invoke([
    { role: "system", content: "You're a helpful tutor." },
    { role: "user", content: message }
  ]);
  return { result: res.content };
}
