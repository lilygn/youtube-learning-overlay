async function getKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('OPENAI_KEY', ({ OPENAI_KEY }) => {
      if (!OPENAI_KEY) return reject(new Error('No API key set. Go to extension settings.'));
      resolve(OPENAI_KEY);
    });
  });
}

export async function generateQuizQuestions(text) {
  const OPEN_AI_KEY = await getKey();

  const prompt = `
Create exactly 3 multiple-choice questions from this transcript.
Return ONLY JSON with this shape (no backticks, no prose):

{
  "questions": [
    { "question": "...", "choices": ["A","B","C","D"], "answer": "A" },
    { "question": "...", "choices": ["A","B","C","D"], "answer": "C" },
    { "question": "...", "choices": ["A","B","C","D"], "answer": "B" }
  ]
}

Transcript:
${text}
`.trim();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPEN_AI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Return only valid JSON. No commentary.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';

  // robust JSON extraction (handles stray text)
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Quiz JSON parse failed.');
  }

  const arr = Array.isArray(parsed?.questions) ? parsed.questions : [];
  // normalize items
  return arr.map(q => ({
    question: String(q.question || '').trim(),
    choices: Array.isArray(q.choices) ? q.choices.map(String) : [],
    answer: String(q.answer || '').trim()
  }));
}

export async function summarizeText(text) {
  const OPEN_AI_KEY = await getKey();
  const prompt = `Summarize into concise bullet points:\n\n${text}`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPEN_AI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
