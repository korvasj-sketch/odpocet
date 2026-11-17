/* ============================================================================
   â–¸ NASTAVENĂŤ â€” uprav tady â—‚
   ProhlĂ­ĹľeÄŤ / OBS: ÄŤas Ĺ™eĹˇĂ­Ĺˇ v URL (?t=10:00) nebo tĂ­mhle blokem.
   StreamElements: sem nesahej â€” vĹˇe se nastavuje v editoru widgetu
   (zĂˇloĹľka FIELDS, soubor streamelements/fields.json).
   ========================================================================== */
var DEFAULT_TIME   = "5:00";     // vĂ˝chozĂ­ ÄŤas: "90" (sekund), "5:00", "1:30:00"
var DEFAULT_LABEL  = "ZaÄŤĂ­nĂˇme za";  // nĂˇpis nad odpoÄŤtem ("" = jen ÄŤĂ­slice)
var DEFAULT_BG     = true;       // true = vlastnĂ­ pozadĂ­, false = prĹŻhlednĂ© (overlay)
var DEFAULT_SOUND  = true;       // true = pĂ­pnutĂ­ na konci
/* ========================================================================== */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var root = document.getElementById("odpocet") || document.body;  // koĹ™en widgetu (ve StreamElements jen div)
  var timeEl = $("time"), labelEl = $("label"), hintEl = $("hint"), panel = $("panel");
  var hh = $("hh"), mm = $("mm"), ss = $("ss"), labelIn = $("labelIn");
  var toggleBtn = $("toggleBtn"), resetBtn = $("resetBtn"), bgBtn = $("bgBtn"), soundBtn = $("soundBtn");

  /* ---------- nastavenĂ­ (localStorage + URL) ---------- */
  var settings = { label:DEFAULT_LABEL, total:parseDur(DEFAULT_TIME), bg:DEFAULT_BG, sound:DEFAULT_SOUND };
  try{
    var saved = JSON.parse(localStorage.getItem("odpocet_settings") || "{}");
    if (saved && typeof saved === "object") for (var k in settings) if (k in saved) settings[k] = saved[k];
  }catch(e){}
  function save(){ try{ localStorage.setItem("odpocet_settings", JSON.stringify(settings)); }catch(e){} }

  /* ---------- StreamElements: nastavenĂ­ widgetu (na streamu se nikdy neukĂˇĹľe) ----------
     Pole pĹ™idĂˇĹˇ v editoru widgetu (Custom â†’ Data). PodporovanĂˇ jmĂ©na polĂ­:
     time, label, bg, sound, autostart, loop */
  var inWidget = (typeof fieldData !== "undefined") || (typeof SE_API !== "undefined");
  function seField(n){
    try{
      if (typeof fieldData === "object" && fieldData && fieldData[n] != null && fieldData[n] !== "") return fieldData[n];
    }catch(e){}
    return null;
  }
  function seBool(n){ var v = seField(n); return v != null && /^(1|on|ano|yes|true)$/i.test(String(v)); }
  if (inWidget){
    var seT = seField("time");  if (seT != null) settings.total = parseDur(seT);
    var seL = seField("label"); if (seL != null) settings.label  = seL;
    var seB = seField("bg");    if (seB != null) settings.bg     = /^(1|on|ano|yes|true)$/i.test(String(seB));
    var seS = seField("sound"); if (seS != null) settings.sound  = /^(1|on|ano|yes|true)$/i.test(String(seS));
  }

  var q = new URLSearchParams(location.search);
  function flag(v, def){ return v == null ? def : !/^(0|off|ne|no|false)$/i.test(v); }
  function parseDur(s){
    s = String(s).trim();
    if (/^\d+$/.test(s)) return parseInt(s,10);
    var p = s.split(":").map(Number);
    if (!p.length || p.some(function(n){ return !isFinite(n); })) return 300;
    if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
    if (p.length === 2) return p[0]*60 + p[1];
    return 300;
  }

  var total = settings.total;                       // sekundy
  var urlTotal = null;
  if (q.get("t") != null) urlTotal = parseDur(q.get("t"));
  else if (q.get("h") != null || q.get("m") != null || q.get("s") != null)
    urlTotal = (+q.get("h")||0)*3600 + (+q.get("m")||0)*60 + (+q.get("s")||0);
  if (urlTotal != null && urlTotal > 0) total = urlTotal;   // z URL se neuklĂˇdĂˇ
  var urlLabel = q.get("label");
  var useBg     = flag(q.get("bg"),     settings.bg);
  var useSound  = flag(q.get("sound"),  settings.sound);
  var noControls = inWidget || !flag(q.get("controls"), true);  // widget/OBS: panel se NIKDY neukĂˇĹľe
  function truthy(v){ return v != null && /^(1|on|ano|yes|true)$/i.test(String(v)); }
  var autostart = q.get("autostart") != null ? truthy(q.get("autostart"))
                : (inWidget && seField("autostart") == null ? true : seBool("autostart"));
  var loopMode  = q.get("loop") != null ? truthy(q.get("loop")) : seBool("loop");

  /* ---------- stav ÄŤasovaÄŤe ---------- */
  var remainingMs = total * 1000, endsAt = 0, running = false, timer = null;
  var lastSec = -1, finished = false, loopT = null;

  /* ---------- vykreslovĂˇnĂ­ ÄŤĂ­slic ---------- */
  var digitSpans = [];
  (function build(){
    var chars = "00:00:00".split("");
    timeEl.innerHTML = chars.map(function(c){
      return '<span class="' + (c === ":" ? "c" : "d") + '">' + c + "</span>";
    }).join("");
    digitSpans = Array.prototype.slice.call(timeEl.querySelectorAll(".d"));
  })();
  function fmt(s){
    var h = Math.floor(s/3600), m = Math.floor((s%3600)/60), x = s%60;
    return [h,m,x].map(function(n){ return String(n).padStart(2,"0"); }).join("");
  }
  function render(){
    var s = Math.max(0, Math.ceil(remainingMs/1000));
    if (s === lastSec) return;
    lastSec = s;
    var f = fmt(s), changed = false;
    for (var i = 0; i < digitSpans.length; i++){
      var ch = f[i];
      if (digitSpans[i].textContent !== ch){ digitSpans[i].textContent = ch; changed = true; }
    }
    if (changed) document.title = f.slice(0,2) + ":" + f.slice(2,4) + ":" + f.slice(4) + " Â· odpoÄŤet";
    timeEl.classList.toggle("urgent", s <= 10 && s > 0 && !finished);
  }

  /* ---------- zvuk ---------- */
  var ac = null;
  function ensureAudio(){
    if (!useSound) return;
    try{
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume().catch(function(){});
    }catch(e){}
  }
  function beep(){
    if (!useSound) return;
    try{
      ensureAudio();
      if (!ac) return;
      var t0 = ac.currentTime;
      for (var i = 0; i < 3; i++){
        var o = ac.createOscillator(), g = ac.createGain(), t = t0 + i*0.3;
        o.type = "square"; o.frequency.value = (i % 2) ? 660 : 880;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + 0.27);
      }
    }catch(e){}
  }

  /* ---------- ovlĂˇdĂˇnĂ­ ---------- */
  function setFinishedLook(on){
    finished = on;
    root.classList.toggle("finished", on);
    labelEl.textContent = on ? "Konec" : labelIn.value.trim();
  }
  function start(){
    if (running) return;
    if (remainingMs <= 0) remainingMs = total * 1000;
    if (remainingMs <= 0) return;
    setFinishedLook(false);
    ensureAudio();
    endsAt = performance.now() + remainingMs;
    running = true;
    toggleBtn.innerHTML = "&#10074;&#10074; Pauza";
    tick();
    timer = setInterval(tick, 100);
  }
  function pause(){
    if (!running) return;
    remainingMs = Math.max(0, endsAt - performance.now());
    running = false; clearInterval(timer); timer = null;
    toggleBtn.innerHTML = "&#9654; Start";
    render();
  }
  function reset(){
    running = false; clearInterval(timer); timer = null; clearTimeout(loopT);
    remainingMs = total * 1000; lastSec = -1;
    setFinishedLook(false);
    toggleBtn.innerHTML = "&#9654; Start";
    render();
  }
  function finish(){
    running = false; clearInterval(timer); timer = null;
    remainingMs = 0; lastSec = -1;
    toggleBtn.innerHTML = "&#9654; Start";
    setFinishedLook(true);
    render();
    beep();
    if (loopMode) loopT = setTimeout(function(){ reset(); start(); }, 2500);
  }
  function tick(){
    if (!running) return;
    remainingMs = endsAt - performance.now();
    if (remainingMs <= 0){ finish(); return; }
    render();
  }

  /* ---------- panel: ÄŤas, presety, nĂˇpis ---------- */
  function inputsToTotal(){
    var t = (+hh.value||0)*3600 + (+mm.value||0)*60 + (+ss.value||0);
    total = Math.max(0, t);
    if (!running){ remainingMs = total * 1000; lastSec = -1; setFinishedLook(false); render(); }
    settings.total = total; save();
  }
  function totalToInputs(t){
    hh.value = Math.floor(t/3600);
    mm.value = Math.floor((t%3600)/60);
    ss.value = t%60;
  }
  [hh,mm,ss].forEach(function(el){
    el.addEventListener("change", inputsToTotal);
    el.addEventListener("input", function(){
      var v = parseInt(el.value,10);
      if (isFinite(v)){
        var max = +el.max;
        if (v > max) el.value = max;
        if (v < 0) el.value = 0;
      }
    });
  });
  $("presets").addEventListener("click", function(e){
    var b = e.target.closest("button[data-s]");
    if (!b) return;
    total = +b.dataset.s;
    totalToInputs(total);
    reset();
    settings.total = total; save();
  });

  labelIn.addEventListener("input", function(){
    settings.label = labelIn.value; save();
    if (!finished) labelEl.textContent = labelIn.value.trim();
  });

  toggleBtn.addEventListener("click", function(){ running ? pause() : start(); });
  resetBtn.addEventListener("click", reset);

  bgBtn.addEventListener("click", function(){
    useBg = !useBg; settings.bg = useBg; save(); applyBg();
  });
  soundBtn.addEventListener("click", function(){
    useSound = !useSound; settings.sound = useSound; save(); applySound();
    if (useSound) ensureAudio();
  });
  function applyBg(){
    root.classList.toggle("transparent", !useBg);
    bgBtn.setAttribute("aria-pressed", String(useBg));
  }
  function applySound(){
    soundBtn.setAttribute("aria-pressed", String(useSound));
  }

  /* ---------- klĂˇvesnice ---------- */
  document.addEventListener("keydown", function(e){
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.code === "Space"){ e.preventDefault(); running ? pause() : start(); }
    else if (e.key === "r" || e.key === "R" || e.key === "Ĺ™" || e.key === "Ĺ"){ e.preventDefault(); reset(); }
    /* â†‘ / â†“ â€” Â±1 min (Shift = Â±10 s); za bÄ›hu posune konec, jinak restart.
       Panel se tĂ­m NIKDY neukĂˇĹľe â€” v overlayi se ÄŤas mÄ›nĂ­ jen takhle nebo
       pĹ™es nastavenĂ­ widgetu (StreamElements) / URL (OBS). */
    else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
      e.preventDefault();
      var step = (e.shiftKey ? 10 : 60) * (e.key === "ArrowDown" ? -1 : 1);
      total = Math.max(0, total + step);
      totalToInputs(total);
      if (running){
        endsAt += step * 1000;
        remainingMs = endsAt - performance.now();
        if (remainingMs <= 0) finish();
        else { lastSec = -1; render(); }
      } else {
        remainingMs = total * 1000; lastSec = -1; setFinishedLook(false); render();
      }
      settings.total = total; save();
    }
  });

  /* ---------- samoĂşkrytĂ­ panelu ---------- */
  var hideT = null;
  function poke(){
    panel.classList.remove("hidden");
    clearTimeout(hideT);
    hideT = setTimeout(function(){ panel.classList.add("hidden"); }, 3500);
  }
  ["mousemove","mousedown","keydown","touchstart","wheel"].forEach(function(ev){
    window.addEventListener(ev, poke, {passive:true});
  });

  /* ---------- StreamElements: pole pĹ™ijdou udĂˇlostĂ­ onWidgetLoad ---------- */
  function applyFieldsLive(fd){
    if (!fd) return;
    if (fd.time != null && fd.time !== ""){
      var t = parseDur(fd.time);
      if (t > 0 && t !== total){         /* jen kdyĹľ se ÄŤas liĹˇĂ­ â€” jinak by se rozbÄ›h odpoÄŤet znovu */
        total = t; totalToInputs(total); lastSec = -1;
        remainingMs = total * 1000;
        if (running) endsAt = performance.now() + remainingMs;
      }
    }
    if (fd.label != null){
      settings.label = String(fd.label); labelIn.value = settings.label;
      if (!finished) labelEl.textContent = settings.label.trim();
    }
    if (fd.bg    != null){ useBg    = truthy(fd.bg);    settings.bg    = useBg; }
    if (fd.sound != null){ useSound = truthy(fd.sound); settings.sound = useSound; }
    if (fd.autostart != null) autostart = truthy(fd.autostart);
    if (fd.loop      != null) loopMode  = truthy(fd.loop);
    applyBg(); applySound(); render();
    if (booted && autostart && !running && !finished) start();
  }

  var booted = false;
  function boot(){
    if (booted) return;
    booted = true;
    if (urlLabel != null) labelIn.value = urlLabel;
    else labelIn.value = settings.label;
    totalToInputs(total);
    applyBg(); applySound();
    if (noControls) root.classList.add("nocontrols");
    else poke();
    labelEl.textContent = labelIn.value.trim();
    render();
    if (autostart) start();
  }
  window.addEventListener("onWidgetLoad", function(obj){
    /* tato udĂˇlost pĹ™ichĂˇzĂ­ JEN ve StreamElements â†’ panel tam nikdy nevidÄ›t */
    root.classList.add("nocontrols");
    try{ applyFieldsLive(obj && obj.detail ? obj.detail.fieldData : null); }catch(e){}
    boot();
  });
  /* mimo StreamElements startujeme hned; ve widgetu ÄŤekĂˇme na onWidgetLoad
     (zĂˇloĹľnĂ­ start po 1,5 s, kdyby event nepĹ™iĹˇel) */
  if (!inWidget) boot();
  else setTimeout(boot, 1500);
})();
