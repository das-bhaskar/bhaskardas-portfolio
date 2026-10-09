/* ===========================================================
   BHASKAR OS — shared enhancement layer
   Additive only. Reads each page's OWN css variables so every
   effect wears that page's palette. Never overrides page themes.
   =========================================================== */
(() => {
  "use strict";

  const LS = {
    get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- read THIS page's palette, whatever it is ---- */
  const cs = getComputedStyle(document.documentElement);
  const pick = (...names) => {
    for (const n of names) {
      const v = cs.getPropertyValue(n).trim();
      if (v) return v;
    }
    return "#ff007f";
  };
  const THEME = {
    hot:  pick("--neon-pink", "--accent-pink", "--fire-red", "--venusaur-pink", "--accent-red", "--neon-mint"),
    cool: pick("--neon-cyan", "--sky-blue", "--bright-growth", "--neon-mint", "--lcd-screen", "--accent-gold"),
    ink:  pick("--text-white", "--text-main", "--ink-dark", "--ink")
  };

  let sound = LS.get("bos.sound", "off");
  let ctx;
  function blip(f = 440, ms = 70, type = "square") {
    if (sound !== "on") return;
    try {
      ctx = ctx || new (AudioContext || webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + ms / 1000);
    } catch {}
  }

  /* ---- POKEBALL RAIN: was skills-only + remote asset. Now site-wide + local ---- */
  function rain(count = 14, then) {
    if (reduced) { then && then(); return; }
    let layer = document.getElementById("bos-rain");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "bos-rain";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    layer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const b = document.createElement("i");
      b.className = "bos-ball";
      b.style.left = (Math.random() * 96) + "vw";
      b.style.animationDelay = (Math.random() * 0.28) + "s";
      b.style.width = b.style.height = (26 + Math.random() * 20) + "px";
      layer.appendChild(b);
    }
    blip(880, 60);
    setTimeout(() => { layer.innerHTML = ""; then && then(); }, 620);
  }

  /* ---- page transition on internal nav ---- */
  function wireTransition() {
    document.querySelectorAll('a[href$=".html"]').forEach(a => {
      if (a.target === "_blank" || a.dataset.noFx) return;
      a.addEventListener("click", e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        rain(14, () => (location.href = a.href));
      });
    });
  }

  /* ---- A WILD BUG APPEARED ---- */
  const BUGS = [
    ["A WILD RACE CONDITION APPEARED!", "You used MEASURE FIRST. It's super effective!"],
    ["A WILD SEQUENTIAL SCAN APPEARED!", "You used PARTIAL INDEX. 8.45s fainted!"],
    ["A WILD NULL POINTER APPEARED!", "It fled before anyone noticed."],
    ["A WILD OFF-BY-ONE APPEARED!", "It did 1 damage. Or 2. Hard to say."],
    ["A WILD CACHE INVALIDATION APPEARED!", "It's one of the two hard problems."]
  ];
  function encounter() {
    const [a, b] = BUGS[Math.floor(Math.random() * BUGS.length)];
    const box = document.createElement("div");
    box.className = "bos-encounter";
    box.innerHTML = `<b>${a}</b><span>${b}</span>`;
    document.body.appendChild(box);
    [392, 523, 659].forEach((f, i) => setTimeout(() => blip(f, 90), i * 90));
    requestAnimationFrame(() => box.dataset.show = "true");
    setTimeout(() => { box.dataset.show = "false"; setTimeout(() => box.remove(), 400); }, 4200);
  }

  /* ---- HUD ---- */
  function hud() {
    const h = document.createElement("div");
    h.id = "bos-hud";
    h.innerHTML = `
      <button id="bos-snd" aria-label="Toggle sound">SND ${sound === "on" ? "ON" : "OFF"}</button>
      <button id="bos-wild" aria-label="Trigger a wild encounter">WILD?</button>`;
    document.body.appendChild(h);
    h.querySelector("#bos-snd").onclick = e => {
      sound = sound === "on" ? "off" : "on";
      LS.set("bos.sound", sound);
      e.target.textContent = `SND ${sound === "on" ? "ON" : "OFF"}`;
      blip(660, 80);
    };
    h.querySelector("#bos-wild").onclick = encounter;
  }

  /* ---- konami ---- */
  const K = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let buf = [];
  function wireKonami() {
    addEventListener("keydown", e => {
      buf.push(e.key); buf = buf.slice(-K.length);
      if (buf.join().toLowerCase() === K.join().toLowerCase()) {
        buf = [];
        document.body.classList.add("bos-shiny");
        rain(40);
        [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>blip(f,120),i*110));
        const n = document.createElement("div");
        n.className = "bos-encounter"; n.dataset.show = "true";
        n.innerHTML = `<b>✦ SHINY MODE UNLOCKED ✦</b><span>Everything sparkles now. You earned this.</span>`;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 5000);
      }
    });
  }

  /* ---- blips on the page's own interactive elements ---- */
  function wireSound() {
    document.querySelectorAll("nav a, .retro-btn, .neon-btn, .btn-pixel, .skill-tag, .tile")
      .forEach(el => el.addEventListener("mouseenter", () => blip(620, 22)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.setProperty("--bos-hot", THEME.hot);
    document.documentElement.style.setProperty("--bos-cool", THEME.cool);
    hud(); wireTransition(); wireKonami(); wireSound();
    // 1-in-6 chance of a wild encounter on load, because why not
    if (!reduced && Math.random() < 0.17) setTimeout(encounter, 2600);
    window.BOS = { rain, encounter, blip };
  });
})();
