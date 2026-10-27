const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const catalog=require('../lib/travel-artwork.json');
const base=process.env.APP_BASE_URL||'http://localhost:3100';
const out='artifacts/illustration-generation';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const assets=[];
 for(const entry of Object.values(catalog))for(const theme of ['light','dark']){
  const url=`/illustrations/${theme}/${entry.filename}-${theme}.webp`;
  const response=await fetch(base+url,{method:'HEAD'});
  assert.equal(response.status,200,url);assert.match(response.headers.get('content-type'),/image\/webp/);
  assert.ok(entry.alt.length>35);assets.push({url,status:response.status,alt:entry.alt});
 }
 assert.equal(assets.length,24);
 const browser=await chromium.launch({channel:'msedge',headless:true});const checks=[];
 try{
  for(const theme of ['light','dark']){
   const c=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce',colorScheme:theme});
   await c.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
   const page=await c.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#dream-trip').waitFor();
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:width===390?844:720});
    for(const section of ['templates','destinations']){
     await page.locator('#'+section).scrollIntoViewIfNeeded();
     await page.waitForFunction(id=>[...document.querySelectorAll('#'+id+' img')].every(img=>img.complete&&img.naturalWidth>0),section);
     const alt=await page.locator('#'+section+' img').evaluateAll(imgs=>imgs.filter(img=>getComputedStyle(img).display!=='none').every(img=>img.alt.length>35));
     assert.equal(alt,true,'Descriptive image alt text');
     await page.locator('#'+section).screenshot({path:`${out}/${section}-${theme}-${width}.png`});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
   assert.equal(await page.locator('input[type=file]').count(),0);
   await page.goto(base+'/sign-in',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>[...document.querySelectorAll('.tc-auth-photo img')].length===2&&[...document.querySelectorAll('.tc-auth-photo img')].every(img=>img.complete&&img.naturalWidth>0));
   const fitted=await page.locator('.tc-auth-photo').evaluate(parent=>{const p=parent.getBoundingClientRect();const child=parent.querySelector('div').getBoundingClientRect();return Math.abs(p.width-child.width)<1&&Math.abs(p.height-child.height)<1;});
   assert.equal(fitted,true,'Paired auth artwork fills its container');
   await page.locator('.tc-auth-story').screenshot({path:`${out}/auth-${theme}.png`});
   await page.goto(`http://127.0.0.1:3202/dashboard?theme=${theme}`);
   await page.locator('.dashboard-trip-card').first().waitFor();
   await page.waitForFunction(()=>[...document.querySelectorAll('.dashboard-trip-image img')].every(img=>img.complete&&img.naturalWidth>0));
   const layers=await page.locator('.dashboard-trip-image').first().locator('img').evaluateAll(imgs=>imgs.map(img=>({opacity:Number(getComputedStyle(img).opacity),src:img.src,alt:img.alt})));
   assert.equal(layers.filter(layer=>layer.opacity===1).length,1);
   assert.ok(layers.find(layer=>layer.opacity===1).src.includes(`-${theme}.webp`));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${out}/dashboard-${theme}.png`,fullPage:true});
   assert.deepEqual(errors,[]);checks.push({theme,homeWidths:[390,1280],allImagesLoaded:true,descriptiveAlt:true,authArtworkFits:true,dashboardThemePair:true,noRuntimeErrors:true});
   await c.close();
  }
  fs.writeFileSync(out+'/browser-verification.json',JSON.stringify({assets,checks},null,2));
  console.log('All 24 image URLs, descriptive alt text, mobile/laptop Home, auth artwork and isolated dashboard theme pairs passed.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
