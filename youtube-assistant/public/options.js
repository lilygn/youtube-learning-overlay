const input = document.getElementById('apiKey');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save');

chrome.storage.sync.get('OPENAI_KEY', ({ OPENAI_KEY }) => {
  if (OPENAI_KEY) input.value = OPENAI_KEY;
});

saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key.startsWith('sk-')) {
    status.textContent = 'Invalid key format ❌';
    return;
  }
  chrome.storage.sync.set({ OPENAI_KEY: key }, () => {
    status.textContent = 'Key saved! ✅';
    setTimeout(() => (status.textContent = ''), 1500);
  });
});
