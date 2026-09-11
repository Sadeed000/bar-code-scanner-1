const origin='https://demo.sparrownix.com';
try {
 const r=await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(20000)});const html=await r.text();console.log('PAGE',r.status);
 const scripts=[...html.matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]);console.log('SCRIPTS',scripts);
 for(const script of scripts){const js=await(await fetch(new URL(script,origin))).text();console.log('LOCAL_API_REFERENCES',js.match(/https?:[^\s"'`<>]{0,120}(?:9797|5173|\/api)/g)?.slice(0,10)||[]);console.log('HAS_NEW_LOGIN_TIMEOUT',js.includes('The server took too long'));console.log('API_CONFIG',js.match(/baseURL:.{0,220}/g)?.slice(0,4));}
 const health=await fetch(origin+'/health');console.log('HEALTH',health.status,(await health.text()).slice(0,120));
 const invalid=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});console.log('LOGIN_VALIDATION',invalid.status,(await invalid.text()).slice(0,200));
} catch(error){console.error(error.message,error.cause?.message);process.exitCode=1;}
