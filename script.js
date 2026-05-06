const blob = document.getElementById("blob");
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;
let revealChars = [];
let blobEnabled = false;
const heroHeading = document.getElementById("hero-heading");
const revealRadius = 104;

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
  if (!blobEnabled || revealChars.length === 0) return;
  const cx = currentX;
  const cy = currentY;
  const radiusSq = revealRadius * revealRadius;

  revealChars.forEach((ch) => {
    const r = ch.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    ch.classList.toggle("in-bubble", dx * dx + dy * dy <= radiusSq);
  });
}

function isInsideHeroHeadingZone(x, y) {
  if (!heroHeading) return false;
  const rect = heroHeading.getBoundingClientRect();
  const padX = 150;
  const padY = 110;
  return (
    x >= rect.left - padX &&
    x <= rect.right + padX &&
    y >= rect.top - padY &&
    y <= rect.bottom + padY
  );
}

setupBubbleRevealChars();

window.addEventListener(
  "pointermove",
  (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    blobEnabled = isInsideHeroHeadingZone(e.clientX, e.clientY);
  },
  { passive: true }
);

function animateBlob() {
  currentX += (targetX - currentX) * 0.14;
  currentY += (targetY - currentY) * 0.14;
  updateBubbleReveal();
  requestAnimationFrame(animateBlob);
}

requestAnimationFrame(animateBlob);

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
let activeTerminalIndex = -1;
const terminalInput = document.getElementById("terminal-command");
const terminalOptions = document.getElementById("terminal-options");
const terminalStatus = document.getElementById("terminal-status");
const terminalButtons = Array.from(document.querySelectorAll(".terminal-option"));
const commandMap = {
  "/projects": { id: "work", label: "/projects" },
  "/project": { id: "work", label: "/projects" },
  "/experiences": { id: "exp", label: "/experiences" },
  "/experience": { id: "exp", label: "/experiences" },
  "/about": { id: "about", label: "/about" }
};

function setTerminalOpen(open) {
  if (!terminalOptions || !terminalInput) return;
  terminalOptions.classList.toggle("open", open);
  terminalInput.setAttribute("aria-expanded", open ? "true" : "false");
}

function setTerminalStatus(message) {
  if (terminalStatus) terminalStatus.textContent = message;
}

function setHighlightedOption(index) {
  activeTerminalIndex = index;
  terminalButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function setActiveCommand(command) {
  const index = terminalButtons.findIndex((button) => button.dataset.command === command);
  setHighlightedOption(index);
}

function moveTerminalSelection(direction) {
  if (!terminalButtons.length) return;
  const nextIndex =
    activeTerminalIndex === -1
      ? direction > 0
        ? 0
        : terminalButtons.length - 1
      : (activeTerminalIndex + direction + terminalButtons.length) % terminalButtons.length;
  setHighlightedOption(nextIndex);
  terminalInput.value = terminalButtons[nextIndex].dataset.command || "";
}

function navigateTo(id, btn) {
  if (busy) return;
  const target = document.getElementById(id);
  if (!target) return;
  const selectedCommand = btn?.dataset.command || Object.keys(commandMap).find((command) => commandMap[command].id === id);
  const isCurrent = id === current;
  if (selectedCommand) setActiveCommand(selectedCommand);
  if (isCurrent) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTerminalOpen(false);
    setTerminalStatus(`Already at ${selectedCommand || id}`);
    return;
  }
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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      current = id;
      terminalInput.value = "";
      setHighlightedOption(-1);
      setTerminalOpen(false);
      if (selectedCommand) {
        setTerminalStatus(`Opening ${selectedCommand}`);
      }
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

function runTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  const match = commandMap[command];
  if (!match) {
    setTerminalStatus(`Unknown command: ${rawCommand.trim() || "empty input"}`);
    setHighlightedOption(-1);
    setTerminalOpen(true);
    return;
  }
  const button = terminalButtons.find((item) => item.dataset.command === match.label) || null;
  setTerminalOpen(false);
  navigateTo(match.id, button);
}

if (terminalInput && terminalOptions) {
  terminalInput.addEventListener("focus", () => {
    setTerminalOpen(true);
    setTerminalStatus("Select a command or press Enter.");
  });

  terminalInput.addEventListener("input", () => {
    const value = terminalInput.value.trim().toLowerCase();
    const hasSlash = value.startsWith("/");
    setTerminalOpen(hasSlash || value.length === 0);
    setActiveCommand(value);
  });

  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setTerminalOpen(true);
      moveTerminalSelection(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setTerminalOpen(true);
      moveTerminalSelection(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeTerminalIndex >= 0) {
        const command = terminalButtons[activeTerminalIndex]?.dataset.command || terminalInput.value;
        terminalInput.value = command;
        runTerminalCommand(command);
        return;
      }
      runTerminalCommand(terminalInput.value);
    }
    if (event.key === "Escape") {
      setTerminalOpen(false);
      terminalInput.blur();
    }
  });

  terminalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.command || "";
      terminalInput.value = command;
      runTerminalCommand(command);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const insideTerminal =
      target instanceof Element &&
      (target.closest(".terminal-launcher") || target === terminalInput);
    if (!insideTerminal) setTerminalOpen(false);
  });
}

function toggleDetail(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "block" ? "none" : "block";
}

window.navigateTo = navigateTo;
window.toggleDetail = toggleDetail;
