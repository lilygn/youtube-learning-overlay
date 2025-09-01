import { useState, useEffect } from 'react';
import './App.css';
import { getTranscript } from './transcript.jsx';
import { summarizeText, generateQuizQuestions } from './openai.jsx';

export default function App() {
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const transcript = await getTranscript();
        if (!transcript) {
          setSummary('');
          setQuiz([]);
          setErr('Transcript not available on this page.');
          return;
        }

        const [summaryResult, quizResult] = await Promise.all([
          summarizeText(transcript).catch(e => {
            throw new Error(e?.message || 'Summarization failed (check API key in Options).');
          }),
          generateQuizQuestions(transcript).catch(e => {
            // Quiz can fail independently; don’t kill the whole UI
            console.warn('Quiz generation failed:', e);
            return [];
          })
        ]);

        if (cancelled) return;
        setSummary(summaryResult || '');
        setQuiz(Array.isArray(quizResult) ? quizResult : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || 'Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const copySummary = async () => {
    const text = (summary || '')
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*/, '• '))
      .join('\n')
      .trim();
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const bulletLines = (summary || '')
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, ''));

  return (
    <div className="youtube-learning-overlay-root" id="ytOverlay" aria-live="polite">
      {/* HEADER is the DRAG HANDLE */}
      <div className="yt-overlay__header" id="ytDragHandle" aria-label="Overlay header (drag to move)">
        <div className="yt-overlay__title">YouTube Learning Assistant</div>
        <div className="yt-overlay__actions">
          <button className="yt-btn" onClick={copySummary} title="Copy summary" aria-label="Copy summary">⧉</button>
          <button className="yt-btn" onClick={() => chrome.runtime?.openOptionsPage?.()} title="Settings" aria-label="Open settings">⚙️</button>
          <button
            className="yt-btn close-button"
            onClick={() => document.getElementById('ytOverlay')?.remove()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="main-overlay-content">
        {loading && (
          <>
            <h2>Summary</h2>
            <ul className="summary-list">
              <li className="skeleton-line" />
              <li className="skeleton-line" />
              <li className="skeleton-line" />
            </ul>
            <h2>Quiz Questions</h2>
            <div className="quiz-question skeleton-block" />
            <div className="quiz-question skeleton-block" />
          </>
        )}

        {!loading && err && (
          <div role="alert" className="yt-error" style={{ marginBottom: 8 }}>
            {err}
            <div className="yt-muted" style={{ marginTop: 6 }}>
              Tip: Make sure your OpenAI API key is set in <button className="yt-linklike" onClick={() => chrome.runtime?.openOptionsPage?.()}>Options</button>.
            </div>
          </div>
        )}

        {!loading && !err && (
          <>
            <h2>Summary</h2>
            {bulletLines.length ? (
              <ul className="summary-list">
                {bulletLines.map((text, i) => <li key={i}>{text}</li>)}
              </ul>
            ) : (
              <p className="yt-muted">No summary available.</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <h2 style={{ margin: 0, flex: 1 }}>Quiz Questions</h2>
            </div>

            {quiz?.length ? (
              quiz.map((q, idx) => (
                <div key={idx} className="quiz-question">
                  <strong>{idx + 1}. {q.question}</strong>
                  <ul>
                    {q.choices?.map((choice, i) => <li key={i}>{choice}</li>)}
                  </ul>
                  {q.answer && <div className="quiz-answer">Correct Answer: {q.answer}</div>}
                </div>
              ))
            ) : (
              <p className="yt-muted">No quiz available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
