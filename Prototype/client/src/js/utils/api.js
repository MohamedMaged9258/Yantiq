// api.js — Mock API layer (no backend required)
// All functions return the same data shapes as the real API.
// Used for UI prototype/demo purposes only.

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// ─── Mock data store (in-memory) ──────────────────────
let mockUser = null;
let mockChildren = [];
let mockProgress = {};

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: async (data) => {
    await delay(500);
    mockUser = { id: 'u1', email: data.email, name: data.parentName || 'Parent' };
    return { data: { data: { user: mockUser, accessToken: 'mock-token' } } };
  },
  login: async (data) => {
    await delay(400);
    mockUser = { id: 'u1', email: data.email, name: 'Parent' };
    return { data: { data: { user: mockUser, accessToken: 'mock-token' } } };
  },
  logout: async () => { await delay(200); return { data: {} }; },
  refresh: async () => { await delay(200); return { data: { data: { accessToken: 'mock-token' } } }; },
  me: async () => {
    await delay(200);
    return { data: { data: mockUser || { id: 'u1', email: 'demo@yantiq.app', name: 'Parent' } } };
  },
};

// ─── Children ──────────────────────────────────────────
export const childrenAPI = {
  create: async (data) => {
    await delay(400);
    const child = { id: 'c1', ...data, totalStars: 12, streakDays: 3, totalLessons: 7, currentLevel: 1 };
    mockChildren = [child];
    return { data: { data: child } };
  },
  list: async () => {
    await delay(300);
    const children = mockChildren.length > 0 ? mockChildren : [getMockChild()];
    return { data: { data: children } };
  },
  get: async (id) => {
    await delay(200);
    return { data: { data: getMockChild() } };
  },
  update: async (id, data) => {
    await delay(300);
    return { data: { data: { ...getMockChild(), ...data } } };
  },
  delete: async (id) => { await delay(300); return { data: {} }; },
  savePlacement: async (childId, data) => {
    await delay(300);
    return { data: { data: { level: data.level || 1 } } };
  },
};

// ─── Levels ────────────────────────────────────────────
export const levelsAPI = {
  list: async () => { await delay(300); return { data: { data: getMockLevels() } }; },
  all:  async () => { await delay(300); return { data: { data: getMockLevels() } }; },
  getLevel: async (id) => { await delay(200); return { data: { data: getMockLevels()[0] } }; },
  get:  async (id) => { await delay(200); return { data: { data: getMockLevels()[0] } }; },
  getStages: async (id) => { await delay(200); return { data: { data: getMockStages() } }; },
  stages:    async (id) => { await delay(200); return { data: { data: getMockStages() } }; },
  getStage:  async (id) => { await delay(200); return { data: { data: getMockStages()[0] } }; },
  stageDetail: async (id) => { await delay(200); return { data: { data: getMockStages()[0] } }; },
  getStageLessons: async (id) => { await delay(200); return { data: { data: getMockLessons() } }; },
  lessons:   async (id) => { await delay(200); return { data: { data: getMockLessons() } }; },
  getLesson: async (id) => { await delay(200); return { data: { data: getMockLessons()[0] } }; },
  lesson:    async (id) => { await delay(200); return { data: { data: getMockLessons()[0] } }; },
};

// ─── Progress ──────────────────────────────────────────
export const progressAPI = {
  get: async (childId) => {
    await delay(300);
    return { data: { data: { tree: getMockProgressTree(), child: getMockChild() } } };
  },
  logSession: async (childId, data) => { await delay(200); return { data: { data: {} } }; },
  weeklyActivity: async (childId) => {
    await delay(200);
    return { data: { data: getMockWeeklyActivity() } };
  },
  sessions: async (childId, page) => { await delay(200); return { data: { data: [] } }; },
};

// ─── Pronunciation ─────────────────────────────────────
export const pronunciationAPI = {
  evaluate: async (childId, data) => {
    await delay(800); // simulate AI processing
    const score = Math.round(65 + Math.random() * 35);
    return {
      data: {
        data: {
          score,
          passed: score >= 70,
          feedback: score >= 85
            ? `ممتاز! Your "${data.targetAr}" was very clear!`
            : score >= 70
            ? `Good try on "${data.targetAr}" — almost perfect!`
            : `Keep practicing "${data.targetAr}" — you can do it! 💪`,
          errorType: score < 70 ? 'articulation' : null,
        }
      }
    };
  },
  history: async (childId, lessonId) => { await delay(200); return { data: { data: [] } }; },
};

// ─── Badges ────────────────────────────────────────────
export const badgesAPI = {
  get: async (childId) => { await delay(300); return { data: { data: getMockBadges() } }; },
};

// ─── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  get: async (childId) => { await delay(400); return { data: { data: getMockDashboard() } }; },
};

// ─── Password / Email ──────────────────────────────────
export const passwordAPI = {
  forgot:           async (email)           => { await delay(500); return { data: {} }; },
  reset:            async (token, password) => { await delay(500); return { data: {} }; },
  verifyEmail:      async (token)           => { await delay(500); return { data: {} }; },
  sendVerification: async ()                => { await delay(300); return { data: {} }; },
};

