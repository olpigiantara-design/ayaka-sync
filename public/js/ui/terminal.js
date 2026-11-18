const box = () => document.getElementById('terminal');
const inner = () => document.getElementById('terminalContent');

export function log(msg, type = 'info') {
  const b = box(), c = inner();
  if (!b || !c) return;
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const cls = { success: 'log-success', error: 'log-error', warn: 'log-warn' }[type] || 'log-info';
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-time">[${time}]</span> <span class="${cls}">${msg}</span>`;
  c.appendChild(line);
  b.scrollTop = b.scrollHeight;
}