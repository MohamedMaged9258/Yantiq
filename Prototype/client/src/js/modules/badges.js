/**
 * badges.js — Badge display and unlock module
 */
import { badgesAPI } from '../utils/api.js';
import { getState } from '../utils/storage.js';
import { badgeUnlock, confettiCorrect } from '../utils/animations.js';

// ─── Fetch all badges for active child ───────────────
export async function fetchBadges() {
  const child = getState('activeChild');
  if (!child?.id) return getMockBadges();
  try {
    const res = await badgesAPI.get(child.id);
    return res.data.data;
  } catch {
    return getMockBadges();
  }
}

// ─── Render badge grid ────────────────────────────────
export function renderBadgeGrid(badges, earnedEl, lockedEl) {
  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  if (earnedEl) {
    earnedEl.innerHTML = earned.length === 0
      ? '<p class="col-span-2 text-center text-gray-400 font-semibold text-sm py-4">No badges yet — keep learning! 🌱</p>'
      : earned.map(b => buildBadgeCard(b, true)).join('');
  }

  if (lockedEl) {
    lockedEl.innerHTML = locked.map(b => buildBadgeCard(b, false)).join('');
  }
}

// ─── Render compact badge strip (home page) ───────────
export function renderBadgeStrip(badges, containerEl, max = 4) {
  if (!containerEl) return;
  const earned = badges.filter(b => b.earned).slice(0, max);
  const remaining = max - earned.length;

  containerEl.innerHTML = [
    ...earned.map(b => `
      <div class="flex-shrink-0 w-20 h-20 rounded-3xl bg-gold-50 border border-gold/20
                  flex flex-col items-center justify-center gap-1 cursor-pointer
                  hover:shadow-glow-gold hover:-translate-y-1 transition-all duration-200"
           onclick="showBadgeDetail('${b.name}','${b.description}','${b.earnedAt ? new Date(b.earnedAt).toLocaleDateString() : 'Recent'}','${b.icon}')">
        <span class="text-3xl">${b.icon}</span>
        <span class="text-[10px] font-bold text-gold leading-tight text-center px-1 truncate w-full text-center">${b.name}</span>
      </div>`),
    ...Array(remaining).fill(`
      <div class="flex-shrink-0 w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100
                  flex flex-col items-center justify-center gap-1 opacity-50">
        <span class="text-3xl grayscale">🏅</span>
        <span class="text-[10px] font-bold text-gray-400">🏛️ Locked</span>
      </div>`),
  ].join('');
}

