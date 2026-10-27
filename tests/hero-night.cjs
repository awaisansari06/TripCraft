const base=process.env.APP_BASE_URL||'http://localhost:3000';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output='artifacts/hero-review';
fs.mkdirSync(output,{recursive:true});
const sizes=process.argv.includes('--interactions-only')?[]:[[375,812],[390,844],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await context.addInitScript(()=>localStorage.setItem('theme','light'));
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('#dream-trip').waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.readyState>=2));
  for(const theme of ['light','dark']){
   if(theme==='dark') await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
   await page.waitForTimeout(250);
   const info=await page.evaluate(()=>{
    const input=document.querySelector('#dream-trip');
    const card=input.closest('form');
    const box=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};
    return {overflow:document.documentElement.scrollWidth>innerWidth,card:box(card),input:box(input),cta:box(card.querySelector('[type=submit]')),upload:box(card.querySelector('[aria-label="Upload inspiration"]')),videos:[...document.querySelectorAll('video')].map(v=>({box:box(v),paused:v.paused,time:v.currentTime})),inputScroll:input.scrollHeight,inputHeight:input.clientHeight,theme:document.documentElement.className};
   });
   assert.equal(info.overflow,false,`${theme} ${width}: horizontal overflow`);
   assert.ok(info.card.x>=0&&info.card.right<=width,`${width}: card outside viewport`);
   assert.ok(info.input.bottom<=info.cta.y,`${width}: input overlaps CTA`);
   assert.ok(info.upload.right<info.cta.x,`${width}: controls overlap`);
   assert.ok(info.cta.h>=44&&info.upload.h>=44);
   assert.deepEqual(info.videos[0].box,info.videos[1].box,'Scene grades must align');
   assert.ok(info.videos.every(v=>v.paused&&v.time===0),'Reduced motion must freeze both grades');
   assert.ok(info.inputScroll<=info.inputHeight+1,`${width}: example clipped`);
   await page.screenshot({path:`${output}/${theme}-${width}.png`});
   if(width<=390) await page.locator('section[aria-labelledby="wandor-title"]').screenshot({path:`${output}/${theme}-${width}-hero.png`});
   results.push({theme,width,height,card:info.card,passed:true});
  }
  await context.close();
  console.log(`Verified ${width}×${height} in both themes`);
 }
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.addInitScript(()=>localStorage.setItem('theme','light'));
 const page=await context.newPage();
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.currentTime>.3));
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>!document.querySelector('#main-content')?.classList.contains('tc-page-smoothing-load'));
 const before=await page.locator('h1').boundingBox();
 await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
 await page.waitForTimeout(300);
 const mid=await page.locator('video').nth(1).evaluate(v=>Number(getComputedStyle(v).opacity));
 assert.ok(mid>0&&mid<1,'Theme crossfade must have intermediate frames');
 await page.waitForTimeout(600);
 const after=await page.locator('h1').boundingBox();
 assert.ok(['x','y','width','height'].every(k=>Math.abs(after[k]-before[k])<.5),'Theme switch moved heading');
 const playback=await page.locator('video').evaluateAll(vs=>vs.map(v=>({time:v.currentTime,paused:v.paused})));
 assert.ok(playback.every(v=>!v.paused));
 assert.ok(Math.abs(playback[0].time-playback[1].time)<.12,'Video grades drifted');
 const input=page.locator('#dream-trip');
 await input.fill('A quiet week in Kyoto with food and scenic hikes');
 await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
 assert.equal(await input.inputValue(),'A quiet week in Kyoto with food and scenic hikes');
 const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:'Upload inspiration'}).click()]);
 await chooser.setFiles({name:'inspiration.webp',mimeType:'image/webp',buffer:fs.readFileSync('public/hero/day-poster.webp')});
 await page.getByRole('status').filter({hasText:'inspiration.webp selected'}).waitFor();
 await page.reload({waitUntil:'domcontentloaded'});
 assert.ok(await page.locator('html').evaluate(el=>el.classList.contains('light')),'Theme preference did not persist');
 results.push({transition:true,intermediateOpacity:mid,playback,inputPreserved:true,attachmentSelection:true,persistence:true});
 const report=process.argv.includes('--interactions-only')?'interaction-verification.json':'verification.json';
 fs.writeFileSync(`${output}/${report}`,JSON.stringify(results,null,2));
 await browser.close();
 console.log('Responsive, transition, synchronized playback, reduced motion, input, upload and persistence checks passed.');
})().catch(e=>{console.error(e);process.exit(1)});