// ══════════════════════════════════════════════════════
//  MOCK DATA FACTORIES
// ══════════════════════════════════════════════════════

function getMockChild() {
  return {
    id: 'c1',
    name: 'Layla',
    nickname: 'Layla',
    age: 5,
    avatar: '🦅',
    arabicExposure: 'Some',
    currentLevel: 1,
    totalStars: 24,
    streakDays: 3,
    totalLessons: 7,
    xp: 240,
  };
}

function getMockLevels() {
  return [
    { id: 'l1', number: 1, nameEn: 'Letters', nameAr: 'الحروف', color: '#0A5744' },
    { id: 'l2', number: 2, nameEn: 'Short Words', nameAr: 'الكلمات القصيرة', color: '#D4940E' },
    { id: 'l3', number: 3, nameEn: 'Long Words', nameAr: 'الكلمات الطويلة', color: '#0D7055' },
    { id: 'l4', number: 4, nameEn: 'Short Sentences', nameAr: 'الجمل القصيرة', color: '#8B5CF6' },
    { id: 'l5', number: 5, nameEn: 'Short Stories', nameAr: 'القصص القصيرة', color: '#D4940E' },
  ];
}

function getMockStages() {
  return [
    { id: 's1', number: 1, nameEn: 'Stage 1', nameAr: 'المرحلة الأولى', lessonCount: 3,
      progress: { completed: true, stars: 3, attempts: 1 } },
    { id: 's2', number: 2, nameEn: 'Stage 2', nameAr: 'المرحلة الثانية', lessonCount: 3,
      progress: { completed: false, stars: 1, attempts: 2 } },
    { id: 's3', number: 3, nameEn: 'Stage 3', nameAr: 'المرحلة الثالثة', lessonCount: 3,
      progress: null },
  ];
}

function getMockLessons() {
  return [
    { id: 'ls1', order: 1, type: 'letter', titleEn: 'Letter Alef', titleAr: 'حرف الألف',
      targetAr: 'أ', targetEn: 'Alef', audioUrl: null, imageUrl: null },
    { id: 'ls2', order: 2, type: 'letter', titleEn: 'Letter Ba', titleAr: 'حرف الباء',
      targetAr: 'ب', targetEn: 'Ba', audioUrl: null, imageUrl: null },
    { id: 'ls3', order: 3, type: 'letter', titleEn: 'Letter Ta', titleAr: 'حرف التاء',
      targetAr: 'ت', targetEn: 'Ta', audioUrl: null, imageUrl: null },
  ];
}

function getMockProgressTree() {
  const levels = getMockLevels();
  return levels.map((level, li) => ({
    ...level,
    stages: getMockStages().map((stage, si) => ({
      ...stage,
      progress: li === 0
        ? (si === 0 ? { completed: true, stars: 3 } : si === 1 ? { completed: false, stars: 1 } : null)
        : null,
    })),
  }));
}

function getMockWeeklyActivity() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Today'];
  const mins  = [8, 14, 10, 18, 15, 11, 12];
  return days.map((label, i) => ({
    label, totalMinutes: mins[i], starsEarned: Math.floor(mins[i] / 5),
    isToday: i === 6, sessionCount: Math.floor(mins[i] / 8), avgAccuracy: 80 + i * 2,
  }));
}

function getMockBadges() {
  return [
    { id: 'b1', name: 'First Steps', nameAr: 'الخطوات الأولى', icon: '🌿', description: 'Complete your first lesson', earned: true, earnedAt: new Date().toISOString() },
    { id: 'b2', name: 'Letter Master', nameAr: 'سيد الحروف', icon: '🌟', description: 'Learn all letters in Level 1', earned: true, earnedAt: new Date().toISOString() },
    { id: 'b3', name: 'Streak Hero', nameAr: 'بطل التسلسل', icon: '✴️🔥', description: 'Practice 7 days in a row', earned: false, earnedAt: null },
    { id: 'b4', name: 'Word Wizard', nameAr: 'ساحر الكلمات', icon: '🪄', description: 'Complete Level 2', earned: false, earnedAt: null },
    { id: 'b5', name: 'Speed Reader', nameAr: 'القارئ السريع', icon: '🕊️', description: 'Finish a lesson in under 2 minutes', earned: false, earnedAt: null },
    { id: 'b6', name: 'Perfect Score', nameAr: 'الدرجة الكاملة', icon: '🔮', description: 'Get 100% on any lesson', earned: false, earnedAt: null },
  ];
}

function getMockDashboard() {
  return {
    child: getMockChild(),
    stats: { avgAccuracy: 82, weeklyMinutes: 48, totalSessions: 12, improvementPct: 15 },
    weeklyActivity: getMockWeeklyActivity(),
    recentSessions: [
      { date: new Date().toISOString(), lessonTitle: 'Letter Alef', stars: 3, accuracy: 90, durationMinutes: 4 },
      { date: new Date(Date.now() - 86400000).toISOString(), lessonTitle: 'Letter Ba', stars: 2, accuracy: 75, durationMinutes: 6 },
    ],
    earnedBadges: getMockBadges().filter(b => b.earned),
    aiInsight: 'Layla is doing great with letter recognition! Focus on pronunciation this week. 🌟',
  };
}
