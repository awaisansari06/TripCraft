const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const [theme,width,stress] of [['light',1440,false],['dark',390,false],['light',1280,true]]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:theme});
  await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/credits',r=>r.fulfill({json:{isAuthenticated:true,isPremium:true,remaining:100,capacity:100,resetInfo:null}}));
  await page.route('**/api/google-place-detail',r=>r.fulfill({json:[]}));
  await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=fixture&fixture='+ (stress?'export-stress':'export')+'&theme='+theme,{waitUntil:'domcontentloaded'});
  if(width<1024)await page.getByRole('button',{name:'Itinerary',exact:true}).click();
  const trigger=page.getByRole('button',{name:'Export itinerary as PDF'});
  assert.equal(await page.locator('.tc-trip-print-root .te-photo img').count(),0,'Export photos stay deferred until requested');
  await trigger.click();await page.getByRole('dialog').waitFor();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.trip-export-preview img,.tc-trip-print-root img')).every(image=>image.complete&&image.naturalWidth>0));
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('.trip-export-preview').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
  await page.screenshot({path:'artifacts/export-auth/export-preview-'+theme+(stress?'-stress':'')+'.png',fullPage:true});
  await page.evaluate(()=>{window.print=()=>{window.printCalls=(window.printCalls||0)+1;window.printTitle=document.title;};});
  await page.getByRole('button',{name:'Save as PDF',exact:true}).click();
  await page.waitForFunction(()=>window.printCalls===1);
  assert.ok(await page.evaluate(()=>window.printTitle.startsWith('TripCraft - ')));
  await page.keyboard.press('Escape');
  assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.planner-shell').isVisible(),false);
  assert.equal(await page.locator('.tc-trip-print-root').isVisible(),true);
  const path='artifacts/export-auth/qa-'+(stress?'long-trip':theme)+'.pdf';
  await page.pdf({path,printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true});
  assert.deepEqual(errors,[]);
  results.push({theme,width,stress,path,printPreview:true,printAction:true,errors});
  await context.close();
 }
 fs.writeFileSync('artifacts/export-auth/export-results.json',JSON.stringify(results,null,2));
 await browser.close();console.log('Export preview, mobile layout, print action, focus restoration and PDF generation passed.');
})().catch(e=>{console.error(e);process.exit(1)});

