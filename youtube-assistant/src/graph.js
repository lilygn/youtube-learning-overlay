import { classifyIntent, getExplanation, generateQuiz, generalChat } from "./node.js";

export const executor = {
  invoke: async ({ message }) => {
    const { next } = await classifyIntent({ message });

    if (next === "explain") {
      const { result } = await getExplanation({ message });
      return result;
    }

    if (next === "quizgen") {
      const { result } = await generateQuiz({ message });
      return result;
    }

    const { result } = await generalChat({ message });
    return result;
  }
};
