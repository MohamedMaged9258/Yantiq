/**
 * quiz.js — Quiz session manager
 * Handles multi-question quiz flow, scoring, lives, feedback
 */
import { correctPop, wrongShake, confettiCorrect, flashCorrect,
         flashWrong, spawnEmojis, perfectScore, toast } from '../utils/animations.js';
import { onCorrectAnswer, onWrongAnswer, onLessonComplete } from './rewards.js';

// ─── Default quiz config ──────────────────────────────
const DEFAULTS = {
  totalLives:     3,
  xpPerCorrect:   5,
  starsPerCorrect: 0, // stars awarded at end based on score
  passingScore:   60,
};

// ─── Quiz state ───────────────────────────────────────
let session = null;

/**
 * Initialise a new quiz session.
 * @param {Array} questions - [{id, question, options, correct, explanation, type}]
 * @param {Object} opts - override defaults
 */
export function initQuiz(questions, opts = {}) {
  session = {
    questions,
    cfg:        { ...DEFAULTS, ...opts },
    current:    0,
    score:      0,
    lives:      opts.totalLives ?? DEFAULTS.totalLives,
    answers:    [],
    startedAt:  Date.now(),
    complete:   false,
  };
  return session;
}

// ─── Answer a question ────────────────────────────────
export async function answerQuestion(selectedOption, {
  optionEl,
  allOptionEls,
  feedbackEl,
  coachEl,
  heartsEl,
  scoreEl,
}) {
  if (!session || session.complete) return null;

  const q = session.questions[session.current];
  const isCorrect = selectedOption === q.correct;

  // Disable all options immediately
  allOptionEls?.forEach(el => {
    el.style.pointerEvents = 'none';
    el.classList.add('dim');
  });
  optionEl?.classList.remove('dim');

  if (isCorrect) {
    // Visual feedback
    optionEl?.classList.add('correct');
    correctPop(optionEl);
    flashCorrect();
    confettiCorrect(optionEl);
    spawnEmojis(['🌟', '✨', '🌟'], optionEl, 3);

    // Update coach
    setCoach(coachEl, 'correct', q.explanation);

    // Session state
    session.score++;
    session.answers.push({ qId: q.id, selected: selectedOption, correct: true });

    // Rewards
    await onCorrectAnswer({ xp: session.cfg.xpPerCorrect, stars: 0, sourceEl: optionEl });

  } else {
    // Visual feedback
    optionEl?.classList.add('wrong');
    wrongShake(optionEl);
    flashWrong();
    // Highlight correct answer
    allOptionEls?.forEach(el => {
      if (el.dataset.answer === q.correct) {
        el.classList.remove('dim');
        el.style.border = '2px solid #0A5744';
        el.style.background = '#E6F5EF';
      }
    });

    setCoach(coachEl, 'wrong', q.explanation);
    session.lives = Math.max(0, session.lives - 1);
    session.answers.push({ qId: q.id, selected: selectedOption, correct: false });
    onWrongAnswer(optionEl);
  }

  // Update HUD
  if (heartsEl) heartsEl.textContent = '❤️'.repeat(session.lives) + '🖤'.repeat(DEFAULTS.totalLives - session.lives);
  if (scoreEl)  scoreEl.textContent = `${session.score} / ${session.questions.length}`;
  if (feedbackEl) showFeedback(feedbackEl, isCorrect, q.explanation);

  return { isCorrect, lives: session.lives, score: session.score };
}

// ─── Advance to next question ─────────────────────────
export function nextQuestion() {
  if (!session) return null;
  session.current++;
  if (session.current >= session.questions.length || session.lives === 0) {
    session.complete = true;
    return { done: true, ...getResults() };
  }
  return { done: false, question: session.questions[session.current], index: session.current };
}

// ─── Get final results ────────────────────────────────
export function getResults() {
  if (!session) return null;
  const pct      = Math.round((session.score / session.questions.length) * 100);
  const stars    = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const passed   = pct >= session.cfg.passingScore;
  const duration = Math.round((Date.now() - session.startedAt) / 1000);
  return { score: session.score, total: session.questions.length, pct, stars, passed, duration, answers: session.answers };
}

// ─── Show completion state ────────────────────────────
export async function showCompletion(containerEl, { childId, lessonId } = {}) {
  const results = getResults();
  if (!results) return;

  if (results.pct === 100) {
    perfectScore();
  } else if (results.pct >= 70) {
    const { confettiBig } = await import('../utils/animations.js');
    confettiBig();
  }

  if (results.stars > 0) {
    await onLessonComplete({ score: results.pct, stars: results.stars, lessonId, childId });
  }

  toast(
    results.pct === 100 ? '🏆 Perfect! Incredible work!'
      : results.pct >= 70 ? `🌟 Well done! ${results.pct}%`
      : `💪 Keep practising! ${results.pct}%`,
    results.pct >= 70 ? 'success' : 'info',
    3000,
  );

  return results;
}

// ─── Reset session ────────────────────────────────────
export function resetQuiz() {
  session = null;
}

// ─── Helpers ──────────────────────────────────────────
function setCoach(el, type, msg) {
  if (!el) return;
  const avatarEl = el.querySelector?.('[data-coach-avatar]') ?? el;
  const textEl   = el.querySelector?.('[data-coach-text]');
  const positives = ['ممتاز! 🌟', 'You got it! 🌟', 'Brilliant! 🎉', 'Excellent! 💫', 'Keep going! 🚀'];
  const retries   = ['Almost! Try again 💪', 'You can do it! 🔥', 'Nearly there! 🌱'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (type === 'correct') {
    if (textEl) textEl.textContent = msg || pick(positives);
    avatarEl.style.animation = 'celebrate 0.6s ease, float 2s 0.6s ease-in-out infinite';
  } else {
    if (textEl) textEl.textContent = msg ? `Not quite! ${msg}` : pick(retries);
    avatarEl.style.animation = 'shake 0.5s ease';
    setTimeout(() => { avatarEl.style.animation = 'float 2.5s ease-in-out infinite'; }, 700);
  }
}

function showFeedback(el, isCorrect, explanation) {
  el.classList.remove('hidden');
  el.className = el.className.replace(/bg-\S+|border-\S+/g, '').trim();
  if (isCorrect) {
    el.classList.add('bg-primary-50', 'border-primary/15');
    el.innerHTML = `<span class="text-xl">✅</span><p class="font-bold text-primary-700 text-sm leading-relaxed">${explanation || 'Correct! Great work!'}</p>`;
  } else {
    el.classList.add('bg-coral-50', 'border-coral/15');
    el.innerHTML = `<span class="text-xl">💪</span><p class="font-bold text-coral-700 text-sm leading-relaxed">${explanation || 'Not this time — review the lesson and try again!'}</p>`;
  }
}

export function getSession() { return session ? { ...session } : null; }
