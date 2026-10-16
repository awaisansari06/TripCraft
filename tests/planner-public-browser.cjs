require('node:fs').mkdirSync('artifacts/planner-refinement', { recursive: true });
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
for(const theme of ['light','dark'])for(const width of [320,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:theme});
 await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/pricing','/contact-us']){
  await page.goto('http://localhost:3106'+path,{waitUntil:'domcontentloaded'});
  await page.locator('main').waitFor();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow '+theme+' '+width+' '+path);
  assert.equal(Math.round((await page.locator('.tc-header').boundingBox()).height),width<=820?60:64);
  if(path==='/'){
   assert.equal(await page.locator('#destinations a[data-depth]').count(),6);
   assert.equal(await page.getByRole('heading',{name:'Start with a little inspiration'}).count(),1);
  }
 }
 if(width<=768){
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
 }
 assert.deepEqual(errors,[]);
 results.push({theme,width,pages:3,errors});
 await context.close();
}
await browser.close();fs.writeFileSync('artifacts/planner-refinement/public-regressions.json',JSON.stringify(results,null,2));console.log('Shared navigation and public-page responsive checks passed across 30 theme/width/page combinations.');
})().catch(e=>{console.error(e);process.exit(1)});
