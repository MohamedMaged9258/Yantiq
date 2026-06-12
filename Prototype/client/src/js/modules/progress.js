/**
 * progress.js — Progress tracking and rendering module
 */
import { progressAPI, levelsAPI } from '../utils/api.js';
import { getState } from '../utils/storage.js';
import { animateProgress, toast } from '../utils/animations.js';

// ─── Fetch full progress tree for active child ────────
export async function fetchProgressTree() {
  const child = getState('activeChild');
  if (!child?.id) return null;
  try {
    const res = await progressAPI.get(child.id);
    return res.data.data;
  } catch {
    return null;
  }
}

// ─── Fetch weekly activity data ───────────────────────
export async function fetchWeeklyActivity() {
  const child = getState('activeChild');
  if (!child?.id) return [];
  try {
    const res = await progressAPI.weeklyActivity(child.id);
    return res.data.data;
  } catch {
    return getMockWeeklyData();
  }
}

// ─── Render level cards ───────────────────────────────
export function renderLevelCards(tree, containerEl) {
  if (!containerEl || !tree) return;
  containerEl.innerHTML = '';

  tree.forEach(level => {
    const completedStages = level.stages.filter(s => s.progress?.completed).length;
    const totalStages     = level.stages.length;
    const pct             = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;
    const isActive        = level.stages.some(s => s.progress && !s.progress.completed);
    const isLocked        = completedStages === 0 && level.number > 1;

    const card = document.createElement('div');
    card.className = `level-card ${isLocked ? 'locked' : ''} mb-3`;
    if (!isLocked) card.style.cursor = 'pointer';

    card.innerHTML = `
      <div class="p-4 pb-0 flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center font-display text-white text-lg flex-shrink-0"
             style="background:${isLocked ? '#C5BDB0' : getLevelColor(level.number)}">
          ${isLocked ? '🏛️' : level.number}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-gray-900 text-base leading-tight">${level.nameEn} — <span class="font-arabic text-primary text-lg" style="direction:rtl">${level.nameAr}</span></p>
          <p class="text-xs font-bold mt-0.5 ${isActive ? 'text-primary' : isLocked ? 'text-gray-400' : 'text-gray-400'}">${isActive ? '✓ In Progress' : isLocked ? 'Complete previous level first' : `${completedStages}/${totalStages} stages done`}</p>
        </div>
        ${isActive ? `<div class="flex gap-0.5">${renderStars(level)}</div>` : ''}
      </div>
      ${isActive ? `
        <div class="px-4 pb-4 mt-2">
          <div class="flex justify-between text-xs font-bold text-gray-400 mb-1.5"><span>${completedStages} of ${totalStages} stages</span><span>${pct}%</span></div>
          <div class="progress-track h-2.5"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>` : ''}
    `;

    if (!isLocked) {
      card.onclick = () => { window.location.href = `./lesson.html?level=${level.id}`; };
    }
    containerEl.appendChild(card);
  });
}

// ─── Render weekly bar chart ──────────────────────────
export function renderWeeklyChart(data, containerEl, labelsEl) {
  if (!containerEl) return;
  const maxMins = Math.max(...data.map(d => d.totalMinutes), 1);

  containerEl.innerHTML = '';
  if (labelsEl) labelsEl.innerHTML = '';

  data.forEach(day => {
    const pct = Math.max(4, Math.round((day.totalMinutes / maxMins) * 100));
    const wrap = document.createElement('div');
    wrap.className = 'flex-1 flex flex-col items-center gap-1.5 group';

    const bar = document.createElement('div');
    bar.className = `w-full rounded-t-xl transition-all duration-700 ease-out relative min-h-1 ${day.isToday ? 'bg-primary' : 'bg-primary-100'}`;
    bar.style.height = '0%';

    const tip = document.createElement('div');
    tip.className = 'absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10';
    tip.textContent = `${day.totalMinutes}m`;
    bar.appendChild(tip);
    wrap.appendChild(bar);
    containerEl.appendChild(wrap);

    if (labelsEl) {
      const lbl = document.createElement('div');
      lbl.className = `flex-1 text-[10px] font-extrabold uppercase tracking-wider text-center ${day.isToday ? 'text-primary' : 'text-gray-300'}`;
      lbl.textContent = day.label;
      labelsEl.appendChild(lbl);
    }

    // Animate in
    setTimeout(() => { bar.style.height = `${pct}%`; }, 100 + data.indexOf(day) * 80);
  });
}

// ─── Update stage progress bar in UI ─────────────────
export function syncProgressBar(trackEl, pct, animated = true) {
  const fill = trackEl?.querySelector('.progress-fill');
  if (!fill) return;
  if (animated) {
    animateProgress(trackEl, 0, pct);
  } else {
    fill.style.width = `${pct}%`;
  }
}

// ─── Mock data for offline/demo ───────────────────────
export function getMockWeeklyData() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Today'];
  const mins  = [8, 14, 10, 18, 15, 11, 12];
  return days.map((label, i) => ({
    label,
    totalMinutes: mins[i],
    starsEarned:  Math.floor(mins[i] / 5),
    isToday:      i === 6,
    sessionCount: Math.floor(mins[i] / 8),
    avgAccuracy:  Math.round(80 + Math.random() * 15),
  }));
}

// ─── Helpers ──────────────────────────────────────────
function getLevelColor(n) {
  const colors = ['', '#0A5744', '#D4940E', '#0D7055', '#8B5CF6', '#D4940E'];
  return colors[n] || '#0A5744';
}

function renderStars(level) {
  const earned = level.stages.reduce((s, st) => s + (st.progress?.stars || 0), 0);
  const maxStars = level.stages.length * 3;
  const fullStars = Math.min(3, Math.round((earned / maxStars) * 3));
  return '🌟'.repeat(fullStars) + '<span class="text-gray-200">🌟</span>'.repeat(3 - fullStars);
}
