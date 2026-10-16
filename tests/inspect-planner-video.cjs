const { chromium } = require('C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('sharp');
(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
 await page.goto('file:///C:/Users/muham/Videos/Captures/Recording%202026-10-15%20210227.mp4');
 await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
 const duration = await page.locator('video').evaluate(v => { v.pause(); return v.duration; });
 console.log({ duration });
 const frames = [];
 for (let i=0;i<12;i++) {
  const time = i * (duration - 0.5) / 11;
  await page.locator('video').evaluate((v, time) => new Promise(resolve => { v.onseeked=resolve; v.currentTime=time + .01; }), time);
  const png = await page.locator('video').screenshot();
  await sharp(png).resize({width:480}).png().toFile(`artifacts/planner-refinement/video-${i}.png`);
  frames.push({input:await sharp(png).resize(480,300,{fit:'contain',background:'#111'}).png().toBuffer(),left:(i%3)*480,top:Math.floor(i/3)*330});
  const label=Buffer.from(`<svg width="480" height="30"><rect width="480" height="30" fill="#fff"/><text x="10" y="22" font-size="18">${time.toFixed(2)}s</text></svg>`);
  frames.push({input:label,left:(i%3)*480,top:Math.floor(i/3)*330+300});
 }
 await sharp({create:{width:1440,height:1320,channels:3,background:'#111'}}).composite(frames).png().toFile('artifacts/planner-refinement/video-contact-sheet.png');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

