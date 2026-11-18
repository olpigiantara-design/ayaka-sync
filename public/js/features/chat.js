import { API } from '../api.js';

export function setupChat() {
  const container = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('btnSendChat');

  function append(role, text) {
    const b = document.createElement('div');
    b.className = `chat-bubble ${role}`;
    b.textContent = text;
    container.appendChild(b);
    container.scrollTop = container.scrollHeight;
    return b;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    append('user', text);
    input.value = '';
    btn.disabled = true;
    const loading = append('ai loading', 'Ayaka sedang mengetik...');

    try {
      const data = await API.chat(text);
      loading.remove();
      append('ai', data.reply);
    } catch (e) {
      loading.remove();
      append('ai', 'Maaf kak, Ayaka lagi ada kendala. Coba lagi atau hubungi admin ya.');
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  btn.addEventListener('click', send);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });
}