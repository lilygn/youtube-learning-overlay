// src/content.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const HOST_ID = 'youtube-learning-overlay-root';
const CSS_URL = chrome.runtime.getURL('assets/index.css');

function ensureHost() {
  let host = document.getElementById(HOST_ID);
  if (host) return host;
  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.bottom = '20px';
  host.style.right = '20px';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'auto';
  (document.body || document.documentElement).appendChild(host);
  return host;
}

function bindDrag(host, shadow, selector = '#ytDragHandle') {
  const handle = shadow.querySelector(selector) || shadow.querySelector('#ytOverlay') || shadow.firstElementChild;
  if (!handle || handle._yloDragBound) return;
  handle._yloDragBound = true;

  Object.assign(handle.style, { cursor: 'grab', userSelect: 'none', touchAction: 'none' });
  handle.setAttribute('draggable', 'false');

  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  const onMouseDown = (e) => {
    const t = e.target, tag = t?.tagName;
    if (['INPUT','TEXTAREA','BUTTON','SELECT'].includes(tag) || t?.isContentEditable) return;

    const r = host.getBoundingClientRect();
    startLeft = r.left; startTop = r.top;
    startX = e.clientX; startY = e.clientY;

    host.style.right = 'auto';
    host.style.bottom = 'auto';
    host.style.left = `${startLeft}px`;
    host.style.top  = `${startTop}px`;
    host.style.position = 'fixed';

    dragging = true;
    handle.style.cursor = 'grabbing';
    e.preventDefault();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup',   onMouseUp,   { passive: true });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    host.style.left = `${startLeft + (e.clientX - startX)}px`;
    host.style.top  = `${startTop  + (e.clientY - startY)}px`;
  };

  const onMouseUp = () => {
    if (!dragging) return;
    dragging = false;
    handle.style.cursor = 'grab';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup',   onMouseUp);
  };

  handle.addEventListener('mousedown', onMouseDown, { passive: false });
}

function mountApp() {
  const host = ensureHost();
  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });

  if (!shadow.querySelector('link[data-ylo-style]')) {
    const link = document.createElement('link');
    link.dataset.yloStyle = 'true';
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    shadow.appendChild(link);
  }

  let rootEl = shadow.getElementById?.('ylo-root');
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = 'ylo-root';
    shadow.appendChild(rootEl);
  }
  if (!rootEl._yloRoot) rootEl._yloRoot = createRoot(rootEl);
  rootEl._yloRoot.render(<App />);

  bindDrag(host, shadow, '#ytDragHandle');
  setTimeout(() => bindDrag(host, shadow, '#ytDragHandle'), 0);
}

function startWatchdogs() {
  window.addEventListener('yt-navigate-finish', () => setTimeout(mountApp, 50));
  const mo = new MutationObserver(() => {
    if (!document.getElementById(HOST_ID)) mountApp();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => {
    if (!document.getElementById(HOST_ID)) mountApp();
  }, 3000);
}

(function init() {
  if (window.__YLO_LOADED__) return;
  window.__YLO_LOADED__ = true;

  const run = () => { mountApp(); startWatchdogs(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  console.log('[YLO] content script active');
})();
