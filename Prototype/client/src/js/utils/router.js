/**
 * router.js — Lightweight client-side router
 * Handles URL params, navigation guards, page transitions
 */
// storage import removed — guardAuth is disabled in prototype mode

const PROTECTED_PAGES = ['app', 'lesson', 'pronunciation', 'quiz', 'result', 'badges', 'dashboard', 'word-lesson', 'placement', 'settings'];
const AUTH_PAGES      = ['login', 'register'];

// ─── Get URL query params ─────────────────────────────
export function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

export function getParam(key, defaultVal = null) {
  return new URLSearchParams(window.location.search).get(key) ?? defaultVal;
}

// ─── Navigate with optional transition ───────────────
export function navigate(path, params = {}) {
  const query = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  window.location.href = path + query;
}

// ─── Push a param without navigation ─────────────────
export function setParam(key, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url.toString());
}

// ─── Auth guard - call at top of protected pages ─────
export function guardAuth(redirectTo = '/src/pages/login.html') {
  // Prototype mode: no auth enforcement — all pages are accessible
  return true;
}

// ─── Get current page name from URL ──────────────────
export function getCurrentPage() {
  const path = window.location.pathname;
  const name = path.split('/').pop()?.replace('.html', '') || 'index';
  return name;
}

// ─── Back navigation ──────────────────────────────────
export function goBack(fallback = '/src/pages/app.html') {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate(fallback);
  }
}

// ─── Build page URL with params ───────────────────────
export function pageUrl(page, params = {}) {
  const base = `/src/pages/${page}.html`;
  const query = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return base + query;
}

// ─── Scroll to top on page load ───────────────────────
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── Page init helper - run guards + setup ────────────
export function initPage(opts = {}) {
  const { requireAuth = false, onReady = null, scrollTop = true } = opts;
  if (scrollTop) scrollToTop();
  if (requireAuth) guardAuth();
  if (onReady) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }
}
