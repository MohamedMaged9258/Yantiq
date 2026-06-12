import"./storage-CSc0t46S.js";import"./animations-CD3NMRZt.js";function f(a,s){!s||!a||(s.innerHTML="",a.forEach(t=>{const n=t.stages.filter(c=>{var p;return(p=c.progress)==null?void 0:p.completed}).length,e=t.stages.length,d=e?Math.round(n/e*100):0,o=t.stages.some(c=>c.progress&&!c.progress.completed),r=n===0&&t.number>1,i=document.createElement("div");i.className=`level-card ${r?"locked":""} mb-3`,r||(i.style.cursor="pointer"),i.innerHTML=`
      <div class="p-4 pb-0 flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center font-display text-white text-lg flex-shrink-0"
             style="background:${r?"#C5BDB0":l(t.number)}">
          ${r?"🔒":t.number}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-gray-900 text-base leading-tight">${t.nameEn} — <span class="font-arabic text-primary text-lg" style="direction:rtl">${t.nameAr}</span></p>
          <p class="text-xs font-bold mt-0.5 ${o?"text-primary":"text-gray-400"}">${o?"✓ In Progress":r?"Complete previous level first":`${n}/${e} stages done`}</p>
        </div>
        ${o?`<div class="flex gap-0.5">${m(t)}</div>`:""}
      </div>
      ${o?`
        <div class="px-4 pb-4 mt-2">
          <div class="flex justify-between text-xs font-bold text-gray-400 mb-1.5"><span>${n} of ${e} stages</span><span>${d}%</span></div>
          <div class="progress-track h-2.5"><div class="progress-fill" style="width:${d}%"></div></div>
        </div>`:""}
    `,r||(i.onclick=()=>{window.location.href=`./lesson.html?level=${t.id}`}),s.appendChild(i)}))}function g(a,s,t){if(!s)return;const n=Math.max(...a.map(e=>e.totalMinutes),1);s.innerHTML="",t&&(t.innerHTML=""),a.forEach(e=>{const d=Math.max(4,Math.round(e.totalMinutes/n*100)),o=document.createElement("div");o.className="flex-1 flex flex-col items-center gap-1.5 group";const r=document.createElement("div");r.className=`w-full rounded-t-xl transition-all duration-700 ease-out relative min-h-1 ${e.isToday?"bg-primary":"bg-primary-100"}`,r.style.height="0%";const i=document.createElement("div");if(i.className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10",i.textContent=`${e.totalMinutes}m`,r.appendChild(i),o.appendChild(r),s.appendChild(o),t){const c=document.createElement("div");c.className=`flex-1 text-[10px] font-extrabold uppercase tracking-wider text-center ${e.isToday?"text-primary":"text-gray-300"}`,c.textContent=e.label,t.appendChild(c)}setTimeout(()=>{r.style.height=`${d}%`},100+a.indexOf(e)*80)})}function h(){const a=["Mon","Tue","Wed","Thu","Fri","Sat","Today"],s=[8,14,10,18,15,11,12];return a.map((t,n)=>({label:t,totalMinutes:s[n],starsEarned:Math.floor(s[n]/5),isToday:n===6,sessionCount:Math.floor(s[n]/8),avgAccuracy:Math.round(80+Math.random()*15)}))}function l(a){return["","#0A5744","#D4940E","#0D7055","#8B5CF6","#D4940E"][a]||"#0A5744"}function m(a){const s=a.stages.reduce((e,d)=>{var o;return e+(((o=d.progress)==null?void 0:o.stars)||0)},0),t=a.stages.length*3,n=Math.min(3,Math.round(s/t*3));return"⭐".repeat(n)+'<span class="text-gray-200">⭐</span>'.repeat(3-n)}export{h as getMockWeeklyData,f as renderLevelCards,g as renderWeeklyChart};
