import{badgesAPI as l}from"./api-CXCcurua.js";import{getState as c}from"./storage-CSc0t46S.js";import{c as d}from"./animations-CD3NMRZt.js";async function y(){const e=c("activeChild");if(!(e!=null&&e.id))return s();try{return(await l.get(e.id)).data.data}catch{return s()}}function f(e,n,a){const o=e.filter(t=>t.earned),r=e.filter(t=>!t.earned);n&&(n.innerHTML=o.length===0?'<p class="col-span-2 text-center text-gray-400 font-semibold text-sm py-4">No badges yet — keep learning! 🌱</p>':o.map(t=>i(t,!0)).join("")),a&&(a.innerHTML=r.map(t=>i(t,!1)).join(""))}function x(e,n,a=4){if(!n)return;const o=e.filter(t=>t.earned).slice(0,a),r=a-o.length;n.innerHTML=[...o.map(t=>`
      <div class="flex-shrink-0 w-20 h-20 rounded-3xl bg-gold-50 border border-gold/20
                  flex flex-col items-center justify-center gap-1 cursor-pointer
                  hover:shadow-glow-gold hover:-translate-y-1 transition-all duration-200"
           onclick="showBadgeDetail('${t.name}','${t.description}','${t.earnedAt?new Date(t.earnedAt).toLocaleDateString():"Recent"}','${t.icon}')">
        <span class="text-3xl">${t.icon}</span>
        <span class="text-[10px] font-bold text-gold leading-tight text-center px-1 truncate w-full text-center">${t.name}</span>
      </div>`),...Array(r).fill(`
      <div class="flex-shrink-0 w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100
                  flex flex-col items-center justify-center gap-1 opacity-50">
        <span class="text-3xl grayscale">🏅</span>
        <span class="text-[10px] font-bold text-gray-400">🔒 Locked</span>
      </div>`)].join("")}function b(e,n,a,o){let r=document.getElementById("badge-modal");r||(r=document.createElement("div"),r.id="badge-modal",r.className="hidden reward-popup",r.innerHTML=`
      <div class="reward-card">
        <div id="bm-icon" class="text-6xl mb-4" style="animation:celebrate 0.5s ease both"></div>
        <h3 id="bm-name" class="font-display text-gray-900 text-2xl mb-2"></h3>
        <p id="bm-desc" class="text-gray-500 text-sm leading-relaxed mb-3"></p>
        <p id="bm-date" class="text-primary font-extrabold text-xs uppercase tracking-wider mb-6"></p>
        <button onclick="document.getElementById('badge-modal').classList.add('hidden')"
                class="btn btn-primary btn-md w-full font-display text-lg">Close ✨</button>
      </div>`,r.addEventListener("click",t=>{t.target===r&&r.classList.add("hidden")}),document.body.appendChild(r)),document.getElementById("bm-icon").textContent=o,document.getElementById("bm-name").textContent=e,document.getElementById("bm-desc").textContent=n,document.getElementById("bm-date").textContent=`Earned: ${a}`,r.classList.remove("hidden"),d(r)}function s(){return[{name:"First Steps",icon:"🌱",description:"Completed your first lesson",category:"COMPLETION",earned:!0,earnedAt:new Date(Date.now()-864e6).toISOString(),requirement:{type:"first_lesson"}},{name:"Week Warrior",icon:"🔥",description:"Maintained a 7-day learning streak",category:"STREAK",earned:!0,earnedAt:new Date(Date.now()-864e5).toISOString(),requirement:{type:"streak",value:7}},{name:"Clear Speaker",icon:"🏅",description:"Achieved 90%+ pronunciation accuracy",category:"SPEAKING",earned:!0,earnedAt:new Date().toISOString(),requirement:{type:"accuracy",minPct:90}},{name:"Sharpshooter",icon:"🎯",description:"Scored 100% on any quiz",category:"ACCURACY",earned:!1,earnedAt:null,progress:"0/1",requirement:{type:"perfect_quiz"}},{name:"Night Owl",icon:"🌙",description:"Practice after 8pm for 5 sessions",category:"SPECIAL",earned:!1,earnedAt:null,progress:"2/5",requirement:{type:"night_sessions",value:5}},{name:"Bookworm",icon:"📚",description:"Complete all of Level 2 — Words",category:"COMPLETION",earned:!1,earnedAt:null,progress:"0/1",requirement:{type:"level_complete"}},{name:"Star Collector",icon:"⭐",description:"Earn 100 total stars",category:"SPECIAL",earned:!1,earnedAt:null,progress:"47/100",requirement:{type:"stars",value:100}},{name:"Consistent",icon:"🌟",description:"30-day learning streak",category:"STREAK",earned:!1,earnedAt:null,progress:"7/30",requirement:{type:"streak",value:30}},{name:"Rocket",icon:"🚀",description:"Complete all 5 learning levels",category:"COMPLETION",earned:!1,earnedAt:null,progress:"1/5",requirement:{type:"lessons_completed"}},{name:"Arabic Master",icon:"👑",description:"95%+ accuracy across 20+ lessons",category:"ACCURACY",earned:!1,earnedAt:null,progress:"???",requirement:{type:"accuracy"}}]}function i(e,n){const o={COMPLETION:"bg-primary-50",STREAK:"bg-coral-50",SPEAKING:"bg-gold-50",ACCURACY:"bg-magic-pale",SPECIAL:"bg-sky-50"}[e.category]||"bg-gray-50",r=!n&&e.progress&&e.progress.includes("/")?`
    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
      <div class="bg-primary/50 h-1.5 rounded-full transition-all" style="width:${p(e.progress)}%"></div>
    </div>
    <p class="text-[10px] font-bold text-gray-400 mt-1">${e.progress}</p>`:"";return`
    <div class="badge-card ${n?"cursor-pointer":"locked"} animate-slide-up"
         ${n?`onclick="showBadgeDetail('${e.name}','${e.description}','${e.earnedAt?new Date(e.earnedAt).toLocaleDateString():"Recent"}','${e.icon}')"`:""}>
      <div class="w-16 h-16 rounded-3xl ${o} mx-auto mb-3 flex items-center justify-center text-4xl border border-black/5 ${n?"":"grayscale opacity-70"}"
           ${n?'style="animation:float 3s ease-in-out infinite"':""}>
        ${e.icon}
      </div>
      <p class="font-display text-gray-900 text-sm mb-1 truncate">${e.name}</p>
      <p class="text-gray-400 text-xs leading-tight line-clamp-2">${e.description}</p>
      ${n?`<p class="text-primary font-extrabold text-[10px] mt-2">${e.earnedAt?new Date(e.earnedAt).toLocaleDateString():"Recent"}</p>`:r||'<p class="text-gray-300 font-bold text-[10px] mt-2">🔒 Locked</p>'}
    </div>`}function p(e){if(!(e!=null&&e.includes("/")))return 0;const[n,a]=e.split("/").map(Number);return a?Math.round(n/a*100):0}export{f as a,y as f,x as r,b as s};
