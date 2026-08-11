/**
 * Screenshot one state of the scene, for visual review.
 *   node scripts/shot.mjs <url> <out.png> <w> <h> <mood> <none|hover|open|about>
 */
import { chromium } from "playwright";
const [,, url, out, w, h, mood, action] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
const errs = [];
p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
await p.goto(url, { waitUntil: "networkidle" });
// One toggle, which only exists in the garden; dawn is already the default.
if (mood && mood !== "dawn") {
  const toggle = p.getByRole("button", { name: `Switch to ${mood}` });
  if (await toggle.count()) await toggle.click();
}
if (action === "hover") await p.locator("button[aria-labelledby]").first().hover();
if (action === "open") await p.locator("button[aria-labelledby]").first().click();

await p.waitForTimeout(2600);
await p.screenshot({ path: out });
if (errs.length) console.log("CONSOLE ERRORS:\n" + errs.join("\n"));
else console.log("no console errors");
await b.close();
