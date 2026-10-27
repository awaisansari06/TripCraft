const base=process.env.APP_BASE_URL||'http://localhost:3000';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='artifacts/design-system';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const checks=[];
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{
  localStorage.setItem('theme','dark');
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.reviewCopiedDraft=text}}});
 });
 const page=await context.newPage();
 await page.goto(base+'/contact-us',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Open navigation menu'}).click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Pricing',exact:true}).click();
 await page.waitForURL('**/pricing');
 assert.equal(await page.getByRole('dialog').count(),0);
 await page.locator('.tc-pricing-card').first().waitFor({timeout:60000});
 const fees=await page.locator('.tc-pricing-fee').allTextContents();
 const toggle=page.locator('.cl-pricingTableCardPeriodToggle').first();
 let billingToggleTested=false;
 if(await toggle.count()){
  const clicks=await toggle.locator('button,input').count();
  if(clicks){const control=toggle.getByRole('switch');const initial=await control.isChecked();await control.focus();await page.keyboard.press('Space');await page.waitForTimeout(400);assert.notEqual(await control.isChecked(),initial);await control.focus();await page.keyboard.press('Space');await page.waitForTimeout(400);assert.deepEqual(await page.locator('.tc-pricing-fee').allTextContents(),fees);billingToggleTested=true;}
 }
 await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
 assert.deepEqual(await page.locator('.tc-pricing-fee').allTextContents(),fees);
 await page.goto(base+'/contact-us',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Prepare message'}).click();
 assert.equal(await page.locator('#contact-name').evaluate(el=>el.validity.valueMissing),true);
 await page.locator('.tc-topic').filter({hasText:'Feedback'}).click();
 assert.equal(await page.locator('#contact-topic').inputValue(),'Feedback');
 await page.getByLabel('Your name',{exact:true}).fill('UI review');
 await page.getByLabel('Email address',{exact:true}).fill('review@example.test');
 await page.getByLabel('Your message',{exact:true}).fill('A local UI test of the existing draft-only contact behavior.');
 await page.getByRole('button',{name:'Prepare message'}).click();
 await page.getByRole('status').filter({hasText:'Your message is ready'}).waitFor();
 await page.getByRole('button',{name:'Copy message'}).click();
 assert.match(await page.evaluate(()=>window.reviewCopiedDraft),/Topic: Feedback/);
 await page.getByRole('status').filter({hasText:'Message copied'}).waitFor();
 await page.getByRole('button',{name:'Toggle light and dark theme'}).click();
 assert.equal(await page.getByLabel('Your name',{exact:true}).inputValue(),'UI review');
 const newsletter=page.locator('.tc-footer form');
 await newsletter.locator('input').fill('review@example.test');
 await newsletter.getByRole('button',{name:'Subscribe'}).click();
 await page.getByRole('status').filter({hasText:'Newsletter sign-ups are coming soon'}).waitFor();
 checks.push({publicNavigation:true,pricingDataPreserved:fees,billingToggleTested,contactValidation:true,topicSelection:true,contactDraftCopy:true,draftSurvivesThemeChange:true,newsletterFeedback:true});
 await context.close();
 for(const theme of ['light','dark']){
  const c=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const p=await c.newPage();
  await p.goto(`http://127.0.0.1:3202/dashboard?theme=${theme}`);
  await p.locator('.dashboard-trip-card').first().waitFor();
  assert.equal(await p.getByRole('link',{name:'My trips',exact:true}).count(),1);
  assert.equal(await p.locator('.dashboard-trip-card').count(),6);
  await p.getByRole('button',{name:'Show more trips'}).click();
  assert.equal(await p.locator('.dashboard-trip-card').count(),8);
  const search=p.getByRole('searchbox',{name:'Search trips by destination'});
  await search.fill('Japan');assert.equal(await p.locator('.dashboard-trip-card').count(),2);
  await search.fill('No destination matches');await p.getByRole('status').filter({hasText:'No trips match'}).waitFor();
  await search.fill('');
  await p.getByRole('button',{name:'Sort trips'}).click();
  await p.getByRole('menuitem',{name:'Oldest first'}).click();
  assert.match(await p.locator('.dashboard-trip-card h3').first().textContent(),/New York/);
  const href=await p.locator('.dashboard-trip-card').first().getAttribute('href');assert.match(href,/tripId=ui-trip-/);
  const saved=p.getByRole('button',{name:'View details for A quiet stay in Kyoto'});
  await saved.focus();await p.keyboard.press('Enter');
  await p.getByRole('dialog').waitFor();await p.keyboard.press('Escape');
  assert.equal(await p.getByRole('dialog').count(),0);await p.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='View details for A quiet stay in Kyoto');
  await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Open navigation menu'}).click();
  await p.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'My trips',exact:true}).waitFor();
  await p.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Plan a trip'}).waitFor();
  await p.keyboard.press('Escape');
  for(const state of ['empty','loading']){
   await p.goto(`http://127.0.0.1:3202/dashboard?theme=${theme}&state=${state}`);
   if(state==='empty')await p.getByRole('heading',{name:'No trips planned yet.'}).waitFor();
   else{await p.getByRole('status',{name:'Loading your trips'}).waitFor();assert.equal(await p.locator('.dashboard-loading-card').count(),6);}
   await p.screenshot({path:`${out}/dashboard-${theme}-${state}.png`,fullPage:true});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  checks.push({theme,dashboardFixture:true,search:true,sort:true,pagination:true,tripLinks:true,keyboardDialog:true,focusRestoration:true,mobileAccountActions:true,emptyState:true,loadingState:true});
  await c.close();
 }
 fs.writeFileSync(`${out}/interaction-verification.json`,JSON.stringify(checks,null,2));
 await browser.close();console.log('Navigation, live pricing, contact draft, newsletter feedback, dashboard controls/states and keyboard dialog checks passed.');
})().catch(e=>{console.error(e);process.exit(1)});

