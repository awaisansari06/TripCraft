const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='artifacts/design-system';fs.mkdirSync(out,{recursive:true});
const sizes=[[375,812],[390,844],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report=[];
 for(const theme of ['light','dark']){
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1280,height:800}});
  await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/','/pricing','/contact-us','/dashboard']){
   const fixture=route==='/dashboard';
   const url=fixture?`http://127.0.0.1:3202/dashboard?theme=${theme}`:`http://localhost:3000${route}`;
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('main h1').waitFor();
   if(route==='/pricing')await page.locator('.tc-pricing-card').first().waitFor({timeout:60000});
   if(fixture)await page.locator('.dashboard-trip-card').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(250);
   for(const [width,height] of sizes){
    await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
    const metrics=await page.evaluate(()=>{
     const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
     const header=document.querySelector('.tc-header'),footer=document.querySelector('.tc-footer');
     const nav=document.querySelector('.tc-desktop-nav'),brand=document.querySelector('.tc-brand'),actions=document.querySelector('.tc-nav-actions');
     return {overflow:document.documentElement.scrollWidth>innerWidth,header:box(header),footer:box(footer),heading:box(document.querySelector('main h1')),font:getComputedStyle(document.querySelector('main')).fontFamily,nav:getComputedStyle(nav).display==='none'?null:box(nav),brand:box(brand),actions:box(actions),paper:getComputedStyle(document.documentElement).getPropertyValue('--app-paper').trim(),surfaces:[...document.querySelectorAll('.tc-surface,.tc-pricing-card')].map(e=>box(e)),fields:[...document.querySelectorAll('.tc-field')].map(e=>box(e)),buttons:[...document.querySelectorAll('.tc-button,.tc-secondary-button,.tc-pricing-cta')].map(e=>box(e))};
    });
    const label=`${route} ${theme} ${width}`;
    assert.equal(metrics.overflow,false,`${label}: horizontal overflow`);
    assert.equal(Math.round(metrics.header.h),width<=820?64:72,`${label}: navbar height`);
    assert.ok(metrics.heading.x>=-1&&metrics.heading.right<=width+1,`${label}: heading clipped`);
    assert.ok(metrics.footer.x>=-1&&metrics.footer.right<=width+1,`${label}: footer overflow`);
    assert.match(metrics.font,/Geist/,`${label}: font mismatch`);
    assert.equal(metrics.paper,theme==='dark'?'#151a20':'#f8f5ef');
    if(metrics.nav){assert.ok(metrics.brand.right<metrics.nav.x,`${label}: brand/nav overlap`);assert.ok(metrics.nav.right<metrics.actions.x,`${label}: nav/account overlap`);}
    assert.ok(metrics.actions.right<=width,`${label}: account controls outside viewport`);
    assert.ok(metrics.fields.every(b=>b.h>=48&&b.x>=0&&b.right<=width+1),`${label}: field size/overflow`);
    assert.ok(metrics.buttons.every(b=>b.h>=44&&b.x>=0&&b.right<=width+1),`${label}: CTA size/overflow`);
    assert.ok(metrics.surfaces.every(b=>b.x>=-1&&b.right<=width+1),`${label}: card overflow`);
    if([390,768,1280].includes(width))await page.screenshot({path:`${out}/${route==='/'?'home':route.slice(1)}-${theme}-${width}.png`,fullPage:route!=='/'});
    report.push({route,theme,width,height,headerHeight:metrics.header.h,passed:true,dashboardFixture:fixture});
   }
   console.log(`Verified ${route} ${theme}: seven widths`);
  }
  assert.deepEqual(errors,[],`${theme}: browser runtime errors`);
  await context.close();
 }
 fs.writeFileSync(`${out}/responsive-verification.json`,JSON.stringify(report,null,2));
 await browser.close();console.log('All 56 page/theme/viewport checks passed.');
})().catch(e=>{console.error(e);process.exit(1)});
