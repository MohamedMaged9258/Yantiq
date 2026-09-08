/**
 * animations.js — Yantiq Child-Friendly Animation Engine
 * Handles all celebrations, rewards, confetti, and visual feedback
 */
import confetti from 'canvas-confetti';

// ─── Colour palette ───────────────────────────────────
const COLORS = {
  primary: '#0A5744', teal: '#14A878', gold: '#D4940E', goldLight: '#F2BE3A',
  coral: '#E8603A', magic: '#8B5CF6', sky: '#0EA5E9', star: '#FFB800',
  white: '#FFFFFF', cream: '#FEF9F0',
};

const CONFETTI_COLORS = [COLORS.gold, COLORS.teal, COLORS.coral, COLORS.magic, COLORS.star, COLORS.white, '#FCD34D', '#86EFAC'];
const ISLAMIC_STAR_EMOJIS = ['✦', '✧', '⭐', '🌟', '💫', '✨'];

// ─── Utility ──────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

function createEl(tag, styles = {}, text = '') {
  const el = document.createElement(tag);
  Object.assign(el.style, styles);
  if (text) el.textContent = text;
  return el;
}

// ─── 1. CONFETTI BURST ─────────────────────────────────
export function confettiBurst(options = {}) {
  const defaults = {
    particleCount: 80,
    spread: 100,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.5 },
    colors: CONFETTI_COLORS,
    ticks: 200,
    gravity: 0.9,
    scalar: 1.1,
    shapes: ['circle', 'square'],
    zIndex: 9999,
  };
  confetti({ ...defaults, ...options });
}

// Stars shooting from sides
export function confettiBig() {
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ angle: 60, spread: 55, particleCount: 5, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS, zIndex: 9999 });
    confetti({ angle: 120, spread: 55, particleCount: 5, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS, zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// Full screen celebration
export function confettiFull() {
  confetti({ particleCount: 150, spread: 160, origin: { y: 0.4 }, colors: CONFETTI_COLORS, startVelocity: 45, ticks: 300, zIndex: 9999 });
  setTimeout(() => confettiBig(), 400);
}

// Gentle sparkle (correct answer)
export function confettiCorrect(originEl) {
  const rect = originEl?.getBoundingClientRect?.();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
  confetti({ particleCount: 40, spread: 70, origin: { x, y }, colors: [COLORS.gold, COLORS.teal, COLORS.star], startVelocity: 25, ticks: 150, zIndex: 9999 });
}

// ─── 2. FLYING STARS (score counter) ──────────────────
export function flyStars(fromEl, toEl, count = 3) {
  if (!fromEl || !toEl) return;
  const from = fromEl.getBoundingClientRect();
  const to = toEl.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const star = createEl('div', {
        position: 'fixed',
        left: `${from.left + from.width / 2}px`,
        top: `${from.top + from.height / 2}px`,
        fontSize: '28px',
        zIndex: '9999',
        pointerEvents: 'none',
        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: 'scale(1.4)',
        filter: 'drop-shadow(0 2px 6px rgba(255,184,0,0.6))',
      }, '⭐');
      document.body.appendChild(star);

      setTimeout(() => {
        star.style.left = `${to.left + to.width / 2}px`;
        star.style.top = `${to.top + to.height / 2}px`;
        star.style.transform = 'scale(0.6)';
        star.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        star.remove();
        // Pulse the target counter
        toEl.classList.add('animate-star-pop');
        setTimeout(() => toEl.classList.remove('animate-star-pop'), 600);
      }, 800);
    }, i * 120);
  }
}

// ─── 3. SCREEN FLASH (correct / wrong) ────────────────
export function flashCorrect() {
  const overlay = createEl('div', {
    position: 'fixed', inset: '0',
    background: 'rgba(20,168,120,0.15)',
    zIndex: '9990', pointerEvents: 'none',
    borderRadius: '0',
    animation: 'fadeIn 0.1s ease, slideUp 0.4s 0.2s ease reverse both',
  });
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 600);
}

