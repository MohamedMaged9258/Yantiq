/**
 * rewards.js — Yantiq Rewards & Engagement Engine
 *
 * Manages XP, levels, streaks, badges, daily challenges,
 * and all reward triggers that keep children engaged.
 */
import { storage } from '../utils/storage.js';
import { progressAPI, badgesAPI } from '../utils/api.js';
import {
  badgeUnlock, levelUp, streakMilestone, perfectScore,
  flyStars, showXPGain, confettiBig, confettiCorrect,
  spawnEmojis, toast, openChest,
} from '../utils/animations.js';

// ─── XP thresholds per level ──────────────────────────
const LEVEL_XP = [0, 100, 250, 500, 900, 1500];

// ─── Local state ──────────────────────────────────────
let state = storage.get('rewards_state') || {
  xp: 0,
  level: 1,
  stars: 0,
  streak: 0,
  lastPlayDate: null,
  dailyChallengeComplete: false,
  pendingBadges: [],
};

function persist() { storage.set('rewards_state', state); }

// ─── 1. Award XP and check level-up ──────────────────
export async function awardXP(amount, sourceEl = null) {
  const oldLevel = getLevel(state.xp);
  state.xp += amount;
  persist();

  if (sourceEl) showXPGain(amount, sourceEl);

  const newLevel = getLevel(state.xp);
  if (newLevel > oldLevel) {
    const levelNames = ['', 'Letters', 'Words', 'Short Sentences', 'Reading', 'Advanced'];
    await levelUp(levelNames[newLevel] || `Level ${newLevel}`);
  }

  updateXPBar();
  return { xp: state.xp, level: newLevel, didLevelUp: newLevel > oldLevel };
}

export function getLevel(xp) {
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) return i;
  }
  return 1;
}

export function getLevelProgress(xp) {
  const level = getLevel(xp);
  const current = LEVEL_XP[level] ?? LEVEL_XP[LEVEL_XP.length - 1];
  const next    = LEVEL_XP[level + 1];
  if (!next) return 100;
  return Math.round(((xp - current) / (next - current)) * 100);
}

// ─── 2. Award stars ───────────────────────────────────
export async function awardStars(count, fromEl, toEl) {
  state.stars += count;
  persist();
  if (fromEl && toEl) flyStars(fromEl, toEl, count);
  updateStarCounter();
  return state.stars;
}

// ─── 3. Correct answer handler ────────────────────────
export async function onCorrectAnswer({ xp = 10, stars = 1, sourceEl = null, toEl = null } = {}) {
  confettiCorrect(sourceEl);
  spawnEmojis(['⭐', '✨', '🌟'], sourceEl, 3);
  await awardXP(xp, sourceEl);
  await awardStars(stars, sourceEl, toEl);
  checkMilestones();
}

// ─── 4. Wrong answer handler ──────────────────────────
export function onWrongAnswer(sourceEl = null) {
  spawnEmojis(['💪', '🔄'], sourceEl, 1);
  // Lives decrement managed by quiz module
}

// ─── 5. Complete a lesson ─────────────────────────────
export async function onLessonComplete({ score, stars: starsEarned, lessonId, childId }) {
  const xpGain = starsEarned === 3 ? 30 : starsEarned === 2 ? 20 : 10;
  await awardXP(xpGain);
  state.stars += starsEarned;
  persist();

  if (score === 100) {
    perfectScore();
    toast('Perfect score! 🏆 Incredible!', 'success');
  } else if (score >= 90) {
    confettiBig();
    toast(`Amazing! ${score}% accuracy ⭐`, 'success');
  } else if (score >= 70) {
    confettiCorrect();
    toast(`Well done! ${score}% — keep it up!`, 'success');
  }

  // Log to server
  try {
    if (childId && lessonId) {
      const { newBadges } = (await progressAPI.logSession(childId, {
        lessonId, score, accuracyPct: score, starsEarned, xpEarned: xpGain, completed: true,
      })).data?.data ?? {};

      if (newBadges?.length) {
        for (const badge of newBadges) {
          await badgeUnlock(badge);
        }
      }
    }
  } catch { /* offline — continue */ }
}

// ─── 6. Update streak ─────────────────────────────────
export async function checkAndUpdateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastPlayDate === today) return state.streak;

  if (state.lastPlayDate === yesterday) {
    state.streak += 1;
  } else if (state.lastPlayDate !== today) {
    state.streak = 1;
  }

  state.lastPlayDate = today;
  persist();
  updateStreakDisplay();

  // Milestone celebrations
  if ([3, 7, 14, 30, 60, 100].includes(state.streak)) {
    await streakMilestone(state.streak);
  }

  return state.streak;
}

// ─── 7. Daily challenge reward ────────────────────────
export async function claimDailyReward() {
  const today = new Date().toISOString().slice(0, 10);
  const lastClaim = storage.get('last_daily_claim');
  if (lastClaim === today) return null;

  storage.set('last_daily_claim', today);
  state.stars += 5;
  state.xp    += 25;
  persist();

  return openChest({
    emoji: '⭐',
    title: '+5 Stars + 25 XP!',
    description: `Day ${state.streak || 1} reward — you came back! 🔥`,
  });
}

// ─── 8. Check milestone thresholds ────────────────────
function checkMilestones() {
  const starMilestones = [10, 25, 50, 100, 250, 500];
  for (const m of starMilestones) {
    const key = `star_milestone_${m}`;
    if (state.stars >= m && !storage.get(key)) {
      storage.set(key, true);
      toast(`⭐ ${m} Stars milestone reached! 🎉`, 'success', 3000);
      break;
    }
  }
}

// ─── 9. DOM sync helpers ──────────────────────────────
export function updateXPBar() {
  const pct = getLevelProgress(state.xp);
  const fills = document.querySelectorAll('.xp-bar-fill, #xp-fill');
  fills.forEach(el => { el.style.transition = 'width 0.8s ease-out'; el.style.width = `${pct}%`; });
  const labels = document.querySelectorAll('#xp-label');
  labels.forEach(el => { el.textContent = `${pct}%`; });
}

export function updateStarCounter() {
  document.querySelectorAll('#stat-stars, .star-counter').forEach(el => {
    el.textContent = `⭐ ${state.stars}`;
    el.classList.add('animate-star-pop');
    setTimeout(() => el.classList.remove('animate-star-pop'), 600);
  });
}

export function updateStreakDisplay() {
  document.querySelectorAll('#streak-num, .streak-num').forEach(el => {
    el.textContent = state.streak;
  });
}

// ─── 10. Initialise on page load ──────────────────────
export function initRewards() {
  updateXPBar();
  updateStarCounter();
  updateStreakDisplay();
  checkAndUpdateStreak();
}

export function getRewardState() { return { ...state }; }
