const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'tmp/design-system-fixture');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 await esbuild.build({absWorkingDir:root,entryPoints:[path.join(__dirname,'entry.jsx')],outfile:path.join(out,'fixture.js'),bundle:true,external:['/light/*','/dark/*','/illustrations/*'],platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"development"'},alias:{'next/navigation':path.join(__dirname,'services.jsx'),'@clerk/nextjs':path.join(__dirname,'services.jsx'),'convex/react':path.join(__dirname,'services.jsx'),'next/link':path.join(root,'tests/planner-fixture/link.jsx'),'next/image':path.join(root,'tests/planner-fixture/image.jsx')}});
 const appBase=process.env.APP_BASE_URL||'http://localhost:3000';
 const html=await(await fetch(appBase+'/')).text();
 const styles=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]);
 const destinations=['Kyoto, Japan','Amalfi Coast, Italy','Goa, India','Paris, France','Rome, Italy','Tokyo, Japan','Capri, Italy','New York, USA'];
 const trips=destinations.map((destination,i)=>({_id:'ui-trip-'+i,tripId:'ui-trip-'+i,uid:'ui-review',_creationTime:Date.UTC(2026,9,20-i),tripDetail:{destination,duration:'5 days',budget:i%2?'Moderate':'Budget',group_size:'Couple',hotels:[],itinerary:[]}}));
 const places=[{_id:'ui-place',placeType:'hotel',metadata:{type:'hotel',title:'A quiet stay in Kyoto',subtitle:'Kyoto, Japan',price:'₹8,000 per night',rating:4.7,images:['/light/07-tokyo-light.png'],imageUrl:'/light/07-tokyo-light.png',description:'A test saved hotel for checking the existing card and detail dialog.',geoCoordinates:{lat:35, lng:135}}}];
 http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/dashboard'){
   const theme=url.searchParams.get('theme')||'light';
   const fixture={theme,state:url.searchParams.get('state')||'populated',trips,places};
   res.setHeader('Content-Type','text/html; charset=utf-8');
   res.end(`<!doctype html><html class="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(href=>`<link rel="stylesheet" href="${appBase}${href}">`).join('')}<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"><link rel="stylesheet" href="/fixture.css"><link rel="stylesheet" href="/theme.css"></head><body><div id="root"></div><script>localStorage.setItem('theme',${JSON.stringify(theme)});window.UI_REVIEW=${JSON.stringify(fixture)};</script><script src="/fixture.js"></script></body></html>`);return;
  }
  if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end('[]');return;}
  const file=url.pathname==='/theme.css'?path.join(root,'app/theme.css'):url.pathname.startsWith('/fixture.')?path.join(out,path.basename(url.pathname)):path.join(root,'public',url.pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const mime={'.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 }).listen(3202,'127.0.0.1',()=>console.log('Dashboard visual fixture ready at http://127.0.0.1:3202/dashboard (production components; test-only account/data transports).'));
})().catch(e=>{console.error(e);process.exit(1)});
