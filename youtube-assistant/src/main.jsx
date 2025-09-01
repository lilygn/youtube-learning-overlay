import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("React overlay script running!");

const overlayDiv = document.createElement('div');
overlayDiv.id = 'youtube-learning-overlay-root';
overlayDiv.className = 'youtube-learning-overlay-root';
overlayDiv.style.pointerEvents = 'auto'; // Allow interactions

document.body.appendChild(overlayDiv);

// Make overlay draggable
overlayDiv.onmousedown = function(event) {
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || event.target.isContentEditable) {
    return;
  }
  event.preventDefault();

  let shiftX = event.clientX - overlayDiv.getBoundingClientRect().left;
  let shiftY = event.clientY - overlayDiv.getBoundingClientRect().top;

  function moveAt(pageX, pageY) {
    overlayDiv.style.left = pageX - shiftX + 'px';
    overlayDiv.style.top = pageY - shiftY + 'px';
    overlayDiv.style.bottom = 'auto'; // Prevent CSS bottom override
    overlayDiv.style.right = 'auto';  // Prevent CSS right override
    overlayDiv.style.position = 'fixed';
  }

  moveAt(event.pageX, event.pageY);

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  document.addEventListener('mousemove', onMouseMove);

  document.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    document.onmouseup = null;
  };
};

overlayDiv.ondragstart = function() {
  return false;
};

createRoot(overlayDiv).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
