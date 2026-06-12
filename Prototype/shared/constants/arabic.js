// shared/constants/arabic.js
// Central reference for all Arabic learning content

export const ARABIC_ALPHABET = [
  { ar:'اَ', name:'أَلِف', en:'Alif',  sound:'a',   dots:0, position:'standalone' },
  { ar:'بَ', name:'بَاء',  en:'Ba',    sound:'ba',  dots:1, position:'below' },
  { ar:'تَ', name:'تَاء',  en:'Ta',    sound:'ta',  dots:2, position:'above' },
  { ar:'ثَ', name:'ثَاء',  en:'Tha',   sound:'tha', dots:3, position:'above' },
  { ar:'جَ', name:'جِيم',  en:'Jim',   sound:'ja',  dots:1, position:'below' },
  { ar:'حَ', name:'حَاء',  en:'Ha',    sound:'ha',  dots:0, position:'none' },
  { ar:'خَ', name:'خَاء',  en:'Kha',   sound:'kha', dots:1, position:'above' },
  { ar:'دَ', name:'دَال',  en:'Dal',   sound:'da',  dots:0, position:'none' },
  { ar:'ذَ', name:'ذَال',  en:'Dhal',  sound:'dha', dots:1, position:'above' },
  { ar:'رَ', name:'رَاء',  en:'Ra',    sound:'ra',  dots:0, position:'none' },
  { ar:'زَ', name:'زَاي',  en:'Zay',   sound:'za',  dots:1, position:'above' },
  { ar:'سَ', name:'سِين',  en:'Sin',   sound:'sa',  dots:0, position:'none' },
  { ar:'شَ', name:'شِين',  en:'Shin',  sound:'sha', dots:3, position:'above' },
  { ar:'صَ', name:'صَاد',  en:'Sad',   sound:'sa',  dots:0, position:'none' },
  { ar:'ضَ', name:'ضَاد',  en:'Dad',   sound:'da',  dots:1, position:'above' },
  { ar:'طَ', name:'طَاء',  en:'Ta',    sound:'ta',  dots:0, position:'none' },
  { ar:'ظَ', name:'ظَاء',  en:'Dha',   sound:'dha', dots:1, position:'above' },
  { ar:'عَ', name:'عَيْن', en:'Ain',   sound:'a',   dots:0, position:'none' },
  { ar:'غَ', name:'غَيْن', en:'Ghain', sound:'gha', dots:1, position:'above' },
  { ar:'فَ', name:'فَاء',  en:'Fa',    sound:'fa',  dots:1, position:'above' },
  { ar:'قَ', name:'قَاف',  en:'Qaf',   sound:'qa',  dots:2, position:'above' },
  { ar:'كَ', name:'كَاف',  en:'Kaf',   sound:'ka',  dots:0, position:'none' },
  { ar:'لَ', name:'لَام',  en:'Lam',   sound:'la',  dots:0, position:'none' },
  { ar:'مَ', name:'مِيم',  en:'Mim',   sound:'ma',  dots:0, position:'none' },
  { ar:'نَ', name:'نُون',  en:'Nun',   sound:'na',  dots:1, position:'above' },
  { ar:'هَ', name:'هَاء',  en:'Ha',    sound:'ha',  dots:0, position:'none' },
  { ar:'وَ', name:'وَاو',  en:'Waw',   sound:'wa',  dots:0, position:'none' },
  { ar:'يَ', name:'يَاء',  en:'Ya',    sound:'ya',  dots:2, position:'below' },
];

export const TASHKEEL = {
  fatha:  { mark:'َ', unicode:'U+064E', sound:'a', label:'Fatha',  example:'بَ', desc:'Short "a" — like in "bat"' },
  kasra:  { mark:'ِ', unicode:'U+0650', sound:'i', label:'Kasra',  example:'بِ', desc:'Short "i" — like in "bit"' },
  damma:  { mark:'ُ', unicode:'U+064F', sound:'u', label:'Damma',  example:'بُ', desc:'Short "u" — like in "put"' },
  sukun:  { mark:'ْ', unicode:'U+0652', sound:'',  label:'Sukun',  example:'بْ', desc:'No vowel — consonant stop' },
  shadda: { mark:'ّ', unicode:'U+0651', sound:'',  label:'Shadda', example:'بّ', desc:'Doubled letter emphasis' },
  tanwin_fath: { mark:'ً', sound:'an', label:'Tanwin Fath', example:'كِتَابً', desc:'"an" ending sound' },
  tanwin_damm: { mark:'ٌ', sound:'un', label:'Tanwin Damm', example:'كِتَابٌ', desc:'"un" ending sound (nominative)' },
  tanwin_kasr: { mark:'ٍ', sound:'in', label:'Tanwin Kasr', example:'كِتَابٍ', desc:'"in" ending sound (genitive)' },
};

