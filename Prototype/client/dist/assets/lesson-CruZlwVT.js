import{t as g}from"./animations-CD3NMRZt.js";/* empty css             */import{levelsAPI as p,progressAPI as h}from"./api-CXCcurua.js";import{getState as w}from"./storage-CSc0t46S.js";const $=new URLSearchParams(window.location.search),y=$.get("level");function m(t){return"⭐".repeat(t)+'<span class="text-gray-200">⭐</span>'.repeat(3-t)}function E(t,e,i){const d=e==null?void 0:e.completed,s=!d&&e===null&&i>0,x=e?Math.round((e.totalAttempts>0?Math.min(e.stars/3,1):0)*100):0,n=(t.letters||[]).slice(0,3).join(" · "),l=(i*.05).toFixed(2);return s?`
    <div class="level-card locked animate-slide-up" style="animation-delay:${l}s">
      <div class="p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center font-display text-gray-400 text-base flex-shrink-0">${t.number}</div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-gray-400 text-base truncate">Stage ${t.number} — <span class="font-arabic">${n}</span></p>
          <p class="text-gray-300 text-xs font-semibold mt-0.5">${t.totalLessons||3} lessons · Complete previous stage first</p>
        </div>
        <span class="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">🔒</span>
      </div>
    </div>`:d?`
    <div class="card-hover mb-0 cursor-pointer animate-slide-up" style="animation-delay:${l}s"
         onclick="goToLesson('${t.id}')">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">✓</div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-gray-900 text-base">Stage ${t.number} — <span class="font-arabic text-primary text-lg rtl-text">${n}</span></p>
          <p class="text-gray-400 text-xs font-semibold mt-0.5">${t.totalLessons||3} lessons complete</p>
        </div>
        <div class="flex gap-0.5 flex-shrink-0">${m((e==null?void 0:e.stars)||3)}</div>
      </div>
    </div>`:`
  <div class="animate-slide-up" style="animation-delay:${l}s;border:2px solid #0A5744;background:#E6F5EF;border-radius:24px;padding:16px;cursor:pointer"
       onclick="goToLesson('${t.id}')">
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center font-display text-white text-base flex-shrink-0"
           style="animation:pulse-glow 2s ease-in-out infinite">${t.number}</div>
      <div class="flex-1 min-w-0">
        <p class="font-display text-gray-900 text-base">Stage ${t.number} — <span class="font-arabic text-primary text-lg rtl-text">${n}</span></p>
        <p class="text-primary text-xs font-semibold mt-0.5">In progress · ${t.totalLessons||3} lessons</p>
        <div class="mt-2 h-2.5 bg-primary/15 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-700" style="width:${x}%"></div>
        </div>
      </div>
      <div class="bg-primary text-white rounded-2xl px-3 py-1.5 flex-shrink-0">
        <span class="font-display text-sm">GO →</span>
      </div>
    </div>
  </div>`}window.goToLesson=t=>{window.location.href=`./pronunciation.html?stage=${t}`};async function L(){var e,i,d;const t=w("activeChild");if(!t){g("Please log in first","error"),window.location.href="./login.html";return}try{let s;if(y?s=(await p.getLevel(y)).data.data:s=(e=(await p.list()).data.data)==null?void 0:e[0],!s)throw new Error("No level found");document.getElementById("level-badge").textContent=`LEVEL ${s.number}`,document.getElementById("level-title").innerHTML=`${s.nameEn} — <span class="font-arabic">${s.nameAr}</span>`;const n=(await p.getStages(s.id)).data.data||[],l=await h.get(t.id).catch(()=>null),r=(((d=(i=l==null?void 0:l.data)==null?void 0:i.data)==null?void 0:d.tree)||[]).find(a=>a.id===s.id||a.number===s.number),c={};r!=null&&r.stages&&r.stages.forEach(a=>{c[a.id]=a.progress||null});const f=n.filter(a=>{var o;return(o=c[a.id])==null?void 0:o.completed}).length,u=n.length?Math.round(f/n.length*100):0;document.getElementById("stage-count").textContent=`${f} of ${n.length} stages complete`,document.getElementById("stage-pct").textContent=`${u}%`;const b=document.getElementById("level-progress-bar");setTimeout(()=>{b.style.width=`${u}%`},300);const v=document.getElementById("stages-list");v.innerHTML=n.map((a,o)=>E(a,c[a.id]??(o===0?{}:null),o)).join(""),document.getElementById("stages-loading").classList.add("hidden"),v.classList.remove("hidden")}catch(s){console.error("Lesson load error:",s),document.getElementById("stages-loading").classList.add("hidden"),document.getElementById("stage-count").textContent="3 of 5 stages complete",document.getElementById("stage-pct").textContent="60%",document.getElementById("level-progress-bar").style.width="60%",document.getElementById("stages-list").innerHTML=`
      <div class="card mb-0 cursor-pointer" onclick="window.location.href='./pronunciation.html'">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center text-xl">✓</div>
          <div class="flex-1"><p class="font-display text-gray-900 text-base">Stage 1 — <span class="font-arabic text-primary rtl-text">اَ بَ تَ</span></p>
          <p class="text-gray-400 text-xs font-semibold mt-0.5">3 lessons complete</p></div>
          <div class="flex gap-0.5">${m(3)}</div>
        </div>
      </div>
      <div class="card mb-0 cursor-pointer" onclick="window.location.href='./pronunciation.html'">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center text-xl">✓</div>
          <div class="flex-1"><p class="font-display text-gray-900 text-base">Stage 2 — <span class="font-arabic text-primary rtl-text">ثَ جَ حَ</span></p>
          <p class="text-gray-400 text-xs font-semibold mt-0.5">3 lessons complete</p></div>
          <div class="flex gap-0.5">${m(2)}</div>
        </div>
      </div>
      <div style="border:2px solid #0A5744;background:#E6F5EF;border-radius:24px;padding:16px;cursor:pointer" onclick="window.location.href='./pronunciation.html'">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center font-display text-white text-base" style="animation:pulse-glow 2s ease-in-out infinite">3</div>
          <div class="flex-1"><p class="font-display text-gray-900 text-base">Stage 3 — <span class="font-arabic text-primary rtl-text">خَ دَ ذَ</span></p>
          <p class="text-primary text-xs font-semibold mt-0.5">In progress · Lesson 2 of 3</p>
          <div class="mt-2 h-2.5 bg-primary/15 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width:50%"></div></div></div>
          <div class="bg-primary text-white rounded-2xl px-3 py-1.5"><span class="font-display text-sm">GO →</span></div>
        </div>
      </div>`,document.getElementById("stages-list").classList.remove("hidden"),g("Demo mode — connect API for live progress","info",2500)}}L();
