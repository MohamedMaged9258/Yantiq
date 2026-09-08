/**
 * dashboard.js — Parent dashboard data and rendering module
 */
import { dashboardAPI } from '../utils/api.js';
import { getState } from '../utils/storage.js';
import { renderWeeklyChart, getMockWeeklyData } from './progress.js';
import { toast } from '../utils/animations.js';

// ─── Fetch full dashboard payload ─────────────────────
export async function fetchDashboard() {
  const child = getState('activeChild');
  if (!child?.id) return getMockDashboard();
  try {
    const res = await dashboardAPI.get(child.id);
    return res.data.data;
  } catch {
    return getMockDashboard();
  }
}

// ─── Render dashboard into DOM ────────────────────────
export function renderDashboard(data, rootEl) {
  if (!rootEl || !data) return;

  const { child, stats, weeklyActivity, recentSessions, earnedBadges, aiInsight } = data;

  // ── Child header
  const avatarEl = rootEl.querySelector('[data-dash-avatar]');
  const nameEl   = rootEl.querySelector('[data-dash-name]');
  const levelEl  = rootEl.querySelector('[data-dash-level]');
  const starsEl  = rootEl.querySelector('[data-dash-stars]');
  if (avatarEl) avatarEl.textContent = child.avatar;
  if (nameEl)   nameEl.textContent   = `${child.nickname || child.name}, age ${child.age}`;
  if (levelEl)  levelEl.textContent  = `Level 1 · ${child.arabicExposure} · Stage 3/5`;
  if (starsEl)  starsEl.textContent  = `🌟 ${child.totalStars}`;

  // ── Stats grid
  const metricEls = rootEl.querySelectorAll('[data-metric]');
  metricEls.forEach(el => {
    const key = el.dataset.metric;
    const val = {
      streak:   `${child.streakDays} 🔥`,
      lessons:  child.totalLessons,
      accuracy: `${stats.avgAccuracy}%`,
      minutes:  `${stats.weeklyMinutes}m`,
    }[key];
    if (val !== undefined) el.textContent = val;
  });

  // Accuracy trend badge
  const trendEl = rootEl.querySelector('[data-trend]');
  if (trendEl && stats.accuracyTrend !== undefined) {
    const sign  = stats.accuracyTrend >= 0 ? '+' : '';
    const color = stats.accuracyTrend >= 0 ? 'text-primary' : 'text-coral';
    trendEl.textContent  = `${sign}${stats.accuracyTrend}% vs last week`;
    trendEl.className    = `${trendEl.className} ${color}`;
  }

  // ── Weekly activity chart
  const chartEl  = rootEl.querySelector('[data-chart-bars]');
  const labelsEl = rootEl.querySelector('[data-chart-labels]');
  if (chartEl) renderWeeklyChart(weeklyActivity, chartEl, labelsEl);

  // ── Session log
  const sessionLog = rootEl.querySelector('[data-session-log]');
  if (sessionLog) renderSessionLog(recentSessions, sessionLog);

  // ── Weekly goal bar
  const goalBar = rootEl.querySelector('[data-goal-bar]');
  const goalPct = rootEl.querySelector('[data-goal-pct]');
  if (goalBar)  { goalBar.style.transition = 'width 1s ease-out'; goalBar.style.width = `${stats.weeklyGoalPct}%`; }
  if (goalPct)  goalPct.textContent = `${stats.weeklyMinutes} / 45 min`;

  // ── AI insight
  const insightEl = rootEl.querySelector('[data-ai-insight]');
  if (insightEl && aiInsight) {
    insightEl.querySelector('[data-insight-title]').textContent = aiInsight.title;
    insightEl.querySelector('[data-insight-text]').textContent  = aiInsight.text;
  }
}

// ─── Render session log rows ──────────────────────────
function renderSessionLog(sessions, containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = sessions.map(s => {
    const letter  = s.lesson?.letterAr || s.lesson?.wordEn?.[0] || '?';
    const title   = s.lesson?.letterAr
      ? `Letter ${s.lesson.letterAr} — ${s.lesson.letterNameEn || 'Pronunciation'}`
      : s.lesson?.wordEn ? `Word: ${s.lesson.wordEn}` : 'Lesson';
    const time    = formatTime(s.startedAt);
    const dur     = s.durationSeconds ? `${Math.round(s.durationSeconds / 60)}m` : '';
    const acc     = s.score != null ? `${Math.round(s.score)}%` : '–';
    const accColor = s.score >= 90 ? 'text-primary' : s.score >= 70 ? 'text-gold' : 'text-coral';
    return `
      <div class="flex items-center gap-3 py-3 border-b border-cream last:border-0">
        <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center font-arabic text-primary text-base rtl-text flex-shrink-0" style="direction:rtl">${letter}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-900 text-sm leading-tight truncate">${title}</p>
          <p class="text-gray-400 text-xs mt-0.5">${time}${dur ? ' · ' + dur : ''}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="font-display ${accColor} text-base">${acc}</p>
          <p class="text-[10px] text-gray-300 font-bold">Accuracy</p>
        </div>
      </div>`;
  }).join('');
}

