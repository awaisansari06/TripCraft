import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import zlib from 'node:zlib';
const phase=process.argv[2]||'baseline',root='artifacts/production-audit/'+phase;fs.mkdirSync(root,{recursive:true});
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]):[];
const files=walk('.next/static').filter(p=>/\.(js|css)$/.test(p));
const chunks=files.map(file=>{const b=fs.readFileSync(file);return{file:file.replaceAll('\\','/'),bytes:b.length,gzipBytes:zlib.gzipSync(b).length}});
const assets=walk('public').map(file=>({file:file.replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
const report={runtime:process.version,chunks,totals:{js:chunks.filter(f=>f.file.endsWith('.js')).reduce((s,f)=>s+f.bytes,0),gzipJs:chunks.filter(f=>f.file.endsWith('.js')).reduce((s,f)=>s+f.gzipBytes,0),css:chunks.filter(f=>f.file.endsWith('.css')).reduce((s,f)=>s+f.bytes,0)},assets};
fs.writeFileSync(root+'/build-assets.json',JSON.stringify(report,null,2));console.log(JSON.stringify({phase,totals:report.totals,hero:assets.filter(a=>a.file.startsWith('public/hero/')).map(({file,bytes})=>({file,bytes}))},null,2));