export function flashWrong() {
  const overlay = createEl('div', {
    position: 'fixed', inset: '0',
    background: 'rgba(232,96,58,0.15)',
    zIndex: '9990', pointerEvents: 'none',
    animation: 'fadeIn 0.1s ease',
  });
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 400);
}

// ─── 4. BADGE UNLOCK CEREMONY ─────────────────────────
export function badgeUnlock(badge) {
  return new Promise((resolve) => {
    const overlay = createEl('div', {
      position: 'fixed', inset: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      zIndex: '9995',
      animation: 'fadeIn 0.3s ease both',
    });

    overlay.innerHTML = `
      <div style="
        background: white; border-radius: 40px; padding: 48px 40px;
        text-align: center; max-width: 320px; width: 90%;
        box-shadow: 0 24px 80px rgba(0,0,0,0.3);
        animation: badgeReveal 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both;
      ">
        <div style="font-size: 14px; font-weight: 800; color: #D4940E; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">
          🎉 New Badge Unlocked!
        </div>
        <div style="
          width: 100px; height: 100px; border-radius: 30px;
          background: linear-gradient(135deg, #FEF7E6, #FDEFC8);
          display: flex; align-items: center; justify-content: center;
          font-size: 52px; margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(212,148,14,0.3);
          animation: celebrate 0.6s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
          border: 3px solid rgba(212,148,14,0.2);
        ">${badge.icon || '🏅'}</div>
        <div style="font-family: 'Fredoka One', cursive; font-size: 24px; color: #172820; margin-bottom: 8px;">
          ${badge.name}
        </div>
        <div style="font-size: 14px; color: #86A09A; margin-bottom: 28px; line-height: 1.5;">
          ${badge.description}
        </div>
        <button id="badge-dismiss" style="
          background: #0A5744; color: white; border: none; border-radius: 999px;
          padding: 14px 32px; font-family: 'Fredoka One', cursive; font-size: 17px;
          cursor: pointer; box-shadow: 0 6px 16px rgba(10,87,68,0.3);
          transition: transform 0.15s;
        ">Awesome! 🌟</button>
      </div>
    `;

    document.body.appendChild(overlay);
    confettiBig();

    overlay.querySelector('#badge-dismiss').addEventListener('click', () => {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => { overlay.remove(); resolve(); }, 200);
    });

    // Auto dismiss after 5 seconds
    setTimeout(() => { if (overlay.parentNode) { overlay.remove(); resolve(); } }, 5000);
  });
}

