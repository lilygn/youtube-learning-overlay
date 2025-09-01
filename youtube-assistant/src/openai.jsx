async function getKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('OPENAI_KEY', ({ OPENAI_KEY }) => {
      if (!OPENAI_KEY) {
        reject(new Error('No API key set. Go to extension settings.'));
      } else {
        resolve(OPENAI_KEY);
      }
    });
  });
}

export async function summarizeText(text) {
  const OPEN_AI_KEY = await getKey();   // <-- get the user’s key here
  const prompt = `Summarize the following transcript into bullet points:\n\n${text}`;

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
  return data.choices?.[0]?.message?.content || '';
}

export async function generateQuizQuestions(text) {
  const OPEN_AI_KEY = await getKey();   // <-- same here
  const prompt = `Make 3 multiple-choice questions based on:\n\n${text}`;

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
  return data.choices?.[0]?.message?.content || '';
}
