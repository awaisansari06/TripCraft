import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(),dirs=['app','components','lib','context','hooks','utils','convex','scripts','tests'];
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const files=dirs.flatMap(walk).filter(f=>/\.(?:ts|tsx|js|jsx|cjs|mjs|py|css)$/.test(f));
const env={};for(const name of ['.env','.env.local'])if(fs.existsSync(name))for(const line of fs.readFileSync(name,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const environment=Object.entries(env).map(([name,value])=>({name,present:!!value,public:name.startsWith('NEXT_PUBLIC_'),...(name.includes('CLERK')&&name.includes('KEY')?{developmentKey:/^(pk|sk)_test_/.test(value)}:{}),...(name==='TRIP_CREDIT_SECRET'?{strongLength:value.length>=32}:{})}));
const deps=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).dependencies;
const usage=Object.keys(deps).map(dependency=>({dependency,references:files.filter(f=>fs.readFileSync(f,'utf8').includes(dependency)).map(f=>f.replaceAll('\\','/'))}));
const suspected=[];const privatePatterns=[/\bsk_(?:live|test)_[A-Za-z0-9]{12,}/g,/\bAIza[A-Za-z0-9_-]{24,}/g,/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g];
for(const f of files.filter(f=>!f.startsWith('convex'+path.sep+'_generated'))){const s=fs.readFileSync(f,'utf8');if(privatePatterns.some(p=>{p.lastIndex=0;return p.test(s)}))suspected.push(f);}
const result={environment,dependencyUsage:usage,sourceSecretPatternMatches:suspected};
const output='artifacts/production-audit/'+(process.argv[2]||'after');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(output+'/source-inventory.json',JSON.stringify(result,null,2));console.log(JSON.stringify({environment,unreferenced:usage.filter(d=>!d.references.length).map(x=>x.dependency),sourceSecretPatternMatchFiles:suspected},null,2));
