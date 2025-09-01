import { useState, useEffect } from 'react'
import './App.css'
import { getTranscript } from './transcript.jsx'
import { summarizeText, generateQuizQuestions } from './openai.jsx';
//import ChatBot from './ChatBot.jsx';

function App() {
  const [summary, setSummary] = useState("Loading summary...");
  const [quiz, setQuiz] = useState([]); 
  const [chatOpen, setChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    async function pipeline() {
      const transcript = await getTranscript();
      if (transcript) {
        const summaryResult = await summarizeText(transcript);
        setSummary(summaryResult || "No summary available.");
        
        const quizResult = await generateQuizQuestions(transcript);
        setQuiz(quizResult || []);
      } else {
        setSummary("Transcript not available.");
        setQuiz([]);
      }
    }
    pipeline();
  }, []);

  
  return (
    <>
    <div className="main-overlay-content">

<h1>YouTube Learning Assistant</h1>

<h2>Summary</h2>
<ul className="summary-list">
{summary
.split("\n")
.filter(line => line.trim().startsWith("-")) 
.map((point, index) => (
<li key={index}>
  {point.replace(/^-\s*/, '')}
</li>
))}
</ul>

<h2>Quiz Questions</h2>
{quiz.length > 0 ? (
  quiz.map((q, index) => (
    <div key={index} className="quiz-question">
      <strong>{index + 1}. {q.question}</strong>
      <ul>
        {q.choices.map((choice, i) => (
          <li key={i}>{choice}</li>
        ))}
      </ul>
      <div className="quiz-answer">Correct Answer: {q.answer}</div>
    </div>
  ))
) : (
  <p>No quiz available.</p>
)}

</div>

    </>
    
    
  );
  
  
}

export default App
