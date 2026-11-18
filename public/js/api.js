import { CONFIG } from './config.js';

export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}
export function setToken(t) {
  localStorage.setItem(CONFIG.TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(CONFIG.API_BASE + path, { ...opts, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const API = {
  register: (email, password) => req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/auth/me'),

  getPlan: () => req('/plans'),
  activatePlan: (plan) => req('/plans/activate', { method: 'POST', body: JSON.stringify({ plan }) }),
  consumeLimit: () => req('/plans/consume', { method: 'POST' }),
  resetStats: () => req('/plans/reset', { method: 'POST' }),

  sendMagicLink: (email) => req('/activation/send-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyActivation: (email, link, orderId) => req('/activation/verify', { method: 'POST', body: JSON.stringify({ email, link, orderId }) }),

  getHistory: () => req('/history'),
  bulkGenerate: (amount) => req('/bulk/generate', { method: 'POST', body: JSON.stringify({ amount }) }),
  chat: (text) => req('/chat', { method: 'POST', body: JSON.stringify({ text }) })
};