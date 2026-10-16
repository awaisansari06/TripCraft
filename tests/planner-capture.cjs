const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const theme of ['dark','light'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});
  await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  const page=await context.newPage();
  await page.route('**/api/credits',r=>r.fulfill({json:{isAuthenticated:true,isPremium:true,remaining:100,capacity:100,resetInfo:null}}));
  await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=fixture&fixture=interests&theme='+theme);
  await page.getByRole('button',{name:/Food$/}).click();
  await page.getByRole('button',{name:/Culture$/}).click();
  if(width<1024)await page.getByRole('button',{name:'Explore map',exact:true}).click();
  await page.locator('.planner-map[data-map-ready="true"]').waitFor({timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({path:'artifacts/planner-refinement/final-'+theme+'-'+width+'-map.png',fullPage:true});
  if(width<1024){
   await page.getByRole('button',{name:'Chat',exact:true}).click();
   await page.waitForTimeout(100);
   await page.screenshot({path:'artifacts/planner-refinement/final-'+theme+'-'+width+'-chat.png',fullPage:true});
  }
  results.push({theme,width,liveMapIdle:true});
  await context.close();
 }
 fs.writeFileSync('artifacts/planner-refinement/map-results.json',JSON.stringify(results,null,2));
 console.log('Final screenshots captured after live Mapbox tiles and fonts settled.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

