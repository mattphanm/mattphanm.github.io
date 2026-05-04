const blob = document.getElementById("blob");
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;
let revealChars = [];

function setupBubbleRevealChars() {
  const targets = document.querySelectorAll(".hero-reveal");
  targets.forEach((target) => {
    const text = target.textContent || "";
    target.textContent = "";
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "hero-reveal-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      target.appendChild(span);
      if (ch !== " ") revealChars.push(span);
    }
  });
}

function updateBubbleReveal() {
  if (!blob || revealChars.length === 0) return;
  const blobRect = blob.getBoundingClientRect();
  const cx = blobRect.left + blobRect.width / 2;
  const cy = blobRect.top + blobRect.height / 2;
  const radius = blobRect.width * 0.52;
  const radiusSq = radius * radius;

  revealChars.forEach((ch) => {
    const r = ch.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    ch.classList.toggle("in-bubble", dx * dx + dy * dy <= radiusSq);
  });
}

setupBubbleRevealChars();

window.addEventListener(
  "pointermove",
  (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  },
  { passive: true }
);

function animateBlob() {
  currentX += (targetX - currentX) * 0.14;
  currentY += (targetY - currentY) * 0.14;
  blob.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
  updateBubbleReveal();
  requestAnimationFrame(animateBlob);
}

requestAnimationFrame(animateBlob);

let tick = 0;
const handL = document.getElementById("hand-l");
const handR = document.getElementById("hand-r");
const armL = document.getElementById("arm-l");
const armR = document.getElementById("arm-r");
const scursor = document.getElementById("scursor");
const lampGlow = document.getElementById("lamp-glow");
const steam1 = document.getElementById("steam1");
const steam2 = document.getElementById("steam2");
const screenLines = ["sl1", "sl2", "sl3", "sl4"];

setInterval(() => {
  tick++;
  const even = tick % 2 === 0;

  handL.setAttribute("cy", even ? "119" : "116");
  handR.setAttribute("cy", even ? "116" : "119");
  armL.setAttribute("y2", even ? "119" : "116");
  armR.setAttribute("y2", even ? "116" : "119");
  scursor.setAttribute("opacity", even ? "1" : "0");

  const idx = tick % 4;
  const lineEl = document.getElementById(screenLines[idx]);
  if (lineEl) {
    lineEl.setAttribute("width", String(16 + ((tick * 13) % 46)));
  }

  lampGlow.setAttribute("rx", String(20 + (tick % 3)));

  const sy = -4 + (tick % 4);
  steam1.setAttribute("d", `M156 111 Q${158 + (tick % 3)} ${107 + sy} ${156 + (tick % 2)} ${103 + sy}`);
  steam2.setAttribute("d", `M162 111 Q${164 + (tick % 2)} ${107 + sy} ${162 + (tick % 3)} ${103 + sy}`);
}, 200);

setInterval(() => {
  const t = Date.now();
  const ev = Math.round(t / 200) % 2 === 0;
  const ol = document.getElementById("ohl");
  const or_ = document.getElementById("ohr");
  if (ol) {
    ol.setAttribute("cy", ev ? "87" : "84");
  }
  if (or_) {
    or_.setAttribute("cy", ev ? "84" : "87");
  }
  const os = ["osl1", "osl2", "osl3", "osl4"];
  const oi = Math.round(t / 200) % 4;
  const oel = document.getElementById(os[oi]);
  if (oel) {
    oel.setAttribute("width", String(14 + ((Math.round(t / 200) * 7) % 26)));
  }
}, 200);

const scripts = {
  work: [
    { txt: '<span class="c-orange">import</span> { projects } <span class="c-orange">from</span> <span class="c-green">"./work"</span>', d: 0 },
    { txt: '<span class="c-blue">const</span> items = <span class="c-yellow">fetchAll</span>()', d: 120 },
    { txt: '<span class="c-gray">// PolyBuys · VeggieRescue</span>', d: 230 },
    { txt: '<span class="c-gray">// STARLY.AI · AI-Trade</span>', d: 330 },
    { txt: '<span class="c-green">✓ 4 projects loaded</span>', d: 450 }
  ],
  exp: [
    { txt: '<span class="c-orange">import</span> { timeline } <span class="c-orange">from</span> <span class="c-green">"./exp"</span>', d: 0 },
    { txt: '<span class="c-blue">const</span> roles = <span class="c-yellow">getExperience</span>()', d: 120 },
    { txt: '<span class="c-gray">// STARLY · VeggieRescue</span>', d: 240 },
    { txt: '<span class="c-gray">// PolyBuys · Codebox</span>', d: 340 },
    { txt: '<span class="c-green">✓ experience ready</span>', d: 460 }
  ],
  about: [
    { txt: '<span class="c-orange">import</span> { bio } <span class="c-orange">from</span> <span class="c-green">"./matthew"</span>', d: 0 },
    { txt: '<span class="c-blue">const</span> me = { name: <span class="c-green">"Matthew"</span> }', d: 130 },
    { txt: '<span class="c-gray">// stocks · building · SLO</span>', d: 260 },
    { txt: '<span class="c-green">✓ about page ready</span>', d: 400 }
  ]
};

let busy = false;
let current = null;

function navigateTo(id, btn) {
  if (busy || id === current) return;
  const target = document.getElementById(id);
  if (!target) return;
  busy = true;

  const overlay = document.getElementById("code-overlay");
  const codeOut = document.getElementById("code-output");

  overlay.classList.add("visible");
  codeOut.innerHTML = '<span id="cursor-blink"></span>';

  const lines = scripts[id] || scripts.work;
  let i = 0;

  function finishNavigate() {
    setTimeout(() => {
      overlay.classList.remove("visible");
      document.querySelectorAll(".sec-btn").forEach((b) => b.classList.remove("active"));
      if (btn) btn.classList.add("active");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      current = id;
      busy = false;
    }, 280);
  }

  function nextLine() {
    if (i >= lines.length) {
      finishNavigate();
      return;
    }

    const line = lines[i];
    const delay = i === 0 ? 0 : line.d - lines[i - 1].d;
    i++;

    setTimeout(() => {
      const cursor = document.getElementById("cursor-blink");
      const span = document.createElement("span");
      span.className = "code-line";
      span.innerHTML = line.txt;
      if (cursor) {
        codeOut.insertBefore(span, cursor);
      } else {
        codeOut.appendChild(span);
      }
      nextLine();
    }, delay);
  }

  nextLine();
}

function toggleDetail(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "block" ? "none" : "block";
}

window.navigateTo = navigateTo;
window.toggleDetail = toggleDetail;
