/**
 * app.js — Yantiq Application Entry Point
 *
 * Bootstraps the app, runs on every page load via
 * <script type="module" src="../js/app.js"> in each HTML page.
 */
import { guardAuth, getCurrentPage, scrollToTop } from './utils/router.js';
import { initRewards } from './modules/rewards.js';
import { toast } from './utils/animations.js';
import { startIdleWatcher } from './utils/storage.js';

// ─── Bootstrap ────────────────────────────────────────
async function bootstrap() {
  scrollToTop();
  guardAuth();

  const page = getCurrentPage();

  // Init rewards engine on child-facing pages
  const childPages = ['app', 'lesson', 'pronunciation', 'quiz', 'result', 'badges', 'word-lesson', 'dashboard', 'settings', 'placement'];
  if (childPages.includes(page)) {
    initRewards();
    startIdleWatcher(); // auto-logout after 30 min idle
  }

  // Page-specific initialisation
  switch (page) {
    case 'app':
      await initHomePage();
      break;
    case 'badges':
      await initBadgesPage();
      break;
    case 'dashboard':
      await initDashboardPage();
      break;
    default:
      break;
  }
}

// ─── Home page init ───────────────────────────────────
async function initHomePage() {
  const { fetchProgressTree, renderLevelCards } = await import('./modules/progress.js');
  const { claimDailyReward } = await import('./modules/rewards.js');
  const { fetchBadges, renderBadgeStrip } = await import('./modules/badges.js');
  const { startParticleBackground } = await import('./utils/animations.js');

  // Ambient particle background on header
  const header = document.querySelector('header');
  if (header) startParticleBackground(header, 5);

  // Load data in parallel
  const [progressData, badges] = await Promise.allSettled([
    fetchProgressTree(),
    fetchBadges(),
  ]);

  // Render level cards
  const levelContainer = document.getElementById('level-cards');
  if (levelContainer && progressData.status === 'fulfilled' && progressData.value?.tree) {
    renderLevelCards(progressData.value.tree, levelContainer);
  }

  // Render badge strip
  const badgeStrip = document.getElementById('badges-strip');
  if (badgeStrip && badges.status === 'fulfilled') {
    renderBadgeStrip(badges.value, badgeStrip, 4);
  }

  // Daily reward (once per day)
  const lastClaim = localStorage.getItem('last_daily_claim');
  const today     = new Date().toISOString().slice(0, 10);
  if (lastClaim !== today) {
    setTimeout(() => claimDailyReward(), 2000);
  } else {
    setTimeout(() => toast('Welcome back! 🌟', 'success', 2500), 800);
  }
}

// ─── Badges page init ─────────────────────────────────
async function initBadgesPage() {
  const { fetchBadges, renderBadgeGrid, showBadgeDetail } = await import('./modules/badges.js');
  window.showBadgeDetail = showBadgeDetail; // expose for inline onclick

  const badges     = await fetchBadges();
  const earnedGrid = document.getElementById('earned-grid');
  const lockedGrid = document.getElementById('locked-grid');
  renderBadgeGrid(badges, earnedGrid, lockedGrid);
}

// ─── Dashboard page init ──────────────────────────────
async function initDashboardPage() {
  const { fetchDashboard, renderDashboard, exportReport } = await import('./modules/dashboard.js');
  window.exportReport = () => exportReport('Layla');

  const data = await fetchDashboard();
  const root = document.getElementById('dashboard-root') || document.body;
  renderDashboard(data, root);
}

// ─── Global error handler (user-friendly) ─────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (e.reason?.response?.status === 401) {
    // Token expired — will be handled by API interceptor
    return;
  }
  if (e.reason?.message?.includes('NetworkError') || e.reason?.message?.includes('Failed to fetch')) {
    toast('No internet connection. Some features may not work.', 'error', 4000);
  }
});

// ─── Service Worker registration (offline support) ────
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(console.error);
}

// ─── Run ──────────────────────────────────────────────
bootstrap();
