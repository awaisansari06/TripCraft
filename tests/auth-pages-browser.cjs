const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const theme of ['light','dark'])for(const width of [320,390,768,1024,1440])for(const mode of ['sign-in','sign-up']){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});
  await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3107/'+mode+'?redirect_url='+encodeURIComponent('/create-new-trip?query=Japan'),{waitUntil:'domcontentloaded'});
  const email=page.getByLabel('Email address',{exact:true});
  await email.waitFor({timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,mode+' '+width+' overflow');
  const heading=page.locator('.tc-auth-form-title');
  assert.equal(await heading.innerText(),mode==='sign-in'?'Welcome back':'Create your account');
  assert.ok(await heading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)<=28));
  const card=await page.locator('.tc-auth-card').boundingBox();
  assert.ok(card.x>=0&&card.x+card.width<=width+1);
  const bad=await page.locator('.cl-formFieldInput:visible').evaluateAll(inputs=>inputs.some(input=>input.clientHeight<42));
  assert.equal(bad,false,'Comfortable input heights');
  if(theme==='dark')assert.notEqual(await page.locator('.tc-auth-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  await page.keyboard.press('Tab');await email.focus();
  assert.equal(await email.evaluate(el=>el===document.activeElement),true);
  await email.fill('not-an-email');
  assert.equal(await email.inputValue(),'not-an-email');
  await email.fill('');
  const crosslink=page.locator('.tc-auth-switch a');
  assert.equal(new URL(await crosslink.getAttribute('href'),'http://localhost:3107').searchParams.get('redirect_url'),'/create-new-trip?query=Japan');
  await page.screenshot({path:'artifacts/export-auth/'+mode+'-'+theme+'-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  results.push({theme,width,mode,liveClerk:true,fields:true,returnPath:true,errors});
  console.log('Passed',mode,theme,width);
  await context.close();
 }
 const page=await browser.newPage();
 await page.goto('http://localhost:3107/sign-in?redirect_url='+encodeURIComponent('http://localhost:3107/create-new-trip?query=Goa'));
 await page.locator('.tc-auth-switch a[href*="redirect_url"]').waitFor();
 assert.equal(new URL(await page.locator('.tc-auth-switch a').getAttribute('href'),'http://localhost:3107').searchParams.get('redirect_url'),'/create-new-trip?query=Goa');
 await page.goto('http://localhost:3107/sign-in?redirect_url='+encodeURIComponent('https://example.com/untrusted'));
 await page.locator('.tc-auth-switch a').waitFor();
 assert.equal(await page.locator('.tc-auth-switch a').getAttribute('href'),'/sign-up');
 await page.close();await browser.close();
 fs.writeFileSync('artifacts/export-auth/auth-results.json',JSON.stringify(results,null,2));
 console.log('Real Clerk sign-in/sign-up passed in both themes at five widths; safe trip continuation links verified. No account forms were submitted.');
})().catch(e=>{console.error(e);process.exit(1)});

