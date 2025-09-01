import fetch from 'node-fetch';
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;

export async function summarizeText(text) {
  const prompt = `Summarize the following YouTube video transcript into clear, concise bullet points of only the most important concepts, facts, or ideas. Format each point with a dash (-) at the start:\n\n${text}\n\nSummary:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPEN_AI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log("Text summarized successfully:", data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return null;
  }
}

export async function generateQuizQuestions(text) {
  const prompt = `Based on the following text, create 3 multiple-choice quiz questions to test understanding. For each question, provide 4 options labeled A, B, C, D, and specify the correct answer letter at the end. Format each question as:

Question: <question>
A. <option A>
B. <option B>
C. <option C>
D. <option D>
Answer: <correct letter>

Here is the text:\n\n${text}\n\nQuestions:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPEN_AI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log("Quiz questions generated successfully:", data);
    rawOutput = data.choices[0].message.content;
    const questions = rawOutput.split("Question:").slice(1).map(qBlock => {
        const lines = qBlock.trim().split("\n");
        const question = lines[0].trim();
        const choices = lines.slice(1,5).map(line => line.trim());
        const answerLine = lines.find(line => line.startsWith("Answer:"));
        const answer = answerLine ? answerLine.split(":")[1].trim() : "";
        return { question, choices, answer };
      });
      console.log("Parsed quiz questions:", questions);
    return questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return null;
  }
}
