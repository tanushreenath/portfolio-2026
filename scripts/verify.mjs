/**
 * Behavioural checks that a typecheck cannot catch: tab order, keyboard
 * navigation, the no-scroll guarantee, inert scenery, and reduced motion.
 *
 * Requires the dev server: npm run dev -- --port 5199 --strictPort
 * Then:                    node scripts/verify.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.URL ?? "http://localhost:5199";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));

const garden = () => p.goto(BASE + "/", { waitUntil: "networkidle" });

// 1. Tab order and accessible names
await garden();
const names = [];
for (let i = 0; i < 8; i++) {
  await p.keyboard.press("Tab");
  const n = await p.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const labelled = a.getAttribute("aria-labelledby");
    const text = labelled
      ? document.getElementById(labelled)?.textContent
      : a.textContent;
    return (a.getAttribute("aria-label") || text || "").trim().slice(0, 48);
  });
  if (n) names.push(n);
}
console.log("TAB ORDER:");
names.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));

// 2. Keyboard navigation: Enter on an object routes, and back returns
await garden();
await p.keyboard.press("Tab");
await p.keyboard.press("Enter");
await p.waitForTimeout(400);
const routed = new URL(p.url()).pathname;
const heading = await p.locator("h1").first().textContent().catch(() => null);
await p.goBack();
await p.waitForTimeout(400);
const returned = new URL(p.url()).pathname;
const objectsAfterBack = await p.locator("button[aria-labelledby]").count();
console.log(
  `\nKEYBOARD: Enter -> ${routed} (h1=${JSON.stringify(heading)}) ` +
    `-> goBack -> ${returned}, objects restored=${objectsAfterBack === 3}`
);

// 3. The scene must never scroll
await garden();
const scroll = await p.evaluate(() => {
  window.scrollTo(0, 500);
  return {
    y: window.scrollY,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  };
});
console.log(`NO SCROLL: scrollY=${scroll.y} horizontalOverflow=${scroll.overflowX}`);

// 4. Scenery is inert. Dev serves rewritten asset URLs, so inspect the DOM.
const scenery = await p.evaluate(() => {
  const els = [...document.querySelectorAll('div[aria-hidden="true"]')].filter((d) =>
    d.querySelector("img")
  );
  return els.map((d) => ({
    pointerEvents: getComputedStyle(d).pointerEvents,
    insideButton: d.closest("button") !== null,
    animation: getComputedStyle(d.querySelector('[class*="sway"]')).animationName,
  }));
});
console.log(`SCENERY INERT: ${JSON.stringify(scenery)}`);

// 5. One button per destination, and the cluster answers as one
const grouping = await p.evaluate(() =>
  [...document.querySelectorAll("button[aria-labelledby]")].map((btn) => ({
    name: document.getElementById(btn.getAttribute("aria-labelledby"))?.textContent.trim(),
    paintings: btn.querySelectorAll("img").length,
  }))
);
console.log(`OBJECTS: ${JSON.stringify(grouping)}`);

// 6. No cursor-driven parallax remains
const parallax = await p.evaluate(() => {
  const before = getComputedStyle(document.documentElement).getPropertyValue("--mouse-x");
  return { mouseVar: before.trim() || "(unset)" };
});
console.log(`PARALLAX: --mouse-x=${parallax.mouseVar}`);

// 7. Reduced motion
const p2 = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await p2.goto(BASE + "/", { waitUntil: "networkidle" });
await p2.waitForTimeout(600);
const count = await p2.locator("button[aria-labelledby]").count();
const op = await p2.evaluate(
  () => getComputedStyle(document.querySelector("button[aria-labelledby]")).opacity
);
console.log(`REDUCED MOTION: objects=${count} firstOpacity=${op}`);

console.log(errs.length ? "\nPAGE ERRORS: " + errs.join("; ") : "\nno page errors");
await b.close();
