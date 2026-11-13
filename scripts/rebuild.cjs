'use strict';
/* Rebuilds standalone HTML from assets source and JSON using only Node.js built-ins.
 * Run after changing assets/core.js, owner.js, reviewer.js, CSS, or data fixtures.
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function write(p,v){fs.writeFileSync(path.join(root,p),v,'utf8');}
function sha(s){return "'sha256-"+crypto.createHash('sha256').update(s,'utf8').digest('base64')+"'";}
function htmlEscape(s){return s.replace(/'/g,'&#x27;').replace(/"/g,'&quot;');}
function scriptData(name,obj){const payload=JSON.stringify(obj).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');return `<script type="application/json" id="${name}">${payload}</script>`;}
const css=read('assets/style.css'),core=read('assets/core.js');
const d={"schema-json":JSON.parse(read('data/schema.json')),"demo-json":JSON.parse(read('data/synthetic.json')),"sample-public-json":JSON.parse(read('data/public-safe-synthetic.json'))};
function rebuild(role){const code=read('assets/'+role+'.js');let html=read(role+'/index.html');
 let scripts=0;html=html.replace(/<script>([\s\S]*?)<\/script>/g,()=>`<script>${scripts++===0?core:code}</script>`);if(scripts!==2)throw new Error(role+': expected exactly two inline script blocks, got '+scripts);
 for(const key of ['schema-json',role==='owner'?'demo-json':'sample-public-json']){const re=new RegExp(`<script type="application/json" id="${key}">[\\s\\S]*?<\\/script>`);if(!re.test(html))throw new Error('Missing embedded '+key);html=html.replace(re,scriptData(key,d[key]));}
 const csp="default-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; connect-src 'none'; img-src data:; font-src 'none'; script-src "+sha(core)+' '+sha(code)+'; style-src '+sha(css);
 html=html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/,`<meta http-equiv="Content-Security-Policy" content="${htmlEscape(csp)}">`);
 html=html.replace(/<style>[\s\S]*?<\/style>/,`<style>${css}</style>`);
 write(role+'/index.html',html);write(role+'.html',html.replace('<a href="../index.html">전체 앱 안내</a>','<span>단독 실행판</span>'));
}
rebuild('owner');rebuild('reviewer');let index=read('index.html');index=index.replace(/<style>[\s\S]*?<\/style>/,`<style>${css}</style>`);write('index.html',index);console.log('Standalone Owner A and Reviewer B rebuilt.');
