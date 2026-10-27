import fs from 'node:fs';
const env={};for(const file of ['.env','.env.local'])if(fs.existsSync(file))for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
(async()=>{
 const results=[];
 const read=async(name,fn)=>{try{results.push({service:name,...await fn()})}catch(e){results.push({service:name,result:'NOT TESTED',transportError:e.name})}};
 await read('Gemini configured model metadata',async()=>{
  if(!env.GEMINI_API_KEY)return{result:'NEEDS CONFIGURATION',reason:'GEMINI_API_KEY absent'};
  const model=env.GEMINI_MODEL||'gemini-3.5-flash-lite';
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model),{headers:{'x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(15000)});
  return{result:r.ok?'PASS':'NEEDS CONFIGURATION',httpStatus:r.status,model,readOnly:true};
 });
 await read('Convex anonymous account access',async()=>{
  if(!env.NEXT_PUBLIC_CONVEX_URL)return{result:'NEEDS CONFIGURATION'};
  const r=await fetch(env.NEXT_PUBLIC_CONVEX_URL+'/api/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'user:GetUser',args:{email:'production-audit@example.test'},format:'json'}),signal:AbortSignal.timeout(15000)});const j=await r.json();
  return{result:j.status==='error'&&/verified|authenticated|unauthorized/i.test(j.errorMessage||'')?'PASS':'NEEDS CONFIGURATION',httpStatus:r.status,rejected:j.status==='error',readOnly:true};
 });
 await read('Convex server credit bridge',async()=>{
  if(!env.TRIP_CREDIT_SECRET||!env.NEXT_PUBLIC_CONVEX_URL)return{result:'NEEDS CONFIGURATION'};
  const r=await fetch(env.NEXT_PUBLIC_CONVEX_URL+'/api/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'credits:ReadBalance',args:{secret:env.TRIP_CREDIT_SECRET,userId:'production-audit@example.test',capacity:2},format:'json'}),signal:AbortSignal.timeout(15000)});const j=await r.json();
  return{result:j.status==='success'?'PASS':'NEEDS CONFIGURATION',httpStatus:r.status,readOnly:true};
 });
 await read('Mapbox style access',async()=>{
  if(!env.NEXT_PUBLIC_MAPBOX_API_KEY)return{result:'NEEDS CONFIGURATION'};
  const u=new URL('https://api.mapbox.com/styles/v1/mapbox/streets-v12');u.searchParams.set('access_token',env.NEXT_PUBLIC_MAPBOX_API_KEY);
  const r=await fetch(u,{signal:AbortSignal.timeout(15000)});return{result:r.ok?'PASS':'NEEDS CONFIGURATION',httpStatus:r.status,readOnly:true};
 });
 fs.writeFileSync('artifacts/production-audit/service-checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})();
