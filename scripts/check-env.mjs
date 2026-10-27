import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
const production=process.argv.includes('--production');
loadEnvConfig(process.cwd(),!production,{info(){},error(){}});
const required=['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY','NEXT_PUBLIC_CONVEX_URL','TRIP_CREDIT_SECRET','GEMINI_API_KEY','GOOGLE_PLACE_API_KEY','NEXT_PUBLIC_MAPBOX_API_KEY'];
const errors=[],warnings=[];
const missing=v=>!v||/REPLACE_ME|REPLACE_WITH|your[-_]/i.test(v);
for(const key of required)if(missing(process.env[key]))errors.push(`${key}: required value missing or placeholder`);
for(const key of ['NEXT_PUBLIC_CONVEX_URL','SITE_URL']){
 const raw=process.env[key];if(!raw)continue;
 try{const u=new URL(raw);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error();if(production&&u.protocol!=='https:')errors.push(`${key}: production requires HTTPS`);if(key==='SITE_URL'&&(u.pathname!=='/'||u.search||u.hash))errors.push('SITE_URL: provide an origin without a route, query or fragment');}catch{errors.push(`${key}: invalid URL`);}
}
if(production){
 if(!process.env.SITE_URL)errors.push('SITE_URL: required for production canonical/sitemap URLs');
 for(const key of ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY'])if(/^(pk|sk)_test_/.test(process.env[key]||''))errors.push(`${key}: development key configured; production requires the matching live instance`);
 if(process.env.SITE_URL&&/localhost|127\.0\.0\.1|\.example(?:\/|$)/i.test(process.env.SITE_URL))errors.push('SITE_URL: local/example origins are not production configuration');
}
if(process.env.TRIP_CREDIT_SECRET&&process.env.TRIP_CREDIT_SECRET.length<32)errors.push('TRIP_CREDIT_SECRET: use at least 32 cryptographically random characters');
if(!process.env.CLERK_JWT_ISSUER_DOMAIN)warnings.push('Verify CLERK_JWT_ISSUER_DOMAIN is configured on the Convex backend; it need not be present in the web host.');
for(const error of errors)console.error('FAIL '+error);
for(const warning of warnings)console.warn('CHECK '+warning);
console.log(errors.length?`Environment validation failed (${errors.length} issue(s)); no values were printed.`:`Environment validation passed (${production?'production':'local'} web configuration).`);
process.exitCode=errors.length?1:0;
