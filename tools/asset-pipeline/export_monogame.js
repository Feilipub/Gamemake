// Exporta o mapa e a arte do Lida no Sertão (web/index.html) para a versão MonoGame (monogame/Shared/Assets).
//
// O jogo web desenha toda a pixel art por código. Para a migração não perder nada, rodamos o próprio jogo no Chromium
// (Playwright) e salvamos o que ele gera:
//   terrain_s0.png, terrain_s1.png  chão pintado das duas estações (águas e seca), 16 px por ladrilho
//   atlas_N.png + sprites.json       todos os sprites: plantas, construções, cercas, porteiras, cochos, animais, vaqueiro, fonte
//   world.json                       grade do mapa (chão, colisão, áreas), construções, objetos, porteiras, cochos, animais
//
// Uso: node tools/asset-pipeline/export_monogame.js [web/index.html] [monogame/Shared/Assets]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const html = path.resolve(process.argv[2] || 'web/index.html');
const out = path.resolve(process.argv[3] || 'monogame/Shared/Assets');
fs.mkdirSync(out, { recursive: true });
const save = (name, dataUrl) => fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64'));

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 450 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html + '#debug-nointro'); await p.waitForTimeout(1500);
  const E = s => p.evaluate(s => __lida.ev(s), s);
  await E("newGame(defaultCF())"); await p.waitForTimeout(500); await E("FILM.end();closeModal();qPump=()=>{};QDQ.length=0;S.min=10*60");
  await p.evaluate(() => document.fonts && document.fonts.ready);

  // 1) terreno das duas estações (só o mundo, sem as linhas dos interiores)
  for (const se of [0, 1]) {
    const url = await E(`(()=>{GR.buildAll(${se});const [c,g]=mkC(WPX,HPX);g.drawImage(groundC,0,0);return c.toDataURL('image/png')})()`);
    save(`terrain_s${se}.png`, url); console.log('terreno', se, Math.round(url.length / 1024), 'KB');
  }

  // 2) sprites + mapa (tudo calculado dentro da página, com as funções de desenho do próprio jogo)
  const res = JSON.parse(await E(String.raw`(()=>{
    const SPR=[];const idx=new Map();
    const add=(key,cv,ox,oy)=>{if(idx.has(key))return key;if(!cv||!cv.width||!cv.height)return null;idx.set(key,SPR.length);SPR.push({key,cv,ox:ox||0,oy:oy||0});return key;};
    // objetos (plantas, pedras, móveis de quintal, portais…)
    const props=[];
    for(const q of PROPS){ if(q.y>=WMH*TS||q.t==='catavento') continue; if(q.rb&&!rbuiltOn(q.rb)) continue;
      const rp=rpropSpr(q); let key,ox,oy;
      if(rp){key='r:'+q.t+'|'+(q.v||0);add(key,rp,Math.round(rp.width/2),rp.height);}
      else{const c=propSpr(q.t,q.v,0);key='p:'+q.t+'|'+q.v;add(key,c,32,70);const c1=propSpr(q.t,q.v,1);add(key+'|s',c1,32,70);}
      props.push({k:key,x:Math.round(q.x),y:Math.round(q.y),t:q.t,tree:TREES.has(q.t)?1:0,sh:FLORA_SHADOW[q.t]||0});}
    // construções (dia e noite)
    const blds=[];
    for(const bd of BLD){ if(bd.r[1]>=WMH) continue; const x0=bd.r[0]*TS,y1=(bd.r[3]+1)*TS,casa=bd.id==='casa',rb=RBLD[bd.art];
      for(const night of [0,1]){const c=casa?casaSpr(S.house||0,!!night):rb?rbSpr(bd.art,!!night):bldSpr(bd,!!night); add('b:'+bd.id+(night?'|n':''),c,0,0);}
      const c=casa?casaSpr(S.house||0,false):rb?rbSpr(bd.art,false):bldSpr(bd,false);
      const dxI=rb?x0:x0-4,dyI=casa||rb?y1-c.height+8:bd.r[1]*TS-bd.top;
      blds.push({k:'b:'+bd.id,id:bd.id,n:bd.n,x:dxI,y:dyI,sy:y1-2,r:bd.r,door:bd.door,act:bd.act||''});}
    // cercas (cada ladrilho com sua combinação de vizinhos)
    const fences=[];
    for(let ty=0;ty<WMH;ty++)for(let tx=0;tx<MW;tx++){const i=gi(tx,ty);if(obj[i]!==1)continue;
      const isF=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&(obj[gi(x,y)]===1||obj[gi(x,y)]===2);const st=fenceStyleAt(tx,ty),h=H2(tx,ty,21),cond=h<.07?1:h<.2?2:0;
      const l=isF(tx-1,ty)?1:0,r=isF(tx+1,ty)?1:0,u=isF(tx,ty-1)?1:0,dn=isF(tx,ty+1)?1:0,straight=(l&&r&&!u&&!dn)||(u&&dn&&!l&&!r),post=!straight||(tx+ty)%2===0;
      const key='f:'+st+l+r+u+dn+cond+(post?1:0);add(key,fenceSpr(st,l,r,u,dn,cond,post),0,12);fences.push([tx,ty,key]);}
    // porteiras (fechada e aberta), desenhadas pela função do jogo numa tela à parte
    const gates=[];
    GATES.forEach((g,gi2)=>{const gx=g.t[0][0],gy=g.t[g.h?0:1][1];const W=96,H=96,ox=48,oy=64;
      for(const op of [0,1]){const [c,cg]=mkC(W,H);const a0=g.anim;g.anim=op;cg.save();cg.translate(ox-gx*TS,oy-gy*TS);drawGate(g,cg);cg.restore();g.anim=a0;add('g:'+gi2+'|'+op,c,ox,oy);}
      gates.push({i:gi2,k:'g:'+gi2,x:gx*TS,y:gy*TS,sy:g.h?gy*TS+14:(gy+1)*TS-1,t:g.t,h:g.h?1:0,a:g.a||'',lock:g.lock?1:0});});
    // cochos (cheio e vazio)
    const troughs=TROUGHS.map((t,i)=>{for(const lv of [1,0])add('t:'+i+'|'+lv,troughSpr(t,lv),2,2);return{k:'t:'+i,x:t.x*TS,y:t.y*TS,w:t.w,kind:t.k,a:t.a,cap:t.cap};});
    // animais: quadros de lado de cada animal do início (parado, andando, trote, comendo, deitado, assustado, bebendo)
    const ANS=['idle','walk','trot','gallop','eat','lie','scared','drink'];const animals=[];
    for(const a of S.animals){ if(a.own==='delivery'||a.own==='agro'||a.y>=WMH*TS) continue; const look={};
      if(RIGSP[a.sp]){const br=rigBreed(a),k=rigK(a),base='a:'+br+'|'+rigCoat(a)+'|'+k.toFixed(2)+'|'+(a.id%97);
        for(const an of ANS){const n=RIG.frames(an);look[an]=[];for(let f=0;f<n;f++){const r=RIG.get(br,rigCoat(a),'side',an,f,rigOpts(a,k));const [c,cg]=mkC(r.w,r.h);if(r.b)cg.drawImage(r.b,0,0);if(r.f)cg.drawImage(r.f,0,0);const key=base+'|'+an+'|'+f;add(key,c,r.ox,r.oy);look[an].push(key);}}
        look.cyc={};for(const an of ['walk','trot','gallop'])look.cyc[an]=RIG.cycleLen(br,an,k)||20;}
      else{look.idle=[];look.walk=[];for(const [ps,arr] of [['idle',look.idle],['walk',look.walk],['graze',look.idle]])for(let f=0;f<2;f++){const c=chickenSpr(a,ps,f);const key='c:'+a.sp+'|'+a.br+'|'+a.sex+'|'+(a.age>=6?1:0)+'|'+ps+'|'+f;add(key,c,8,15);if(!arr.includes(key))arr.push(key);}}
      animals.push({id:a.id,sp:a.sp,br:a.br,n:a.n,sex:a.sex,age:a.age,own:a.own,x:Math.round(a.x),y:Math.round(a.y),area:a.area||'',main:a.main?1:0,look});}
    // vaqueiro (andar, correr e parado nas 3 vistas; a 4ª é espelho)
    const pl={};for(const d of [0,1,3]){for(const [pose,n] of [['idle',4],['walk',8],['run',8]]){pl[d+pose]=[];for(let f=0;f<n;f++){const key='h:'+d+'|'+pose+'|'+f;add(key,charSpr(S.cf.ap,d,f,pose),12,30);pl[d+pose].push(key);}}}
    // fonte pixel (Pixelify Sans) para o HUD: 2 tamanhos
    const font={};for(const sz of [12,18]){const chars=' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~ÁÂÃÀÇÉÊÍÓÔÕÚÜáâãàçéêíóôõúü·•×★';const m=[];for(const ch of chars){const [mc,mg]=mkC(4,4);mg.font=sz+"px 'Pixelify Sans'";const w=Math.max(1,Math.ceil(mg.measureText(ch).width));const [c,g]=mkC(w+2,sz+6);g.font=sz+"px 'Pixelify Sans'";g.fillStyle='#fff';g.textBaseline='top';g.fillText(ch,1,1);const key='t'+sz+':'+ch.charCodeAt(0);add(key,c,0,0);m.push([ch.charCodeAt(0),key,w]);}font[sz]=m;}
    // empacota em atlas de até 2048 px (prateleiras)
    const ATL=[];let cv=null,g=null,x=0,y=0,rowH=0;const meta={};const order=SPR.map((s,i)=>i).sort((a,b)=>SPR[b].cv.height-SPR[a].cv.height);
    const newA=()=>{[cv,g]=mkC(2048,2048);ATL.push(cv);x=0;y=0;rowH=0;};newA();
    for(const i of order){const s=SPR[i],w=s.cv.width,h=s.cv.height;if(x+w>2048){x=0;y+=rowH+1;rowH=0;}if(y+h>2048){newA();}g.drawImage(s.cv,x,y);meta[s.key]=[ATL.length-1,x,y,w,h,s.ox,s.oy];x+=w+1;rowH=Math.max(rowH,h);}
    window.__ATL=ATL.map(c=>c.toDataURL('image/png'));
    // grade do mapa: chão, colisão (obj), área de cada ladrilho; tudo em base64
    const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s);};
    const N=MW*WMH,gr=new Uint8Array(N),ob=new Uint8Array(N),ar=new Uint8Array(N);for(let i=0;i<N;i++){gr[i]=ground[i];ob[i]=obj[i];ar[i]=areaId[i]<0?255:areaId[i];}
    const areas=AKEYS.map(k=>({k,n:AREAS[k].n,kind:AREAS[k].k,r:AREAS[k].r,g:AREAS[k].g,own:AREAS[k].own||'player'}));
    const world={TS,MW,MH:WMH,G,ground:b64(gr),obj:b64(ob),area:b64(ar),areas,buildings:blds,props,fences,gates,troughs,animals,player:{x:Math.round(P.x),y:Math.round(P.y),frames:pl,name:S.cf.name},font,start:{cash:S.cash,acct:S.acct,day:S.day,min:S.min}};
    return JSON.stringify({world,meta,atlases:ATL.length,count:SPR.length});})()`));
  const atl = await E('JSON.stringify(window.__ATL)');
  JSON.parse(atl).forEach((u, i) => save(`atlas_${i}.png`, u));
  fs.writeFileSync(path.join(out, 'world.json'), JSON.stringify(res.world));
  fs.writeFileSync(path.join(out, 'sprites.json'), JSON.stringify(res.meta));
  console.log('sprites', res.count, 'atlas', res.atlases, 'props', res.world.props.length, 'cercas', res.world.fences.length, 'porteiras', res.world.gates.length, 'animais', res.world.animals.length);
  console.log(errs.length ? errs.join('\n') : 'sem erros'); await b.close();
})();
