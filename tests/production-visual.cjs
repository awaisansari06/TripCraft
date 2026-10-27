const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const phase=process.argv[2]||'baseline',base=process.env.APP_BASE_URL||'http://localhost:3100';
const dir=`artifacts/production-audit/${phase}`;fs.mkdirSync(dir,{recursive:true});
const sizes=[[375,812],[390,844],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
 for(const theme of ['light','dark']){
  const c=await browser.newContext({reducedMotion:'reduce',viewport:{width:1280,height:720},colorScheme:theme});
  await c.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/','/pricing','/contact-us','/dashboard']){
   const label=route==='/'?'home':route.slice(1);
   await p.goto(route==='/dashboard'?`http://127.0.0.1:3202/dashboard?theme=${theme}`:base+route,{waitUntil:'domcontentloaded'});
   await p.locator('main h1').waitFor();
   if(route==='/pricing')await p.locator('.tc-pricing-card').first().waitFor({timeout:60000});
   if(route==='/')await p.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.readyState>=2));
   await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
   // Record actual fetched app JavaScript; do not include external service scripts.
   const resources=await p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)&&e.name.includes('.js')).map(e=>({name:new URL(e.name).pathname,bytes:e.decodedBodySize,transfer:e.transferSize})));
   for(const [width,height] of sizes){
    await p.setViewportSize({width,height});await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${theme} ${width} overflow`);
    const dimensions=await p.evaluate(()=>[...document.querySelectorAll('main h1,.tc-header,.tc-footer,.tc-pricing-card,.dashboard-trip-card,#dream-trip')].map(e=>{const r=e.getBoundingClientRect();return{element:e.id||e.className,x:r.x,y:r.y,width:r.width,height:r.height}}));
    await p.screenshot({path:`${dir}/${label}-${theme}-${width}.png`,fullPage:route!=='/'});
    results.push({route,theme,width,height,dimensions,resources,dashboardFixture:route==='/dashboard'});
   }
   console.log(`${phase}: ${route} ${theme} seven widths`);
  }
  assert.deepEqual(errors,[],`runtime errors in ${theme}`);await c.close();
 }
 fs.writeFileSync(dir+'/visual-metrics.json',JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