// ─── 5. LEVEL UP CEREMONY ─────────────────────────────
export function levelUp(levelName) {
  return new Promise((resolve) => {
    const overlay = createEl('div', {
      position: 'fixed', inset: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      background: 'linear-gradient(135deg, rgba(10,87,68,0.95), rgba(13,112,85,0.95))',
      zIndex: '9996', backdropFilter: 'blur(8px)',
    });

    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 80px; animation: levelUp 0.8s cubic-bezier(0.175,0.885,0.32,1.275) both; display: block; margin-bottom: 8px;">🚀</div>
        <div style="font-family:'Fredoka One',cursive; font-size:18px; color:rgba(255,255,255,0.7); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px; animation: fadeIn 0.5s 0.4s ease both; opacity:0;">
          Level Complete!
        </div>
        <div style="font-family:'Fredoka One',cursive; font-size:40px; color:#F2BE3A; margin-bottom:8px; animation: celebrate 0.6s 0.5s ease both; opacity:0;">
          ${levelName}
        </div>
        <div style="display:flex; gap:8px; justify-content:center; margin-bottom:32px; animation: fadeIn 0.4s 0.7s ease both; opacity:0;">
          <span style="font-size:36px; animation: starPop 0.4s 0.8s ease both; opacity:0;">⭐</span>
          <span style="font-size:36px; animation: starPop 0.4s 0.95s ease both; opacity:0;">⭐</span>
          <span style="font-size:36px; animation: starPop 0.4s 1.1s ease both; opacity:0;">⭐</span>
        </div>
        <button id="levelup-btn" style="
          background: linear-gradient(135deg, #D4940E, #F2BE3A);
          color: white; border: none; border-radius: 999px;
          padding: 16px 40px; font-family: 'Fredoka One', cursive; font-size: 20px;
          cursor: pointer; box-shadow: 0 8px 24px rgba(212,148,14,0.4);
          animation: slideUp 0.4s 1.2s ease both; opacity:0;
        ">Continue! →</button>
      </div>
    `;

    document.body.appendChild(overlay);
    confettiFull();

    overlay.querySelector('#levelup-btn').addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { overlay.remove(); resolve(); }, 300);
    });
  });
}

// ─── 6. CORRECT ANSWER POP ────────────────────────────
export function correctPop(el) {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth; // reflow
  el.style.animation = 'celebrate 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both';
  flashCorrect();
  confettiCorrect(el);
  spawnEmojis(['⭐', '✨', '🌟'], el);
}

// ─── 7. WRONG ANSWER SHAKE ────────────────────────────
export function wrongShake(el) {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.5s ease';
  flashWrong();
  spawnEmojis(['💪', '🔄'], el, 1);
}

// ─── 8. FLOATING EMOJI BURST ──────────────────────────
export function spawnEmojis(emojis, fromEl, count = 4) {
  const rect = fromEl?.getBoundingClientRect?.() ?? { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = createEl('div', {
        position: 'fixed',
        left: `${rect.left + rand(-20, rect.width + 20)}px`,
        top: `${rect.top + rect.height / 2}px`,
        fontSize: '24px',
        zIndex: '9998', pointerEvents: 'none',
        transition: 'all 0.8s ease',
        userSelect: 'none',
      }, pick(emojis));
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.transform = `translateY(-${rand(60, 120)}px) rotate(${rand(-30, 30)}deg) scale(0.5)`;
        el.style.opacity = '0';
      }, 50);
      setTimeout(() => el.remove(), 900);
    }, i * 80);
  }
}

// ─── 9. XP GAIN TOAST ─────────────────────────────────
export function showXPGain(amount, el) {
  const rect = el?.getBoundingClientRect?.() ?? { left: window.innerWidth / 2, top: 100, width: 0, height: 0 };
  const xp = createEl('div', {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top}px`,
    transform: 'translateX(-50%)',
    fontSize: '18px', fontWeight: '800',
    fontFamily: "'Fredoka One', cursive",
    color: '#D4940E',
    zIndex: '9999', pointerEvents: 'none',
    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
    filter: 'drop-shadow(0 2px 6px rgba(212,148,14,0.5))',
    transition: 'all 0.8s ease',
  }, `+${amount} ⭐`);
  document.body.appendChild(xp);
  setTimeout(() => {
    xp.style.transform = 'translateX(-50%) translateY(-50px)';
    xp.style.opacity = '0';
  }, 50);
  setTimeout(() => xp.remove(), 900);
}

// ─── 10. STREAK MILESTONE ─────────────────────────────
export function streakMilestone(days) {
  return new Promise((resolve) => {
    const overlay = createEl('div', {
      position: 'fixed', inset: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      zIndex: '9995', animation: 'fadeIn 0.3s ease',
    });
    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg,#B8780A,#D4940E,#F2BE3A);
        border-radius: 36px; padding: 40px 36px; text-align: center;
        max-width: 300px; width: 90%;
        box-shadow: 0 24px 60px rgba(212,148,14,0.4);
        animation: scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both;
      ">
        <div style="font-size:64px; animation: heartBeat 1.4s ease infinite;">🔥</div>
        <div style="font-family:'Fredoka One',cursive; font-size:36px; color:white; margin:12px 0 4px; text-shadow:0 2px 8px rgba(0,0,0,0.2);">${days} Days!</div>
        <div style="font-family:'Fredoka One',cursive; font-size:18px; color:rgba(255,255,255,0.85); margin-bottom:24px;">Amazing Streak! 🌟</div>
        <button id="streak-ok" style="
          background:white; color:#D4940E; border:none; border-radius:999px;
          padding:14px 32px; font-family:'Fredoka One',cursive; font-size:17px;
          cursor:pointer; font-weight:800;
        ">Keep Going! 💪</button>
      </div>`;
    document.body.appendChild(overlay);
    confettiBurst({ origin: { y: 0.6 }, colors: ['#FFB800', '#F2BE3A', '#fff', '#D4940E'] });
    overlay.querySelector('#streak-ok').addEventListener('click', () => {
      overlay.remove(); resolve();
    });
    setTimeout(() => { if (overlay.parentNode) { overlay.remove(); resolve(); } }, 4000);
  });
}

// ─── 11. PERFECT SCORE RAINBOW ────────────────────────
export function perfectScore() {
  confettiFull();
  setTimeout(() => confettiFull(), 600);
  spawnEmojis(['👑', '⭐', '🌟', '✨', '💫', '🎉'], document.body, 8);
}

// ─── 12. DAILY REWARD CHEST ───────────────────────────
export function openChest(reward) {
  return new Promise((resolve) => {
    const overlay = createEl('div', {
      position: 'fixed', inset: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      zIndex: '9995', animation: 'fadeIn 0.3s ease',
    });
    overlay.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <div style="font-size:20px; font-family:'Fredoka One',cursive; color:rgba(255,255,255,0.8); margin-bottom:16px;">Daily Reward!</div>
        <div id="chest-emoji" style="font-size:90px; cursor:pointer; filter:drop-shadow(0 8px 20px rgba(212,148,14,0.5)); transition:transform 0.3s; display:inline-block;">🎁</div>
        <div style="font-size:16px; color:rgba(255,255,255,0.7); margin-top:16px; font-weight:700;">Tap to open!</div>
      </div>`;
    document.body.appendChild(overlay);
    const chestEl = overlay.querySelector('#chest-emoji');
    chestEl.addEventListener('click', () => {
      chestEl.style.transform = 'scale(1.3) rotate(10deg)';
      chestEl.textContent = '📦';
      setTimeout(() => {
        chestEl.textContent = '✨';
        chestEl.style.transform = 'scale(1.6)';
        confettiBig();
        spawnEmojis(['⭐', '🌟', '💫'], overlay, 6);
        overlay.innerHTML = `
          <div style="
            background:white; border-radius:36px; padding:36px 32px; text-align:center;
            max-width:280px; width:90%; animation:scaleIn 0.4s ease both;
            box-shadow:0 24px 60px rgba(0,0,0,0.3);
          ">
            <div style="font-size:60px; margin-bottom:12px;">${reward.emoji || '⭐'}</div>
            <div style="font-family:'Fredoka One',cursive; font-size:22px; color:#172820; margin-bottom:8px;">${reward.title}</div>
            <div style="font-size:14px; color:#86A09A; margin-bottom:24px;">${reward.description}</div>
            <button id="chest-ok" style="
              background:#0A5744; color:white; border:none; border-radius:999px;
              padding:14px 28px; font-family:'Fredoka One',cursive; font-size:16px;
              cursor:pointer; box-shadow:0 6px 16px rgba(10,87,68,0.3);
            ">Yay! 🎉</button>
          </div>`;
        overlay.querySelector('#chest-ok').addEventListener('click', () => {
          overlay.remove(); resolve(reward);
        });
      }, 500);
    });
  });
}

// ─── 13. AVATAR REACTION ──────────────────────────────
export function avatarReact(avatarEl, type) {
  if (!avatarEl) return;
  avatarEl.style.animation = 'none';
  void avatarEl.offsetWidth;
  const animations = {
    correct:  'celebrate 0.6s ease, float 2s 0.6s ease-in-out infinite',
    wrong:    'shake 0.5s ease',
    thinking: 'pulse 1s ease-in-out infinite',
    idle:     'float 3s ease-in-out infinite',
    dance:    'wiggle 0.4s ease-in-out 3',
  };
  avatarEl.style.animation = animations[type] || animations.idle;
}

// ─── 14. PROGRESS BAR FILL ────────────────────────────
export function animateProgress(trackEl, fromPct, toPct, color = 'primary') {
  if (!trackEl) return;
  const fill = trackEl.querySelector('.progress-fill');
  if (!fill) return;
  fill.style.width = `${fromPct}%`;
  requestAnimationFrame(() => {
    fill.style.transition = 'width 1s ease-out';
    fill.style.width = `${toPct}%`;
    // Sparkle at the end position
    if (toPct >= 100) {
      setTimeout(() => spawnEmojis(['⭐', '✨'], trackEl, 3), 1000);
    }
  });
}

// ─── 15. SCREEN TRANSITION ────────────────────────────
export function pageTransition(outEl, inEl, direction = 'up') {
  if (outEl) {
    outEl.style.animation = `fadeIn 0.2s ease reverse both`;
    outEl.style.pointerEvents = 'none';
  }
  if (inEl) {
    inEl.style.display = '';
    inEl.style.animation = direction === 'up' ? 'slideUp 0.35s ease both' : 'fadeIn 0.3s ease both';
  }
}

// ─── 16. LOADING DOTS (AI thinking) ───────────────────
export function showAIThinking(containerEl) {
  const el = createEl('div', {
    display: 'flex', gap: '6px', alignItems: 'center',
    padding: '12px 16px',
    background: '#E6F5EF', borderRadius: '16px',
    border: '1px solid rgba(10,87,68,0.1)',
  });
  for (let i = 0; i < 3; i++) {
    const dot = createEl('div', {
      width: '8px', height: '8px', borderRadius: '50%',
      background: '#0A5744',
      animation: `wave 1s ease-in-out ${i * 0.15}s infinite`,
    });
    el.appendChild(dot);
  }
  const label = createEl('span', { fontSize: '13px', fontWeight: '700', color: '#3A5045', marginLeft: '4px' }, 'AI is listening...');
  el.appendChild(label);
  containerEl.appendChild(el);
  return () => el.remove(); // return cleanup fn
}

// ─── 17. PARTICLE BACKGROUND (idle screen ambience) ───
export function startParticleBackground(containerEl, count = 8) {
  const particles = [];
  const emojis = ['✦', '✧', '⭐', '🌙', '☽', '✨'];
  for (let i = 0; i < count; i++) {
    const p = createEl('div', {
      position: 'absolute',
      left: `${rand(5, 90)}%`,
      top: `${rand(5, 85)}%`,
      fontSize: `${rand(12, 22)}px`,
      opacity: String(rand(0.1, 0.3)),
      animation: `float ${rand(3, 7)}s ease-in-out ${rand(0, 4)}s infinite`,
      pointerEvents: 'none',
      userSelect: 'none',
    }, pick(emojis));
    containerEl.style.position = 'relative';
    containerEl.style.overflow = 'hidden';
    containerEl.appendChild(p);
    particles.push(p);
  }
  return () => particles.forEach(p => p.remove());
}

// ─── 18. TOAST NOTIFICATION ───────────────────────────
export function toast(message, type = 'success', duration = 3000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = createEl('div', {
    position: 'fixed', top: '80px', left: '50%',
    transform: 'translateX(-50%)',
    background: 'white', borderRadius: '16px',
    padding: '12px 20px', zIndex: '9999',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    display: 'flex', alignItems: 'center', gap: '10px',
    fontFamily: "'Nunito', sans-serif", fontWeight: '700', fontSize: '14px',
    whiteSpace: 'nowrap', maxWidth: '90vw',
    animation: 'slideDown 0.3s ease both',
    borderLeft: `4px solid ${type === 'success' ? '#0A5744' : type === 'error' ? '#E8603A' : '#0EA5E9'}`,
  }, `${icons[type] || '✅'} ${message}`);
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideDown 0.2s ease reverse both';
    setTimeout(() => el.remove(), 200);
  }, duration);
}

// Export all
export default {
  confettiBurst, confettiBig, confettiFull, confettiCorrect,
  flyStars, flashCorrect, flashWrong, badgeUnlock, levelUp,
  correctPop, wrongShake, spawnEmojis, showXPGain,
  streakMilestone, perfectScore, openChest, avatarReact,
  animateProgress, pageTransition, showAIThinking,
  startParticleBackground, toast,
};