export const LEVELS = [
  { number:1, nameEn:'Letters',         nameAr:'الحروف',         emoji:'🔤', color:'primary',  stages:5 },
  { number:2, nameEn:'Words',           nameAr:'الكلمات',        emoji:'📝', color:'gold',     stages:5 },
  { number:3, nameEn:'Short Sentences', nameAr:'الجمل القصيرة',  emoji:'📖', color:'teal',     stages:5 },
  { number:4, nameEn:'Reading',         nameAr:'القراءة',        emoji:'📚', color:'magic',    stages:5 },
  { number:5, nameEn:'Advanced',        nameAr:'المتقدم',        emoji:'👑', color:'gold',     stages:5 },
];

export const COMMON_WORDS = [
  { ar:'بَيْتٌ',  en:'House', emoji:'🏠', level:2 },
  { ar:'كِتَابٌ', en:'Book',  emoji:'📚', level:2 },
  { ar:'شَمْسٌ',  en:'Sun',   emoji:'☀️', level:2 },
  { ar:'مَاءٌ',   en:'Water', emoji:'🌊', level:2 },
  { ar:'قَلَمٌ',  en:'Pen',   emoji:'✏️', level:2 },
  { ar:'كَلْبٌ',  en:'Dog',   emoji:'🐕', level:2 },
  { ar:'قِطَّةٌ', en:'Cat',   emoji:'🐈', level:2 },
  { ar:'تُفَّاحٌ',en:'Apple', emoji:'🍎', level:2 },
];

export const BADGE_DEFINITIONS = [
  { name:'First Steps',        icon:'🌱', category:'COMPLETION', desc:'Completed your first lesson',                 req:{type:'first_lesson'} },
  { name:'Week Warrior',       icon:'🔥', category:'STREAK',     desc:'7-day learning streak',                       req:{type:'streak',value:7} },
  { name:'Clear Speaker',      icon:'🏅', category:'SPEAKING',   desc:'90%+ pronunciation accuracy',                 req:{type:'accuracy',minPct:90,lessonCount:1} },
  { name:'Sharpshooter',       icon:'🎯', category:'ACCURACY',   desc:'Perfect 100% quiz score',                     req:{type:'perfect_quiz'} },
  { name:'Night Owl',          icon:'🌙', category:'SPECIAL',    desc:'Practice after 8pm × 5',                     req:{type:'night_sessions',value:5} },
  { name:'Bookworm',           icon:'📚', category:'COMPLETION', desc:'Complete all of Level 2',                     req:{type:'level_complete',levelNumber:2} },
  { name:'Star Collector',     icon:'⭐', category:'SPECIAL',    desc:'Earn 100 total stars',                        req:{type:'stars',value:100} },
  { name:'Consistent Learner', icon:'🌟', category:'STREAK',     desc:'30-day streak',                               req:{type:'streak',value:30} },
  { name:'Rocket',             icon:'🚀', category:'COMPLETION', desc:'Complete all 5 levels',                       req:{type:'lessons_completed',value:50} },
  { name:'Arabic Master',      icon:'👑', category:'ACCURACY',   desc:'95%+ accuracy across 20+ lessons',            req:{type:'accuracy',minPct:95,lessonCount:20} },
];

export const ENCOURAGEMENTS = {
  correct:  ['ممتاز! 🌟', 'أحسنت! ⭐', 'رائع! 💫', 'بارك الله فيك! 🎉', 'شكراً لك! 🌸'],
  wrong:    ['حاول مرة أخرى 💪', 'لا بأس! 🌱', 'تقدر تعيد المحاولة 🔄'],
  streak:   ['استمر! 🔥', 'أنت رائع! 🚀', 'لا تتوقف! ⭐'],
};

export const ISLAMIC_DECORATIONS = ['✦', '✧', '☽', '🌙', '🪔', '⭐', '🌟', '💫', '✨'];
