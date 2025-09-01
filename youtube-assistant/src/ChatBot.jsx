// import { useState } from 'react';
// import './ChatBot.css';

// export default function ChatBot() {
// const [chatOpen, setChatOpen] = useState(false);
// const [input, setInput] = useState("");
// const [messages, setMessages] = useState([]);

// const sendMessage = async () => {
//     if (!input.trim()) return;
  
//     const userMessage = { sender: 'user', text: input };
//     setInput(""); 
  
//     try {
//       const res = await fetch('http://localhost:5000/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input })
//       });
//       const data = await res.json();
//       const botMessage = { sender: 'bot', text: data.reply };
  
//       setMessages(prev => [...prev, userMessage, botMessage]); // Combine both at once
//     } catch (err) {
//       const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong.' };
//       setMessages(prev => [...prev, userMessage, errorMessage]);
//     }
//   };
  
// return ( 
//     <div className={'chat-widget ' + (chatOpen ? 'open' : 'closed')}>
//     <button className="chat-toggle" onClick={() => setChatOpen(!chatOpen)}>
//       {chatOpen ? 'Close Chat' : 'Open Chat'}
//     </button>
  
//     {chatOpen && (
//       <div className="chat-box">
//         <div className="chat-log">
//           {messages.map((msg, i) => (
//            <div key={i} className={`chat-message ${msg.sender}`}>
//            <span className="message-label">{msg.sender === 'user' ? 'You:' : 'Bot:'}</span>
//            <span className="message-text">{msg.text}</span>
//          </div>
//           ))}
//         </div>
  
//         <div className="chat-input">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type your message..."
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             disabled={false}
//           />
//           <button onClick={sendMessage}>Send</button>
//         </div>
//       </div>
//     )}
//   </div>

// );
// }