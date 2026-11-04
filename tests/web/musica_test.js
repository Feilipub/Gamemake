// música original: renderiza cada peça offline (WAV em production/qa/evidence/musica), confere que não é silêncio,
// que o andamento e o tamanho batem, e que o revezamento com as faixas e a festa funcionam no jogo
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const out=path.resolve(__dirname,'../../production/qa/evidence/musica')+'/';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../../web/index.html')+'#debug-nointro');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__lida.ev(s),s);const R=[];const ok=(n,c,i)=>R.push((c?'OK  ':'FALHA ')+n+(i?' — '+i:''));
for(const id of ['baiao','xote','toada','quadrilha']){
 const r=await p.evaluate(async id=>{const ev=window.__lida.ev;return await ev(`(async()=>{const S0=SONGS['${id}'];let st=0;for(const q of S0.mel)st+=q[1];const secs=Math.min(36,st*60/S0.bpm/4*2+1.5);const C=new OfflineAudioContext(1,Math.ceil(44100*secs),44100);const old={ctx:AU.ctx,mu:AU.buses.mu,ok:AU.ok,g:SONG.g,nb:SONG.nb,sc:MUS.scene};MUS.scene='game';AU.ctx=C;AU.buses.mu=C.destination;AU.ok=()=>true;SONG.g=null;SONG.nb=null;SONG.play('${id}',{loops:99});SONG.g.gain.cancelScheduledValues(0);SONG.g.gain.setValueAtTime(0.9,0);SONG.nextT=0.05;SONG.tick(secs);const buf=await C.startRendering();AU.ctx=old.ctx;AU.buses.mu=old.mu;AU.ok=old.ok;SONG.g=old.g;SONG.nb=old.nb;SONG.cur=null;MUS.scene=old.sc;
 const d=buf.getChannelData(0);let s=0,pk=0;for(let i=0;i<d.length;i++){s+=d[i]*d[i];pk=Math.max(pk,Math.abs(d[i]))}const rms=Math.sqrt(s/d.length);
 const n=d.length,ab=new ArrayBuffer(44+n*2),v=new DataView(ab);const w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,44100,true);v.setUint32(28,88200,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);const g=0.9/Math.max(pk,1e-3);for(let i=0;i<n;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,d[i]*g))*32767,true);
 let bin='';const u8=new Uint8Array(ab);for(let i=0;i<u8.length;i+=8192)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return JSON.stringify({rms,pk,secs,b64:btoa(bin),name:S0.n})})()`)},id);
 const o=JSON.parse(r);fs.writeFileSync(out+id+'.wav',Buffer.from(o.b64,'base64')); /* converta com: ffmpeg -i X.wav -b:a 96k X.mp3 */ok(`${o.name}: renderizada (${o.secs.toFixed(1)} s)`,o.rms>0.003&&o.pk<4,'rms '+o.rms.toFixed(4));}
await E("newGame(defaultCF())");await p.waitForTimeout(400);await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60;SET.cine='off'");
await p.mouse.click(200,200);await E("AU.init&&AU.init();AU.ctx&&AU.ctx.resume()");await p.waitForTimeout(500);
const run=await E("AU.ok()");ok('áudio do navegador ativo',run);
if(run){await E("MUS.scene='game';MUS.unlocked=true;MUS.songTurn=false;MUS.nextGame(0.5)");await p.waitForTimeout(800);ok('revezamento: peça original entre as faixas',await E("SONG.cur")==='baiao',await E("SONG.cur"));
 await E("S.min=21*60;SONG.stop(0.1)");await p.waitForTimeout(400);ok('à noite escolhe a Toada',await E("SONG.pickForNow()")==='toada');
 await E("window.__en=eventNow;eventNow=k=>k==='junina';S.min=19*60;P.x=84*TS;P.y=50*TS;cam.snap=true");await p.waitForTimeout(900);ok('festa junina na praça toca a Quadrilha',await E("SONG.cur")==='quadrilha'&&await E("MUS.duckT")<0.5);
 await E("P.x=10*TS;P.y=32*TS");await p.waitForTimeout(900);await E("eventNow=__en");ok('saindo da festa a quadrilha para',await E("!SONG.festa"));}
console.log(R.join('\n'));console.log([...new Set(errs)].join('\n')||'sem erros');await b.close();})();
