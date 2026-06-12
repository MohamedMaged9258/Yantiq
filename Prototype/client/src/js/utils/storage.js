// ─── Typed localStorage wrapper ──────────────────────
export const storage = {
  get(key)        { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val)   { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key)     { localStorage.removeItem(key); },
  clear()         { ['accessToken','currentUser','activeChild'].forEach(k => localStorage.removeItem(k)); },
};

// ─── Global app state (simple reactive store) ─────────
const listeners = {};
const state = {
  user:         storage.get('currentUser') ?? null,
  activeChild:  storage.get('activeChild') ?? null,
  accessToken:  storage.get('accessToken') ?? null,
  isLoading:    false,
  currentPage:  null,
};

export function getState(key) {
  return key ? state[key] : { ...state };
}

export function setState(key, value) {
  state[key] = value;
  // Persist select keys
  if (['currentUser','activeChild','accessToken'].includes(key)) {
    value ? storage.set(key, value) : storage.remove(key);
  }
  // Notify listeners
  (listeners[key] || []).forEach(fn => fn(value));
  (listeners['*'] || []).forEach(fn => fn({ key, value }));
}

export function onStateChange(key, fn) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(fn);
  return () => { listeners[key] = listeners[key].filter(f => f !== fn); };
}

export function isAuthenticated() {
  return !!state.accessToken && !!state.user;
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/src/pages/login.html';
    return false;
  }
  return true;
}

// ─── Inactivity / auto-logout ─────────────────────────
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let idleTimer = null;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const token = storage.get('accessToken');
    if (!token) return;
    // Clear auth state and redirect to login
    setState('accessToken', null);
    setState('currentUser', null);
    setState('activeChild',  null);
    // Show message on login page
    sessionStorage.setItem('session_expired', '1');
    window.location.href = '/src/pages/login.html';
  }, IDLE_TIMEOUT_MS);
}

export function startIdleWatcher() {
  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach(e => document.addEventListener(e, resetIdleTimer, { passive: true }));
  resetIdleTimer(); // start the timer
}

export function stopIdleWatcher() {
  clearTimeout(idleTimer);
  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach(e => document.removeEventListener(e, resetIdleTimer));
}
