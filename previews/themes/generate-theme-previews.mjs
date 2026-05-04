import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");
const pageUrl = `file://${path.join(root, "index.html")}`;

const themes = [
  {
    name: "terracotta-ink",
    vars: {
      "--bg": "#f6f1e8",
      "--fg": "#1f1a17",
      "--muted": "#8b7c6b",
      "--subtle": "#7b6e5d",
      "--accent": "#d96a34",
      "--line": "#ddd4c8",
      "--card": "#fffaf3"
    }
  },
  {
    name: "sage-clay",
    vars: {
      "--bg": "#f2f4ef",
      "--fg": "#1d241f",
      "--muted": "#7a867d",
      "--subtle": "#6f7a72",
      "--accent": "#c7683f",
      "--line": "#d5ddd3",
      "--card": "#fcfdf9"
    }
  },
  {
    name: "sand-cobalt",
    vars: {
      "--bg": "#f5f0e6",
      "--fg": "#1a1d29",
      "--muted": "#7f7a70",
      "--subtle": "#726d62",
      "--accent": "#2f5bd3",
      "--line": "#ddd6ca",
      "--card": "#fffaf0"
    }
  },
  {
    name: "charcoal-paper",
    vars: {
      "--bg": "#ece9e2",
      "--fg": "#151515",
      "--muted": "#6f6b64",
      "--subtle": "#625e57",
      "--accent": "#b85c38",
      "--line": "#cfc8bc",
      "--card": "#f8f4ec"
    }
  }
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 2200 } });

for (let i = 0; i < themes.length; i += 1) {
  const theme = themes[i];
  const page = await context.newPage();
  await page.goto(pageUrl, { waitUntil: "load" });

  const cssVars = Object.entries(theme.vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");

  await page.addStyleTag({
    content: `
      :root { ${cssVars} }
      #blob { transform: translate3d(55vw, 35vh, 0) translate(-50%, -50%) !important; }
    `
  });

  await page.waitForTimeout(500);

  const filename = `theme-0${i + 1}-${theme.name}.png`;
  await page.screenshot({
    path: path.join(__dirname, filename),
    fullPage: true
  });

  await page.close();
}

await browser.close();
