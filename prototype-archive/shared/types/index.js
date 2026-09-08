/**
 * shared/types/index.js
 * JSDoc type definitions shared between client and server.
 * Use @typedef to get IDE autocomplete without TypeScript.
 */

/**
 * @typedef {Object} User
 * @property {string}  id
 * @property {string}  email
 * @property {string}  firstName
 * @property {string}  lastName
 * @property {string}  [phone]
 * @property {'PARENT'|'ADMIN'} role
 * @property {boolean} isVerified
 * @property {string}  createdAt
 * @property {Child[]} children
 */

/**
 * @typedef {Object} Child
 * @property {string}  id
 * @property {string}  name
 * @property {string}  [nickname]
 * @property {number}  age
 * @property {string}  avatar
 * @property {'NONE'|'SOME'|'FAMILIAR'} arabicExposure
 * @property {number}  totalStars
 * @property {number}  totalLessons
 * @property {number}  streakDays
 * @property {number}  longestStreak
 * @property {string}  [lastActiveDate]
 * @property {string}  parentId
 */

/**
 * @typedef {Object} Level
 * @property {string}  id
 * @property {number}  number
 * @property {string}  nameEn
 * @property {string}  nameAr
 * @property {string}  description
 * @property {number}  totalStages
 * @property {Stage[]} stages
 */

/**
 * @typedef {Object} Stage
 * @property {string}   id
 * @property {number}   number
 * @property {string}   levelId
 * @property {string}   nameEn
 * @property {string}   [nameAr]
 * @property {string[]} letters
 * @property {Lesson[]} lessons
 * @property {Progress} [progress]
 * @property {boolean}  isUnlocked
 */

/**
 * @typedef {Object} Lesson
 * @property {string}  id
 * @property {string}  stageId
 * @property {number}  number
 * @property {'PRONUNCIATION'|'QUIZ'|'LISTENING'|'REVIEW'|'WORD'} type
 * @property {string}  [letterAr]       e.g. "بَ"
 * @property {string}  [letterNameAr]   e.g. "بَاء"
 * @property {string}  [letterNameEn]   e.g. "Ba"
 * @property {TashkeelForm[]} [tashkeelForms]
 * @property {string}  [wordAr]
 * @property {string}  [wordEn]
 * @property {string}  [wordEmoji]
 * @property {string}  [transliteration]
 * @property {Object}  [quizContent]
 * @property {number}  xpReward
 */

/**
 * @typedef {Object} TashkeelForm
 * @property {string} form    e.g. "بَ"
 * @property {string} vowel   "fatha" | "kasra" | "damma"
 * @property {string} sound   e.g. "ba"
 * @property {string} label   e.g. "Ba (a)"
 */

/**
 * @typedef {Object} Progress
 * @property {string}  id
 * @property {string}  childId
 * @property {string}  stageId
 * @property {number}  stars       0-3
 * @property {boolean} completed
 * @property {string}  [completedAt]
 * @property {number}  bestAccuracy
 * @property {number}  totalAttempts
 */

/**
 * @typedef {Object} Session
 * @property {string}  id
 * @property {string}  childId
 * @property {string}  lessonId
 * @property {number}  [score]
 * @property {number}  [accuracyPct]
 * @property {number}  [durationSeconds]
 * @property {number}  attempts
 * @property {boolean} completed
 * @property {number}  starsEarned
 * @property {number}  xpEarned
 * @property {string}  [aiFeedback]
 * @property {string}  startedAt
 * @property {string}  [completedAt]
 */

/**
 * @typedef {Object} PronunciationResult
 * @property {number}  score      0-100
 * @property {boolean} passed
 * @property {string}  feedback
 * @property {string|null} errorType
 * @property {string}  attemptId
 */

/**
 * @typedef {Object} Badge
 * @property {string}  id
 * @property {string}  name
 * @property {string}  description
 * @property {string}  icon
 * @property {'SPEAKING'|'STREAK'|'COMPLETION'|'SPEED'|'ACCURACY'|'SPECIAL'} category
 * @property {Object}  requirement
 * @property {boolean} earned
 * @property {string|null} earnedAt
 * @property {string|null} [progress]
 */

/**
 * @typedef {Object} DashboardData
 * @property {Child}    child
 * @property {DashboardStats} stats
 * @property {WeeklyDay[]} weeklyActivity
 * @property {Session[]} recentSessions
 * @property {Badge[]}  earnedBadges
 * @property {Badge[]}  lockedBadges
 * @property {AIInsight} aiInsight
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} avgAccuracy
 * @property {number} accuracyTrend
 * @property {number} totalSessions
 * @property {number} weeklyMinutes
 * @property {number} weeklyGoalMinutes
 * @property {number} weeklyGoalPct
 */

/**
 * @typedef {Object} WeeklyDay
 * @property {string}  date
 * @property {string}  label
 * @property {boolean} isToday
 * @property {number}  sessionCount
 * @property {number}  totalMinutes
 * @property {number}  starsEarned
 * @property {number}  avgAccuracy
 */

/**
 * @typedef {Object} AIInsight
 * @property {'improvement'|'engagement'|'celebration'|'encouragement'} type
 * @property {string} title
 * @property {string} text
 * @property {string|null} action
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} success
 * @property {string}  message
 * @property {*}       data
 * @property {Object}  [meta]
 * @property {string}  timestamp
 */

/**
 * @typedef {Object} RewardState
 * @property {number}  xp
 * @property {number}  level
 * @property {number}  stars
 * @property {number}  streak
 * @property {string|null} lastPlayDate
 * @property {boolean} dailyChallengeComplete
 */

// Export empty object so this can be imported as a module
export default {};
