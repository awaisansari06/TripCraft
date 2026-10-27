const fs = require('node:fs');
const http = require('node:http');
const esbuild = require('esbuild');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const mock = `import React from 'react';
    const user={id:'audit-user',primaryEmailAddress:{emailAddress:'audit@example.test'},fullName:'Audit',imageUrl:''};
    export const useUser=()=>({user}); export const useConvexAuth=()=>({isAuthenticated:true});
    const create=async()=>{await new Promise(r=>setTimeout(r,20));if(window.failInit)throw Error('private upstream detail');return {_id:'audit-user',email:'audit@example.test'}};
    export const useMutation=()=>create; export default function Shell({children}){return children??null}`;
  const bundle = await esbuild.build({
    absWorkingDir: process.cwd(), bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
    stdin: { resolveDir: process.cwd(), loader: 'jsx', contents: `
      import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
      import Provider,{useUserDetail} from './app/provider';
      class Boundary extends React.Component{constructor(p){super(p);this.state={error:null}}static getDerivedStateFromError(error){return{error}}render(){return this.state.error?<div role="alert">{this.state.error.message}</div>:this.props.children}}
      function Account(){const {userDetail}=useUserDetail();return <p>{userDetail?.email||'Loading account'}</p>}
      function App(){const [attempt,setAttempt]=useState(0);return <><button onClick={()=>{window.failInit=false;setAttempt(v=>v+1)}}>Retry</button><Boundary key={attempt}><Provider><Account/></Provider></Boundary></>}
      window.failInit=true;createRoot(document.getElementById('root')).render(<App/>);` },
    plugins: [{ name: 'isolated-account-transports', setup(build) {
      build.onResolve({ filter: /^(?:@clerk\/nextjs|convex\/react|\.\/_components\/(?:Header|SiteMotion|PageLoader))$/ }, args => ({ path: args.path, namespace: 'audit-mock' }));
      build.onLoad({ filter: /.*/, namespace: 'audit-mock' }, () => ({ contents: mock, loader: 'jsx', resolveDir: process.cwd() }));
    } }],
  });
  const server = http.createServer((req, res) => {
    if (req.url === '/fixture.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bundle.outputFiles[0].contents); }
    else { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><div id="root"></div><script src="/fixture.js"></script>'); }
  });
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.getByRole('alert').filter({ hasText: 'Your account could not be loaded. Please try again.' }).waitFor();
    assert.doesNotMatch(await page.locator('body').innerText(), /private upstream detail/);
    await page.getByRole('button', { name: 'Retry' }).click();
    await page.getByText('audit@example.test', { exact: true }).waitFor();
    assert.equal(await page.getByRole('alert').count(), 0);
    fs.writeFileSync('artifacts/production-audit/provider-lifecycle.json', JSON.stringify({ result: 'PASS', actualProvider: true, isolatedTransports: true, failureEscapesInfiniteLoading: true, safeError: true, retryInitializesAccount: true }, null, 2));
    console.log('Actual account provider: failure reaches error boundary, hides upstream details and retries successfully.');
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exit(1); });
