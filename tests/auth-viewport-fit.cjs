const {chromium}=require('C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
for(const theme of ['light','dark'])for(const [width,height] of [[1280,720],[1366,768],[1440,900],[390,844],[320,720]])for(const mode of ['sign-in','sign-up']){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,colorScheme:theme,reducedMotion:'reduce'});
 await context.addInitScript(t=>localStorage.setItem('theme',t),theme);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3108/'+mode+'?redirect_url=%2Fdashboard');await page.getByLabel('Email address',{exact:true}).waitFor({timeout:60000});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');
 const submit=page.locator('.tc-auth-submit');const box=await submit.boundingBox();assert.ok(box.height>=44);
 if(width>=900){const footer=await page.locator('.tc-auth-account-footer').boundingBox();assert.ok(footer.y+footer.height<=height,`${mode} ${width}: footer below viewport`);assert.ok(box.y+box.height<=height,'submit below viewport');}
 await page.getByLabel('Email address',{exact:true}).focus();assert.ok(await page.getByLabel('Email address',{exact:true}).evaluate(e=>e===document.activeElement));
 await submit.scrollIntoViewIfNeeded();assert.ok(await submit.isVisible());assert.deepEqual(errors,[]);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`artifacts/auth-fit/${mode}-${theme}-${width}.png`,fullPage:true});console.log('PASS',mode,theme,width,height);await context.close();
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