// ─── Export report (opens print dialog) ──────────────
export function exportReport(childName) {
  const css = `
    body { font-family: 'Nunito', sans-serif; padding: 40px; color: #172820; }
    h1 { color: #0A5744; } table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #EDE7D9; padding: 10px; text-align: left; }
    th { background: #E6F5EF; color: #0A5744; }
  `;
  const win = window.open('', '_blank');
  if (!win) { toast('Pop-up blocked. Allow pop-ups to export.', 'error'); return; }
  win.document.write(`
    <html><head><title>Yantiq Progress Report — ${childName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>${css}</style></head>
    <body>
      <h1>ينطق Yantiq — Progress Report</h1>
      <h2>${childName}'s Learning Summary</h2>
      <p>Generated: ${new Date().toLocaleDateString('en-GB', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      <h3>Key Stats</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Current Level</td><td>Level 1 — Letters</td></tr>
        <tr><td>Total Stars Earned</td><td>🌟 47</td></tr>
        <tr><td>Total Lessons Completed</td><td>12</td></tr>
        <tr><td>Average Accuracy</td><td>94%</td></tr>
        <tr><td>Current Streak</td><td>🔥 7 days</td></tr>
        <tr><td>Time Practised This Week</td><td>41 minutes</td></tr>
        <tr><td>Badges Earned</td><td>3 of 10</td></tr>
      </table>
      <h3>Recent Sessions</h3>
      <table>
        <tr><th>Lesson</th><th>Date</th><th>Accuracy</th><th>Duration</th></tr>
        <tr><td>Letter بَ — Pronunciation</td><td>Today</td><td>94%</td><td>3m 12s</td></tr>
        <tr><td>Stage 3 — Quiz</td><td>Today</td><td>100%</td><td>2m 40s</td></tr>
        <tr><td>Letter حَ — Pronunciation</td><td>Yesterday</td><td>88%</td><td>4m 05s</td></tr>
      </table>
      <p style="color:#86A09A;font-size:12px;margin-top:40px">Generated by Yantiq AI Learning Platform — yantiq.app</p>
    </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ─── Helpers ──────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 86400000) return 'Today';
  if (diffMs < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

// ─── Mock data ────────────────────────────────────────
export function getMockDashboard() {
  return {
    child: { id:'demo', name:'Layla', nickname:'Layla', age:5, avatar:'🦅', arabicExposure:'SOME', totalStars:47, totalLessons:12, streakDays:7, longestStreak:7 },
    stats: { avgAccuracy:94, accuracyTrend:4, totalSessions:12, weeklyMinutes:41, weeklyGoalMinutes:45, weeklyGoalPct:91 },
    weeklyActivity: getMockWeeklyData(),
    recentSessions: [
      { lesson:{ letterAr:'بَ', letterNameEn:'Ba' }, startedAt: new Date().toISOString(), durationSeconds:192, score:94, completed:true },
      { lesson:{ letterAr:'خَ', letterNameEn:'Kha' }, startedAt: new Date().toISOString(), durationSeconds:160, score:100, completed:true },
      { lesson:{ letterAr:'حَ', letterNameEn:'Ha' }, startedAt: new Date(Date.now()-86400000).toISOString(), durationSeconds:245, score:88, completed:true },
    ],
    earnedBadges: [
      { name:'First Steps', icon:'🌱', earnedAt: new Date(Date.now()-864e6).toISOString() },
      { name:'Week Warrior', icon:'🔥', earnedAt: new Date(Date.now()-86400000).toISOString() },
      { name:'Clear Speaker', icon:'🏅', earnedAt: new Date().toISOString() },
    ],
    aiInsight: { type:'celebration', title:'Outstanding Progress!', text:'Layla is achieving 94% average accuracy — exceptional! She\'s ready to advance to the next stage soon. Keep up the daily practice!' },
  };
}