// ─── Show badge detail modal ──────────────────────────
export function showBadgeDetail(name, description, date, icon) {
  let modal = document.getElementById('badge-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'badge-modal';
    modal.className = 'hidden reward-popup';
    modal.innerHTML = `
      <div class="reward-card">
        <div id="bm-icon" class="text-6xl mb-4" style="animation:celebrate 0.5s ease both"></div>
        <h3 id="bm-name" class="font-display text-gray-900 text-2xl mb-2"></h3>
        <p id="bm-desc" class="text-gray-500 text-sm leading-relaxed mb-3"></p>
        <p id="bm-date" class="text-primary font-extrabold text-xs uppercase tracking-wider mb-6"></p>
        <button onclick="document.getElementById('badge-modal').classList.add('hidden')"
                class="btn btn-primary btn-md w-full font-display text-lg">Close ✨</button>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
    document.body.appendChild(modal);
  }

  document.getElementById('bm-icon').textContent = icon;
  document.getElementById('bm-name').textContent = name;
  document.getElementById('bm-desc').textContent = description;
  document.getElementById('bm-date').textContent = `Earned: ${date}`;
  modal.classList.remove('hidden');
  confettiCorrect(modal);
}

// ─── Check for newly earned badges after a session ───
export async function checkNewBadges(previousBadges, currentBadges) {
  const prevEarned = new Set(previousBadges.filter(b => b.earned).map(b => b.id || b.name));
  const newlyEarned = currentBadges.filter(b => b.earned && !prevEarned.has(b.id || b.name));
  for (const badge of newlyEarned) {
    await badgeUnlock(badge);
  }
  return newlyEarned;
}

// ─── Mock data for demo/offline ───────────────────────
export function getMockBadges() {
  return [
    { name:'First Steps',   icon:'🌱', description:'Completed your first lesson',               category:'COMPLETION', earned:true,  earnedAt:new Date(Date.now()-864e6).toISOString(),  requirement:{type:'first_lesson'} },
    { name:'Week Warrior',  icon:'🔥', description:'Maintained a 7-day learning streak',        category:'STREAK',     earned:true,  earnedAt:new Date(Date.now()-86400000).toISOString(), requirement:{type:'streak',value:7} },
    { name:'Clear Speaker', icon:'🏅', description:'Achieved 90%+ pronunciation accuracy',      category:'SPEAKING',   earned:true,  earnedAt:new Date().toISOString(),                   requirement:{type:'accuracy',minPct:90} },
    { name:'Sharpshooter',  icon:'🎯', description:'Scored 100% on any quiz',                   category:'ACCURACY',   earned:false, earnedAt:null, progress:'0/1',                        requirement:{type:'perfect_quiz'} },
    { name:'Night Owl',     icon:'🌙', description:'Practice after 8pm for 5 sessions',         category:'SPECIAL',    earned:false, earnedAt:null, progress:'2/5',                        requirement:{type:'night_sessions',value:5} },
    { name:'Bookworm',      icon:'📚', description:'Complete all of Level 2 — Words',           category:'COMPLETION', earned:false, earnedAt:null, progress:'0/1',                        requirement:{type:'level_complete'} },
    { name:'Star Collector',icon:'🌟', description:'Earn 100 total stars',                      category:'SPECIAL',    earned:false, earnedAt:null, progress:'47/100',                     requirement:{type:'stars',value:100} },
    { name:'Consistent',    icon:'🌟', description:'30-day learning streak',                    category:'STREAK',     earned:false, earnedAt:null, progress:'7/30',                       requirement:{type:'streak',value:30} },
    { name:'Rocket',        icon:'🚀', description:'Complete all 5 learning levels',            category:'COMPLETION', earned:false, earnedAt:null, progress:'1/5',                        requirement:{type:'lessons_completed'} },
    { name:'Arabic Master', icon:'👑', description:'95%+ accuracy across 20+ lessons',          category:'ACCURACY',   earned:false, earnedAt:null, progress:'???',                        requirement:{type:'accuracy'} },
  ];
}

// ─── Build badge card HTML ────────────────────────────
function buildBadgeCard(badge, earned) {
  const colors = { COMPLETION:'bg-primary-50', STREAK:'bg-coral-50', SPEAKING:'bg-gold-50', ACCURACY:'bg-magic-pale', SPECIAL:'bg-sky-50' };
  const bg = colors[badge.category] || 'bg-gray-50';
  const progressBar = !earned && badge.progress && badge.progress.includes('/') ? `
    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
      <div class="bg-primary/50 h-1.5 rounded-full transition-all" style="width:${getProgressPct(badge.progress)}%"></div>
    </div>
    <p class="text-[10px] font-bold text-gray-400 mt-1">${badge.progress}</p>` : '';

  return `
    <div class="badge-card ${earned ? 'cursor-pointer' : 'locked'} animate-slide-up"
         ${earned ? `onclick="showBadgeDetail('${badge.name}','${badge.description}','${badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recent'}','${badge.icon}')"` : ''}>
      <div class="w-16 h-16 rounded-3xl ${bg} mx-auto mb-3 flex items-center justify-center text-4xl border border-black/5 ${earned ? '' : 'grayscale opacity-70'}"
           ${earned ? 'style="animation:float 3s ease-in-out infinite"' : ''}>
        ${badge.icon}
      </div>
      <p class="font-display text-gray-900 text-sm mb-1 truncate">${badge.name}</p>
      <p class="text-gray-400 text-xs leading-tight line-clamp-2">${badge.description}</p>
      ${earned
        ? `<p class="text-primary font-extrabold text-[10px] mt-2">${badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recent'}</p>`
        : progressBar || '<p class="text-gray-300 font-bold text-[10px] mt-2">🏛️ Locked</p>'}
    </div>`;
}

function getProgressPct(progress) {
  if (!progress?.includes('/')) return 0;
  const [a, b] = progress.split('/').map(Number);
  return b ? Math.round((a / b) * 100) : 0;
}
