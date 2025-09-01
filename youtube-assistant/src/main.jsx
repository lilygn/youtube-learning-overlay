// src/main.jsx (content script entry)
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const HOST_ID = 'youtube-learning-overlay-host';
const CSS_URL = chrome.runtime.getURL('App.css'); // because it's in public/App.css → dist/App.css

function ensureHost() {
  let host = document.getElementById(HOST_ID);
  if (host) return host;

  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.bottom = '20px';
  host.style.right = '20px';
  host.style.pointerEvents = 'auto';
  (document.body || document.documentElement).appendChild(host);
  return host;
}

async function injectStyles(shadow) {
  if (shadow.querySelector('link[data-ylo-style], style[data-ylo-inline]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.yloStyle = 'true';
  link.href = CSS_URL;

  link.onload = () => console.log('[YLO] CSS linked OK:', link.href);
  link.onerror = async () => {
    console.warn('[YLO] CSS link failed, inlining instead:', link.href);
    try {
      const res = await fetch(CSS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const css = await res.text();
      const style = document.createElement('style');
      style.dataset.yloInline = 'true';
      style.textContent = css;
      shadow.appendChild(style);
      console.log('[YLO] CSS inlined OK');
    } catch (err) {
      console.error('[YLO] CSS inline fetch failed:', err);
    }
  };

  shadow.appendChild(link);
}

function makeDraggable(host, shadow, handleSel = '#ytDragHandle') {
  const handle = shadow.querySelector(handleSel) || shadow.getElementById('ylo-root') || shadow;
  if (!handle || handle._yloDragBound) return;
  handle._yloDragBound = true;

  let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  const onDown = (e) => {
    const t = e.target;
    const tag = t?.tagName;
    if (['INPUT','TEXTAREA','BUTTON','SELECT'].includes(tag) || t?.isContentEditable) return;
    dragging = true;
    handle.setPointerCapture?.(e.pointerId);

    const r = host.getBoundingClientRect();
    startLeft = r.left; startTop = r.top;
    startX = e.clientX; startY = e.clientY;

    host.style.right = 'auto';
    host.style.bottom = 'auto';
    host.style.left = `${startLeft}px`;
    host.style.top  = `${startTop}px`;
    host.style.position = 'fixed';

    e.preventDefault();
  };
  const onMove = (e) => {
    if (!dragging) return;
    host.style.left = `${startLeft + (e.clientX - startX)}px`;
    host.style.top  = `${startTop  + (e.clientY - startY)}px`;
  };
  const onUp = (e) => {
    dragging = false;
    try { handle.releasePointerCapture?.(e.pointerId); } catch {}
  };

  handle.style.touchAction = 'none';
  handle.style.userSelect = 'none';
  handle.addEventListener('pointerdown', onDown, { passive: false });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
}

function mountApp() {
  const host = ensureHost();
  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });

  injectStyles(shadow); // inject App.css into shadow

  let rootEl = shadow.getElementById?.('ylo-root');
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = 'ylo-root';
    shadow.appendChild(rootEl);
  }

  if (!rootEl._yloRoot) rootEl._yloRoot = createRoot(rootEl);
  rootEl._yloRoot.render(<App />);

  makeDraggable(host, shadow, '#ytDragHandle');
  setTimeout(() => makeDraggable(host, shadow, '#ytDragHandle'), 0);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { mountApp(); startWatchdogs(); }, { once: true });
  } else {
    mountApp();
    startWatchdogs();
  }
  console.log('[YLO] content script active (main.jsx)');
})();
