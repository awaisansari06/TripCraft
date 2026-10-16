const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'tmp/planner-fixture');
fs.mkdirSync(out, {recursive:true});
const service = path.join(__dirname, 'services.jsx');
let token = '';
for (const filename of ['.env', '.env.local']) {
    const file = path.join(root, filename);
    if (fs.existsSync(file)) {
        const match = fs.readFileSync(file, 'utf8').match(/^NEXT_PUBLIC_MAPBOX_API_KEY=(.*)$/m);
        if (match) token = match[1].trim().replace(/^["']|["']$/g, '');
    }
}
(async () => {
    await esbuild.build({
        absWorkingDir:root, entryPoints:[path.join(__dirname,'entry.jsx')], outfile:path.join(out,'fixture.js'),
        bundle:true, sourcemap:true, platform:'browser', format:'iife', jsx:'automatic',
        define:{'process.env.NODE_ENV':'"development"', 'process.env.NEXT_PUBLIC_MAPBOX_API_KEY':JSON.stringify(token)},
        alias:{
            '@/app/provider':service, 'next/navigation':service, 'convex/react':service,
            '@clerk/nextjs':service, 'next/link':path.join(__dirname,'link.jsx'), 'next/image':path.join(__dirname,'image.jsx')
        }
    });
    const cssdir = path.join(root,'.next/static/css');
    http.createServer((req,res) => {
        const url = new URL(req.url,'http://localhost');
        if (url.pathname === '/' || url.pathname === '/create-new-trip') {
            const css = fs.existsSync(cssdir) ? fs.readdirSync(cssdir).filter(name=>name.endsWith('.css')).map(name=>'/_next/static/css/'+name) : [];
            const fixture = {theme:url.searchParams.get('theme')||'dark',messages:[{role:'assistant',content:'Let’s plan your next adventure. **Where are you starting from?**',ui:'source',timestamp:'09:00 PM'}]};
            if (url.searchParams.get('fixture') === 'final') fixture.messages = [{role:'assistant',content:'Review your trip before generating.',ui:'final',timestamp:'09:00 PM'}];
            if (url.searchParams.get('fixture') === 'interests') fixture.messages = [{role:'assistant',content:'A few personal touches make a trip yours. **What do you love to explore?**',ui:'interests',timestamp:'09:00 PM'}];
            if (['export','export-stress'].includes(url.searchParams.get('fixture'))) fixture.trip = require('../export-fixture-data.cjs')(url.searchParams.get('fixture') === 'export-stress');
            res.setHeader('Content-Type','text/html');
            res.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+css.map(href=>'<link rel="stylesheet" href="'+href+'">').join('')+'<link rel="stylesheet" href="/fixture.css"><link rel="stylesheet" href="/source-tripcraft.css"><link rel="stylesheet" href="/source-planner.css"><style>body{margin:0;--font-outfit:Outfit,Arial,sans-serif;font-family:var(--font-outfit)}#root{min-height:100dvh}</style></head><body><div id="root"></div><script>window.PLANNER_FIXTURE='+JSON.stringify(fixture)+';</script><script src="/fixture.js"></script></body></html>');
            return;
        }
        const file = url.pathname === '/source-tripcraft.css' ? path.join(root, 'app/tripcraft.css') :
            url.pathname === '/source-planner.css' ? path.join(root, 'app/create-new-trip/planner.css') :
            url.pathname.startsWith('/fixture.') ? path.join(out,path.basename(url.pathname)) :
            url.pathname.startsWith('/_next/') ? path.join(root,'.next',url.pathname.slice(7)) :
            path.join(root,'public',url.pathname);
        if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404);res.end();return; }
        const mime={'.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
        res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
        fs.createReadStream(file).pipe(res);
    }).listen(3201,'127.0.0.1',()=>console.log('Isolated planner UI fixture: http://127.0.0.1:3201 — external account/model/database transports are mocked; production components are unchanged.'));
})().catch(error=>{console.error(error);process.exit(1)});





