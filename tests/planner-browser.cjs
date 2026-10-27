const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'artifacts/planner-refinement/browser';
fs.mkdirSync(out, { recursive: true });
const steps = [
    { resp: 'Wonderful. **Where would you like to go?**', ui: 'destination' },
    { resp: 'Who will be joining you?', ui: 'groupSize' },
    { resp: 'What budget feels right?', ui: 'budget' },
    { resp: 'How many days do you have?', ui: 'tripDuration' },
    { resp: 'What do you enjoy when you travel?', ui: 'interests' },
    { resp: 'Choose the vibe for your trip.', ui: 'tripStyle' },
    { resp: 'How busy would you like each day?', ui: 'travelPace' },
    { resp: 'Any special preferences?\n- Dietary needs\n- Accessibility requirements', ui: 'preferences' },
    { resp: 'Everything is ready. **Review your trip below.**', ui: 'final' },
];
const fixturePlan = { destination: 'Japan', origin:'Mumbai', duration:'5 days', group_size:'Couple', budget:'Medium', hotels:[], itinerary:[{ day:1, day_plan:'Explore Tokyo', best_time_to_visit_day:'Morning', activities:[] }] };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
    const browser = await chromium.launch({ channel:'msedge', headless:true });
    const results = [];
    for (const theme of ['dark','light']) for (const width of [320,375,390,430,768,1024,1280,1440,1920]) {
        const context = await browser.newContext({ viewport:{width,height:900}, reducedMotion:'reduce', colorScheme:theme, hasTouch:width<1024 });
        await context.addInitScript(theme => localStorage.setItem('theme',theme),theme);
        const page = await context.newPage();
        const errors = [];
        const requests = [];
        let step = 0, generationCalls = 0, remaining = 100;
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/api/credits', route => route.fulfill({json:{isAuthenticated:true,isPremium:true,remaining,capacity:100,resetInfo:null}}));
        await page.route('**/api/google-place-detail', route => route.fulfill({json:[]}));
        await page.route('**/api/aimodel', async route => {
            const body = route.request().postDataJSON();
            requests.push(body);
            if (body.isFinal) {
                generationCalls++;
                await pause(900);
                remaining = 99;
                await route.fulfill({json:{trip_plan:fixturePlan,credits:{isAuthenticated:true,isPremium:true,remaining:99,capacity:100,resetInfo:null}}});
            } else {
                await pause(60);
                await route.fulfill({json:steps[step++]});
            }
        });
        await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=fixture&theme='+theme,{waitUntil:'domcontentloaded'});
        const input = page.getByRole('textbox',{name:'Your message'});
        await input.waitFor();
        await page.getByText('Where are you starting from?',{exact:false}).waitFor();
        const checkLayout = async () => {
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page horizontal overflow at '+width);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+2),false,'Planner must stay within viewport');
            assert.ok(await page.locator('.chat-history').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
            const footer = await page.locator('.chat-footer').boundingBox();
            assert.ok(footer.y+footer.height<=900+2,'Composer visible');
            const bad = await page.locator('.chat-question:visible').evaluateAll(cards=>cards.filter(card=>card.scrollWidth>card.clientWidth+1).length);
            assert.equal(bad,0,'Question fits available width');
        };
        await checkLayout();
        const navHeight=await page.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tc-nav-height')));
        assert.equal(Math.round((await page.locator('.tc-header').boundingBox()).height),navHeight);
        assert.equal(await page.locator('.chat-bubble strong').count(),1,'Safe bold rendering');
        const send = async text => { await input.fill(text); await input.press('Enter'); await page.getByRole('button',{name:'Send message',exact:true}).waitFor(); await page.waitForFunction(()=>!document.querySelector('.chat-loading')); };
        await send('Mumbai');
        await send('Japan');
        await page.getByRole('button',{name:/A couple/}).click();
        await page.getByRole('button',{name:/Comfort/}).click();
        const custom = page.getByRole('spinbutton',{name:'Custom days'});
        await custom.fill('31');
        const continueDuration = page.getByRole('button',{name:'Continue',exact:true});
        assert.equal(await continueDuration.isDisabled(),true);
        const count = requests.length;
        await custom.fill('12');
        await page.waitForTimeout(100);
        assert.equal(requests.length,count,'Custom typing must not submit prematurely');
        await custom.fill('5');
        await checkLayout();
        if ([390,1440].includes(width)) await page.screenshot({path:out+'/'+theme+'-'+width+'-duration.png'});
        await custom.press('Enter');
        const food = page.getByRole('button',{name:/Food$/});
        const culture = page.getByRole('button',{name:/Culture$/});
        await food.waitFor();
        const originalSize = await food.boundingBox();
        await food.click(); await culture.click();
        assert.equal(await food.getAttribute('aria-pressed'),'true');
        assert.deepEqual(await food.boundingBox(),originalSize,'Selecting chips must not move/resize them');
        await checkLayout();
        if ([390,1440].includes(width)) await page.screenshot({path:out+'/'+theme+'-'+width+'-interests.png'});
        await page.getByRole('button',{name:'Clear',exact:true}).click();
        assert.equal(await food.getAttribute('aria-pressed'),'false');
        await food.click(); await culture.click();
        await page.getByRole('button',{name:'Continue',exact:true}).click();
        await page.getByRole('button',{name:/Balanced/}).click();
        await page.getByRole('button',{name:/Moderate/}).click();
        await page.locator('.chat-rich-text ul').waitFor();
        assert.equal((await page.locator('.chat-answer').last().innerText()).replace(/\s+/g,' '),'Your interests Food · Culture');
        assert.equal(requests[5].messages.at(-1).content,'food,culture','Stored/backend values stay unchanged');
        await send('No special preferences');
        const summary = page.locator('.chat-trip-summary');
        await summary.waitFor();
        assert.ok((await summary.innerText()).includes('Japan'));
        assert.ok((await summary.innerText()).includes('Couple'));
        assert.ok(!(await summary.innerText()).includes('N/A'));
        await page.getByRole('button',{name:'Edit',exact:true}).click();
        await page.getByRole('dialog').waitFor();
        assert.equal(await page.getByRole('textbox',{name:'Destination',exact:true}).inputValue(),'Japan');
        await page.getByRole('textbox',{name:'Destination',exact:true}).fill('Japan — Tokyo, Kyoto and the surrounding countryside');
        await page.getByRole('button',{name:'Save changes'}).click();
        await checkLayout();
        if (width<1024) {
            await input.fill('Keep this draft');
            await page.getByRole('button',{name:'Explore map',exact:true}).click();
            await page.locator('.planner-map canvas').waitFor();
            const canvas = await page.locator('.planner-map canvas').boundingBox();
            const map = await page.locator('.planner-map').boundingBox();
            assert.ok(Math.abs(canvas.width-map.width)<3,'Map resizes to visible panel');
            await page.getByRole('button',{name:'Chat',exact:true}).click();
            assert.equal(await input.inputValue(),'Keep this draft','Switching panels preserves draft');
            await input.fill('');
        }
        await page.screenshot({path:out+'/'+theme+'-'+width+'-summary.png'});
        const generate = page.getByRole('button',{name:'Generate plan',exact:true});
        await generate.click();
        await page.getByRole('button',{name:'Generating…',exact:true}).waitFor();
        assert.equal(await page.getByRole('button',{name:'Generating…',exact:true}).isDisabled(),true);
        await page.locator('.chat-history').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
        await page.getByText('Your trip is generated.',{exact:true}).waitFor();
        assert.equal(generationCalls,1);
        assert.ok(await page.locator('.chat-history').evaluate(el=>el.scrollTop<4),'AI completion must respect reading older messages');
        await page.getByRole('button',{name:'Latest messages'}).click();
        await page.getByText('99',{exact:true}).waitFor();
        assert.ok(await page.locator('.chat-history').evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop<3),'Latest messages returns to end');
        if (width<1024) {
            await page.getByRole('button',{name:'Itinerary',exact:true}).click();
            await page.locator('.trip-timeline').waitFor();
            await page.getByRole('button',{name:'Chat',exact:true}).click();
            await page.setViewportSize({width,height:520});
            await page.waitForFunction(() => document.querySelector('.chat-footer').getBoundingClientRect().bottom <= innerHeight + 2);
            const footer = await page.locator('.chat-footer').boundingBox();
            assert.ok(footer.y+footer.height<=522,'Composer adapts to a reduced mobile viewport');
            await page.setViewportSize({width,height:900});
        } else {
            await page.getByRole('button',{name:'Show map'}).click();
            await page.locator('.planner-map canvas').waitFor();
            const before = await page.locator('.planner-map').boundingBox();
            const separator = page.getByRole('separator',{name:'Resize chat panel'});
            await separator.focus(); await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(150);
            const after = await page.locator('.planner-map').boundingBox();
            assert.ok(after.width<before.width);
            assert.ok(Math.abs((await page.locator('.planner-map canvas').boundingBox()).width-after.width)<3,'Canvas follows resizer');
        }
        assert.deepEqual(errors,[]);
        results.push({theme,width,questionFlow:true,creditsUpdated:true,draftsPreserved:true,scrollRespected:true,errors});
        await context.close();
        console.log('Passed',theme,width);
    }
    fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
    await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});

