"""Motor dos Reels: reaproveita cenário, mago, sapo e caldeirão de scene.py e soma sprites novos."""
import math, random
import numpy as np
from PIL import Image, ImageDraw
import scene as S
from scene import (W,H,TAU,ease,win,prog,LIQ,ramp_mix,Canvas,Layer,composite,light,vignette,draw_wizard,draw_frog,
                   draw_flask,cauldron,steam,burst,ingredient,throw_path,caption,CAPCOL,BG,CANDLES,CX,SURF,WX,WY,
                   GOLD,MAUVE,BEARD,WOOD,ROBE,SKIN,hexc,mix)
from font import draw_text,text_width,wrap
CAPCOL.update({'pink_big':((255,140,200),(140,20,80)),'gold_big':((255,220,90),(140,80,10)),
               'pink':((255,160,210),(130,20,80)),'cyan_big':((140,240,255),(20,80,140))})
LIQ.update({'pink':['#6a1040','#b02070','#f050a0','#ff98d0','#ffe0f0'],
            'orange':['#6a2a08','#b05010','#f08a20','#ffc060','#fff0c0'],
            'indigo':['#1a1050','#2a2a9a','#4a50e0','#9098ff','#e0e0ff']})
def base(t,f,ramp,glow=0.55,shake=0.0,steam_amt=1.0,cauldron_light=True):
    C=Canvas(W,H); C.im=BG.im.copy(); C.d=ImageDraw.Draw(C.im)
    rnd=random.Random(f//3)
    img=np.asarray(C.im,float)
    img=light(img,27,30,40,'#6070c0',0.35,4)
    for (cx,cy) in CANDLES: img=light(img,cx,cy-3,14+rnd.random()*2,'#ffb050',0.5,4)
    if cauldron_light:
        img=light(img,CX,SURF-6,52+shake*16,ramp[2],glow+0.12*math.sin(t*TAU*1.1)+shake*0.4,6)
        img=light(img,CX,160,30,'#ff7020',0.6,4)
    C.im=Image.fromarray(np.clip(img,0,255).astype('uint8')); C.d=ImageDraw.Draw(C.im)
    for (cx,cy) in CANDLES:
        h=rnd.randint(2,3); C.px(cx,cy-1,'#ffd060'); C.px(cx,cy-h,'#ff9030'); C.px(cx,cy-1-h//2,'#fff0b0')
    for k in range(18):
        ph=(t*0.05+k*0.137)%1; x=(k*37)%W+math.sin(t*0.7+k)*3; y=20+ph*130
        if (k+int(t*4))%5: C.px(x,y,'#8a80a8' if k%2 else '#c0a070')
    if steam_amt>0: steam(C,t,ramp,CX,SURF,steam_amt)
    return C
def stir_angle(t,speed=1.0): return math.floor(t*speed*12)/12*TAU
def wizard(C,t,x=WX,y=WY,alpha=1.0,tint=None,outline=True,**kw):
    L=Layer(W,H); hand=draw_wizard(L,x,y,t,**kw); composite(C,L,S.OUT if outline else None,alpha=alpha,tint=tint); return hand
def frog(C,t,x,y,**kw):
    L=Layer(W,H); draw_frog(L,x,y,t,**kw); composite(C,L)
def heart(C,x,y,s=1,col='#ff4080',hi='#ffb0d0'):
    x,y=round(x),round(y)
    if s<=1:
        for dx,dy in [(-1,-1),(1,-1),(-2,0),(-1,0),(0,0),(1,0),(2,0),(-1,1),(0,1),(1,1),(0,2)]: C.px(x+dx,y+dy,col)
        C.px(x-1,y-1,hi)
    else:
        L=Layer(W,H); L.ell(x-2,y-1,2,2,col); L.ell(x+2,y-1,2,2,col); L.poly([(x-4,y),(x+4,y),(x,y+5)],col); L.px(x-3,y-2,hi); L.px(x-2,y-2,hi)
        composite(C,L)
def hearts_rising(C,t,cx,cy,n=10,seed=0,spread=24,speed=14):
    r=random.Random(seed)
    for k in range(n):
        ph=(t*speed/40+k/n)%1; x=cx+r.uniform(-spread,spread)/2+math.sin(ph*9+k)*3; y=cy-ph*60
        if ph<0.9: heart(C,x,y,1,'#ff4080' if k%2 else '#ff80b0')
def fly(C,t,x,y):
    C.px(x,y,'#101010'); 
    if int(t*20)%2: C.px(x-1,y-1,'#c0c0d0'); C.px(x+1,y-1,'#c0c0d0')
    else: C.px(x-1,y,'#c0c0d0'); C.px(x+1,y,'#c0c0d0')
def coin(C,x,y,ph):
    x,y=round(x),round(y); w=[3,2,1,2][int(ph*4)%4]
    C.rect(x-w,y-3,2*w+1,7,'#5a3a08'); C.rect(x-w+1,y-2,max(1,2*w-1),5,'#ffd040')
    if w>1: C.px(x-w+1,y-2,'#fff8c0')
def flames(C,t,f,x,y,w=6,h=8):
    r=random.Random(f//2)
    for dx in range(-w//2,w//2+1,2):
        hh=r.randint(h//2,h)
        C.poly([(x+dx-1,y),(x+dx+2,y),(x+dx+r.choice((-1,0,1)),y-hh)],'#e04010')
        C.poly([(x+dx,y),(x+dx+1,y),(x+dx,y-max(1,hh-3))],'#ffc040')
def post(C,t,f,shake=0,flash=0.0,zoom=None,vig=0.6):
    img=np.asarray(C.im,float); img=vignette(img,vig)
    if flash>0: img=img+(255-img)*min(1,flash)
    C.im=Image.fromarray(np.clip(img,0,255).astype('uint8'))
    if shake:
        r=random.Random(f); a=np.asarray(C.im); a=np.roll(np.roll(a,r.randint(-shake,shake),1),r.randint(-shake,shake),0); C.im=Image.fromarray(a)
    if zoom:
        zx=min(max(0,zoom[0]-W//4),W//2); zy=min(max(0,zoom[1]-H//4),H//2)
        C.im=C.im.crop((zx,zy,zx+W//2,zy+H//2)).resize((W,H),Image.NEAREST)
    return C.im.resize((W*2,H*2),Image.NEAREST)
def caps(ui,t,lst,y=58):
    for c in lst:
        a,b,text=c[:3]; style=c[3] if len(c)>3 else 'white'
        caption(ui,text,t,a,b,style,y=c[4] if len(c)>4 else y)
def label(ui,text,col=(255,255,255),bg=(200,30,60),y=24):
    d=ImageDraw.Draw(ui); w=text_width(text,2)
    x=(216-w)//2; d.rectangle([x-7,y-7,x+w+6,y+17],fill=(10,6,18)); d.rectangle([x-5,y-5,x+w+4,y+15],fill=bg)
    draw_text(ui,text,x,y,col,2)
def big_number(ui,n,t,t0):
    d=t-t0; s=6 if d>0.12 else 9
    w=text_width(str(n),s); draw_text(ui,str(n),(216-w)//2+40,96,(255,255,255),s,shadow=(200,40,120))
def fade_edges(ui,t,dur,fin=0.15,fout=0.5,col=255):
    a=np.asarray(ui,float)
    if t<fin: a=a+(col-a)*(1-t/fin)
    if t>dur-fout: a=a+(col-a)*prog(t,dur-fout,dur)
    return Image.fromarray(a.clip(0,255).astype('uint8'))
def throw(C,t,t0,kind,cx,surf,start=(WX+26,WY-58),dur=0.8,j=0):
    if win(t,t0,t0+dur):
        u=prog(t,t0,t0+dur); x,y=throw_path(ease(u)*0.9+u*0.1,start,(cx+(j%3-1)*6,surf)); ingredient(C,kind,x,y,t*3)
def splash_fx(C,t,t0,cx,surf,ramp,seed=0):
    burst(C,t,t0,cx,surf,14,[ramp[3],ramp[4],'#ffffff'],0.5,seed=seed,life=0.8,grav=40)

# ---------- helpers for the Shorts ----------
def drink_seq(t,t0,ramp):
    """hold the flask (t0..t0+1) then drink (t0+1..t0+2). returns kwargs for wizard()"""
    d=t-t0
    if 0<=d<1.0: return dict(left='hold',flask=(1.0,ramp,True))
    if 1.0<=d<2.0: return dict(left='drink',lp=d-1.0,flask=(1-ease(d-1.0),ramp,False),eyes='closed')
    return {}
def scaled_wizard(C,t,scale,x=WX,y=WY,**kw):
    """wizard drawn then scaled about his feet (integer-ish pixel scale)"""
    L=Layer(W,H); draw_wizard(L,x,y,t,**kw)
    big=L.im.resize((round(W*scale),round(H*scale)),Image.NEAREST)
    ox=round(x-x*scale); oy=round(y-y*scale)
    L2=Layer(W,H); L2.im.paste(big,(ox,oy),big); composite(C,L2)
def no_fade(ui,t,dur): return ui
def tier_bar(ui,t,items,y=18):
    """items: list of (tier_letter,color,label) already ranked"""
    d=ImageDraw.Draw(ui)
    tiers=[('S',(255,90,90)),('A',(255,180,80)),('B',(255,230,90)),('C',(140,230,110)),('F',(120,150,255))]
    for i,(L_,c) in enumerate(tiers):
        yy=y+i*18; d.rectangle([4,yy,212,yy+16],fill=(10,6,18)); d.rectangle([5,yy+1,22,yy+15],fill=c)
        draw_text(ui,L_,10,yy+5,(20,10,20),1,outline=None)
        xs=28
        for (tl,col,lab) in items:
            if tl==L_:
                d.rectangle([xs,yy+2,xs+text_width(lab,1)+5,yy+14],fill=col); draw_text(ui,lab,xs+3,yy+5,(255,255,255),1); xs+=text_width(lab,1)+10
GOLD_RAMP=['#5a3008','#9a6010','#d8a028','#f8d860','#fffad0']
SOOT_RAMP=['#08080c','#141418','#222228','#34343c','#4a4a54']
def recolor_wizard(C,t,ramp,x=WX,y=WY,**kw):
    """draw the wizard re-shaded with a 5-tone ramp by luminance (gold statue, soot...)"""
    L=Layer(W,H); draw_wizard(L,x,y,t,**kw)
    a=np.asarray(L.im).copy(); m=a[:,:,3]>0
    lum=(a[:,:,0]*0.3+a[:,:,1]*0.59+a[:,:,2]*0.11)/255
    idx=np.clip((lum*1.6*len(ramp)).astype(int),0,len(ramp)-1)
    pal=np.array([hexc(c) for c in ramp],dtype='uint8')
    a[:,:,:3][m]=pal[idx[m]]; L.im=Image.fromarray(a); composite(C,L)

# ---------- viral style: big word-by-word captions ----------
def words(ui,t,seq,y=150,scale=4):
    """seq: list of (t0,t1,text,color). Each chunk pops in big at screen centre."""
    for (a,b,text,col) in seq:
        if not (a<=t<b): continue
        d=t-a; sc=scale+1 if d<0.07 else scale
        lines=wrap(text,204,sc); lh=12*sc//1
        for i,ln in enumerate(lines):
            w=text_width(ln,sc); draw_text(ui,ln,(216-w)//2,y+i*(lh+2)-(len(lines)-1)*lh//2,col,sc,outline=(10,6,18),shadow=(0,0,0))
def chop(t0,text,col=(255,255,255),per=0.32,group=1,hold=None):
    """split a sentence into word chunks timed one after another"""
    ws=text.split(); out=[]; t=t0
    for i in range(0,len(ws),group):
        chunk=' '.join(ws[i:i+group]); out.append((t,t+per,chunk,col)); t+=per
    if hold: a,b,c,col_=out[-1]; out[-1]=(a,a+hold,c,col_)
    return out
WHITE=(255,255,255); YEL=(255,226,80); RED=(255,90,90); GRN=(150,255,110); PINK=(255,140,200); CYAN=(140,230,255)
def cat_sprite(C,x,y,t,push=0.0,look=True,hat=False,blink=False):
    """black cat sitting on (x,y)=paws; push 0..1 extends a paw to the left"""
    L=Layer(W,H); B='#1a1420'; B2='#2e2638'
    tail=round(math.sin(t*3)*2)
    L.line([(x+5,y-1),(x+9,y-3),(x+10+tail,y-9),(x+8+tail,y-12)],B,2)
    L.ell(x,y-5,5,5,B); L.ell(x-1,y-6,3,3,B2)                 # body
    L.ell(x-1,y-12,4,4,B)                                      # head
    L.poly([(x-5,y-13),(x-3,y-19),(x-1,y-14)],B); L.poly([(x+1,y-14),(x+2,y-19),(x+4,y-13)],B)
    L.px(x-3,y-16,'#e07090'); L.px(x+2,y-16,'#e07090')
    if blink: L.line([(x-4,y-12),(x-2,y-12)],'#e0c040'); L.line([(x,y-12),(x+2,y-12)],'#e0c040')
    else:
        L.rect(x-4,y-13,2,2,'#f0d040'); L.rect(x,y-13,2,2,'#f0d040'); L.px(x-3,y-13,'#101010'); L.px(x+1,y-13,'#101010')
    L.px(x-1,y-10,'#e07090')
    px_=round(push*7); L.rect(x-4-px_,y-3,3+px_,2,B); L.px(x-5-px_,y-3,B2)
    if hat:
        L.poly([(x-7,y-16),(x+5,y-16),(x+3,y-15),(x-5,y-15)],GOLD[2]); L.line([(x-7,y-16),(x+5,y-16)],GOLD[4])
        L.poly([(x-4,y-16),(x+3,y-16),(x-2,y-27),(x-4,y-27)],MAUVE[2]); L.rect(x-4,y-18,7,1,GOLD[3])
        L.poly([(x-3,y-9),(x+1,y-9),(x-1,y-4)],BEARD[3])
    composite(C,L)


# ================= v3 extras: magic circle, owl familiar, floating spellbook, wand trail
def magic_circle(C,t,x=WX+2,y=WY,col='#b070ff',r=22,alpha=1.0):
    for k in range(56):
        a=k/56*TAU+t*1.6; px_=x+round(math.cos(a)*r); py_=y+round(math.sin(a)*r*0.25)
        C.px(px_,py_,col); C.px(px_,py_+1,'#5a2a9a')
        a2=k/56*TAU-t*1.1; C.px(x+round(math.cos(a2)*(r-3)),y+round(math.sin(a2)*(r-3)*0.25),'#e0c0ff' if k%3==0 else col)
    for k in range(6):
        a=k/6*TAU-t*2.2; px_=x+round(math.cos(a)*(r-6)); py_=y+round(math.sin(a)*(r-6)*0.25)
        C.px(px_,py_,'#ffffff'); C.px(px_+1,py_,col)
    for k in range(5):
        ph=(t*0.8+k/5)%1; a=k*1.3+t; C.px(x+round(math.cos(a)*(r-4)),y-round(ph*30),col if k%2 else '#ffffff')
def owl(C,x,y,t,blink=None,look=0):
    """small brown owl perched with feet at (x,y)"""
    L=Layer(W,H); B='#6a4a2a'; B2='#8a6a40'; B3='#c8a878'
    L.ell(x,y-6,5,6,B); L.ell(x,y-5,3,4,B3)
    for k in range(3): L.px(x-1+k,y-6+k%2,B2)
    L.ell(x,y-13,5,4,B); L.poly([(x-5,y-16),(x-3,y-19),(x-2,y-15)],B); L.poly([(x+2,y-15),(x+3,y-19),(x+5,y-16)],B)
    bl=blink if blink is not None else ((t%4.1)<0.15)
    for ex in (-2,2):
        L.ell(x+ex,y-13,2,2,'#f8e8b0')
        if bl: L.line([(x+ex-1,y-13),(x+ex+1,y-13)],'#2a1a10')
        else: L.px(x+ex+look,y-13,'#1a1010')
    L.px(x,y-11,'#e0a030'); L.px(x-2,y,'#e0a030'); L.px(x+2,y,'#e0a030')
    composite(C,L)
def spellbook(C,x,y,t):
    yy=y+round(math.sin(t*2)*2); L=Layer(W,H)
    L.rect(x-8,yy-3,17,8,'#5a1e1e'); L.rect(x-7,yy-4,7,7,'#f0e6c8'); L.rect(x+1,yy-4,7,7,'#e6dabc'); L.line([(x,yy-4),(x,yy+2)],'#8a6a40')
    for k in range(3): L.line([(x-6,yy-2+k*2),(x-2,yy-2+k*2)],'#b0a080'); L.line([(x+2,yy-2+k*2),(x+6,yy-2+k*2)],'#b0a080')
    composite(C,L)
    for k in range(5):
        ph=(t*0.9+k/5)%1; C.px(x-6+(k*3)%13,yy-6-round(ph*10),'#ffe080' if k%2 else '#c0a0ff')
def wand_sparks(C,t,x,y,n=8,col='#ffe080'):
    for k in range(n):
        ph=(t*1.4+k/n)%1; a=k*2.1+t*3; d=ph*10
        C.px(x+round(math.cos(a)*d),y+round(math.sin(a)*d*0.8)+round(ph*6),col if ph<0.6 else '#ffffff')


# ================= v4: walking + facing
def wizard_at(C,t,x,y=WY,face=1,walk=None,outline=True,alpha=1.0,**kw):
    """draw the wizard with feet at (x,y); face=-1 looks left; walk=phase (cycles 0..1 per step pair) adds walk cycle + bob"""
    L=Layer(W,H); by=y
    if walk is not None:
        by=y-round(abs(math.sin(walk*TAU))*1.5); kw.setdefault('right','swing'); kw['bob']=False
    if face<0:
        draw_wizard(L,W-1-x,by,t,walk=walk,**kw); L.im=L.im.transpose(Image.FLIP_LEFT_RIGHT); L.d=ImageDraw.Draw(L.im)
    else:
        draw_wizard(L,x,by,t,walk=walk,**kw)
    composite(C,L,S.OUT if outline else None,alpha=alpha)
