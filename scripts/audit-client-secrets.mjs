import fs from 'node:fs';
import path from 'node:path';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(),false,{info(){},error(){}});
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk('.next/static').filter(file=>/\.(?:js|css|map)$/.test(file));
const keys=['CLERK_SECRET_KEY','GEMINI_API_KEY','GOOGLE_PLACE_API_KEY','TRIP_CREDIT_SECRET'];
const findings=[];
for(const key of keys){
 const value=process.env[key];
 if(!value||value.length<8){findings.push({variable:key,result:'NEEDS CONFIGURATION'});continue;}
 const matches=files.filter(file=>fs.readFileSync(file,'utf8').includes(value));
 findings.push({variable:key,result:matches.length?'FAIL':'PASS',matchingFiles:matches});
}
fs.writeFileSync('artifacts/production-audit/client-secrets.json',JSON.stringify({filesScanned:files.length,findings},null,2));
console.log(JSON.stringify({filesScanned:files.length,findings},null,2));
process.exitCode=findings.some(item=>item.result==='FAIL')?1:0;
