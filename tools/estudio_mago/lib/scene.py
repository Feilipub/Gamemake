"""Mago das Poções — vídeo vertical para TikTok (108x192 mundo, 216x384 UI, saída 1080x1920)."""
import math, random, os, sys
import numpy as np
from PIL import Image, ImageDraw
from px import Canvas, Layer, hexc, mix
from font import draw_text, text_width, wrap
from timeline import *
W,H=108,192; FPS=30; TAU=math.pi*2
def ease(t): t=max(0.0,min(1.0,t)); return t*t*(3-2*t)
def win(t,a,b): return a<=t<b
def prog(t,a,b): return max(0.0,min(1.0,(t-a)/(b-a)))
# ---------------- palette ----------------
NIGHT=['#05040a','#0b0914','#120f1e','#1a1528','#241d34','#2e2640']
STONE=['#0e0b16','#1a1524','#251e30','#30283c','#3c3248','#4a3e56']
FLOOR=['#120a0c','#1e1214','#2a1a1a','#382320','#462e28']
ROBE=['#07030c','#160b1c','#2a1532','#3e2048','#58305e','#744476']
GOLD=['#4a2414','#7a4420','#a8682e','#cf9440','#f4d860','#fff4c0']
MAUVE=['#2e1426','#4e2840','#74405a','#a0606c','#c88a6c','#e8b070']
SKIN=['#5a2418','#9a4c2c','#c87a48','#e6a070','#f8c898']
BEARD=['#5e5850','#8c8476','#bdb5a0','#e2dcc4','#fbf8e8']
WOOD=['#1a0c0a','#3a1c12','#5a2e1a','#7a4426','#9a5c34','#b87444']
IRON=['#050508','#0e0e14','#1a1a24','#2a2a38','#40404e','#5a5a6a']
OUT='#05030a'
LIQ={'idle':['#1c4a3a','#24705a','#38a07a','#70d0a0','#c0f8d8'],
     'blue':['#10306a','#1850b0','#2c84f0','#78c4ff','#d8f4ff'],
     'green':['#14501c','#1c8a2a','#40c840','#9cf070','#e0ffc0'],
     'red':['#5a0c1a','#a01830','#e03848','#ff8070','#ffd8c0'],
     'purple':['#3a1060','#6a20a0','#a848e0','#e088ff','#ffd8ff'],
     'gold':['#5a3a08','#a06810','#e0a820','#ffe060','#fffad0']}
def ramp_mix(a,b,t): return [mix(a[i],b[i],t) for i in range(5)]
BAYER=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16.0
yy,xx=np.mgrid[0:H,0:W]

# ================= static background =================
def background():
    rnd=random.Random(4)
    C=Canvas(W,H,STONE[1])
    # stone blocks with bevel (light from upper-left)
    for row,y in enumerate(range(-2,150,10)):
        off=(row%2)*10
        for x in range(-off,W,20):
            base=rnd.choice(STONE[2:4])
            C.rect(x,y,20,10,STONE[0]); C.rect(x+1,y+1,18,8,base)
            C.rect(x+1,y+1,18,1,STONE[4]); C.rect(x+1,y+1,1,8,STONE[3] if base!=STONE[3] else STONE[4])
            C.rect(x+1,y+8,18,1,STONE[1]); C.rect(x+18,y+1,1,8,STONE[1])
            for _ in range(3): C.px(x+rnd.randint(3,16),y+rnd.randint(3,6),rnd.choice((STONE[1],STONE[4])))
            if rnd.random()<.15: C.rect(x+rnd.randint(2,12),y+1,rnd.randint(2,5),1,'#2a4a30')   # moss
    # arched window with moon
    wx,wy,ww,wh=8,16,30,38
    C.rect(wx-2,wy+8,ww+4,wh-6,STONE[5]); C.ell(wx+ww//2,wy+10,ww//2+2,12,STONE[5])
    C.rect(wx,wy+10,ww,wh-10,'#101838'); C.ell(wx+ww//2,wy+10,ww//2,10,'#101838')
    for j in range(wy,wy+wh):
        for i in range(wx,wx+ww):
            if C.get(i,j)=='#101838':
                t=(j-wy)/wh
                if (i+j)%2==0 and t>0.5: C.px(i,j,'#18244a')
                if t>0.75: C.px(i,j,'#18244a')
    for (sx,sy) in [(12,26),(30,22),(16,40),(33,36),(24,30),(11,48),(29,46)]: C.px(sx,sy,'#c8d8ff')
    C.ell(27,28,5,5,'#e8e4c8'); C.ell(26,27,4,4,'#fffbe0'); C.px(25,29,'#d8d2b0'); C.px(28,26,'#d8d2b0')
    C.rect(wx+ww//2,wy,1,wh,WOOD[1]); C.rect(wx,wy+22,ww,1,WOOD[1])
    C.rect(wx-3,wy+wh,ww+6,3,STONE[5]); C.rect(wx-3,wy+wh,ww+6,1,'#5a5068')
    # hanging herbs + cobweb top-center
    for i,x in enumerate(range(46,62,5)):
        C.line([(x,0),(x,7+i%2*3)],WOOD[2]); C.ell(x,10+i%2*3,2,3,['#2a5a2a','#5a5a1a','#3a6a3a'][i%3]); C.px(x-1,9+i%2*3,'#6aaa4a')
    for k in range(5): C.line([(W-1,0),(W-1-k*4,14-k*2)],'#3a3448')
    # shelves with bottles
    cols=['#c03040','#3060d0','#40b060','#e0a030','#a040c0','#30b0b0','#e06080']
    for sy in (44,70):
        C.rect(60,sy,48,3,WOOD[3]); C.rect(60,sy,48,1,WOOD[5]); C.rect(60,sy+3,48,1,WOOD[0])
        for bx in (63,103): C.rect(bx,sy+3,2,4,WOOD[2]); C.px(bx,sy+3,WOOD[4])
        x=62
        while x<104:
            kind=rnd.randint(0,3); c=rnd.choice(cols); dk=mix(c,'#000000',.45)
            if kind==0:
                C.ell(x+3,sy-4,3,3,dk); C.ell(x+3,sy-3,3,2,c); C.rect(x+2,sy-10,3,3,'#8a8aa0'); C.rect(x+2,sy-11,3,1,WOOD[4]); C.px(x+1,sy-5,'#ffffff'); x+=8
            elif kind==1:
                C.rect(x,sy-10,5,10,dk); C.rect(x,sy-7,5,7,c); C.rect(x+1,sy-13,3,3,'#8a8aa0'); C.rect(x+1,sy-14,3,1,WOOD[4]); C.px(x,sy-9,'#ffffff'); C.px(x,sy-8,'#ffffff'); x+=7
            elif kind==2:
                C.rect(x,sy-7,7,7,'#4a4a5a'); C.rect(x+1,sy-6,5,5,mix(c,'#4a4a5a',.5)); C.rect(x,sy-8,7,1,WOOD[4]); x+=9
            else:  # book stack
                for b,bc in enumerate(['#6a2a2a','#2a3a6a','#3a5a2a']): C.rect(x,sy-2-b*2,8,2,bc); C.rect(x,sy-2-b*2,8,1,mix(bc,'#ffffff',.25))
                x+=10
    # candle holders on shelf ends (flames drawn per frame)
    for (cx,cy) in CANDLES: C.rect(cx-1,cy,3,5,'#e8e0c8'); C.rect(cx-1,cy,1,5,'#fffbe8'); C.rect(cx-2,cy+5,5,1,GOLD[1])
    # floor: stone tiles in light perspective
    C.rect(0,150,W,H-150,FLOOR[2])
    rows=[150,155,161,168,176,185,195]
    for i in range(len(rows)-1):
        y0,y1=rows[i],rows[i+1]; off=(i%2)*9
        for x in range(-off-18,W+18,18):
            C.rect(x+1,y0+1,17,y1-y0-1,rnd.choice(FLOOR[2:4])); C.rect(x+1,y0+1,17,1,FLOOR[4])
        C.rect(0,y0,W,1,FLOOR[0])
    for _ in range(140):
        x,y=rnd.randrange(W),rnd.randint(151,H-1); C.px(x,y,rnd.choice(FLOOR[1:4]))
    C.rect(0,149,W,2,STONE[0])
    # rug under the wizard
    C.poly([(4,158),(48,158),(52,168),(0,168)],'#5a1a2a'); C.poly([(6,159),(46,159),(49,166),(3,166)],'#7a2a3a')
    for x in range(8,46,4): C.px(x,162,GOLD[3]); C.px(x+2,163,GOLD[2])
    C.line([(4,158),(48,158)],GOLD[2])
    return C
CANDLES=[(66,39),(100,65)]

# ================= layers & effects =================
def composite(C,L,outline=OUT,alpha=1.0,tint=None,thick_bottom=True):
    a=np.asarray(L.im)
    mask=a[:,:,3]>0
    if alpha<1.0:
        th=np.tile(BAYER,(H//4+1,W//4+1))[:H,:W]
        mask&= th<alpha
    base=np.asarray(C.im).copy()
    if outline and alpha>0.6:
        m=np.zeros_like(mask)
        m[1:,:]|=mask[:-1,:]; m[:-1,:]|=mask[1:,:]; m[:,1:]|=mask[:,:-1]; m[:,:-1]|=mask[:,1:]
        if thick_bottom: m[2:,:]|=mask[:-2,:]
        base[m&~mask]=hexc(outline)
    src=a[:,:,:3]
    if tint is not None: src=np.broadcast_to(np.array(hexc(tint),dtype='uint8'),src.shape)
    base[mask]=src[mask]
    C.im=Image.fromarray(base); C.d=ImageDraw.Draw(C.im)
def light(img,cx,cy,r,col,strength,bands=5,dither=True):
    d=np.hypot(xx-cx,(yy-cy))/max(r,1)
    raw=np.clip(1-d,0,1)
    if dither:
        th=np.tile(BAYER,(H//4+1,W//4+1))[:H,:W]
        q=np.floor(raw*bands+th)/bands
    else: q=np.ceil(raw*bands)/bands
    t=np.clip(q,0,1)*strength
    c=np.array(hexc(col),float)
    return img*(1-t[...,None]*0.35)+c*t[...,None]*0.55
def vignette(img,strength=0.55):
    d=np.hypot((xx-W/2)/(W/2),(yy-H/2)/(H/2))
    th=np.tile(BAYER,(H//4+1,W//4+1))[:H,:W]
    v=np.clip((d-0.75)*1.6,0,1); v=np.floor(v*4+th*0.9)/4
    return img*(1-v[...,None]*strength)


def draw_arm(L,sx,sy,hx,hy,shade,hi,bend=1,cuff=True,hand=True,fist=False):
    """two-segment arm: shoulder (sx,sy) -> elbow -> wrist (hx,hy); bell sleeve widens at the wrist; gold cuff; shaded hand with thumb"""
    dx,dy=hx-sx,hy-sy; ln=max(1.0,math.hypot(dx,dy)); nx,ny=-dy/ln,dx/ln
    reach=min(1.0,ln/18.0); b=bend*3.2*(1-reach*0.7)
    ex,ey=sx+dx*0.5+nx*b, sy+dy*0.5+ny*b
    def seg(x0,y0,x1,y1,w0,w1,col):
        ddx,ddy=x1-x0,y1-y0; l=max(1.0,math.hypot(ddx,ddy)); px_,py_=-ddy/l,ddx/l
        L.poly([(x0+px_*w0,y0+py_*w0),(x1+px_*w1,y1+py_*w1),(x1-px_*w1,y1-py_*w1),(x0-px_*w0,y0-py_*w0)],col)
    seg(sx,sy,ex,ey,2.6,2.4,ROBE[2]); seg(ex,ey,hx,hy,2.4,3.4,ROBE[2])
    seg(sx,sy,ex,ey,1.0,0.9,shade); seg(ex,ey,hx,hy,0.9,1.4,shade)
    L.line([(sx+nx*-2,sy+ny*-2),(ex+nx*-2,ey+ny*-2),(hx+nx*-3,hy+ny*-3)],hi)
    L.px(round(ex),round(ey),ROBE[1])
    ux,uy=dx/ln,dy/ln
    if cuff:
        cx,cy=hx-ux*1.0,hy-uy*1.0
        L.line([(cx+nx*3.4,cy+ny*3.4),(cx-nx*3.4,cy-ny*3.4)],GOLD[3],2); L.px(round(cx+nx*2),round(cy+ny*2),GOLD[5])
    if hand:
        hx2,hy2=hx+ux*2.2,hy+uy*2.2
        L.ell(round(hx2),round(hy2),2,2,SKIN[2]); L.px(round(hx2-nx),round(hy2-ny),SKIN[3]); L.px(round(hx2+ux*1.5+nx*1.2),round(hy2+uy*1.5+ny*1.2),SKIN[1])
        tx_,ty_=hx2-nx*2.2+ux*0.6,hy2-ny*2.2+uy*0.6; L.px(round(tx_),round(ty_),SKIN[3])
        if not fist: L.px(round(hx2+ux*2.4),round(hy2+uy*2.4),SKIN[2])
    return (round(hx+ux*2.2),round(hy+uy*2.2))

# ================= wizard =================
WX,WY=30,156     # feet position
def draw_wizard(L,ox,oy,t,stir_a=0.0,left='rest',lp=0.0,eyes='open',hat_dy=0,head_tilt=0,flask=None,spoon_end=None,bob=True,show_body=True,show_hatbeard=True,hat=True,cat=False,mouth=0,brow='neutral',right='stir',glasses=False,rim=None,look='fwd',walk=None):
    """Draw the wizard into layer L. left in rest|throw|hold|drink|wave; lp=0..1 progress of that pose."""
    P=lambda x,y:(ox+x,oy+y)
    hb=round(math.sin(t*TAU*0.45)*0.7) if bob else 0
    sway=round(math.sin(t*TAU*0.3)*1); hs=0
    if walk is not None:
        ws=math.sin(walk*TAU); sway=round(-ws*2); hs=round(ws*2)
    hand_r=None
    if show_body:
        if walk is not None:                                   # back shoe (behind robe)
            bxs=ox-4-round(ws*4); L.rect(bxs,oy-1,6,2,'#1a0c10'); L.rect(bxs+4,oy-2,3,1,'#1a0c10')
        # back cape
        L.poly([P(-9,-50),P(-19,-24),P(-22+sway,0),P(-8,0)],ROBE[1])
        L.line([P(-10,-48),P(-19,-24),P(-21+sway,-1)],ROBE[3])
        L.line([P(-14,-30),P(-17+sway,-2)],ROBE[2])
        # robe
        L.poly([P(-9,-52),P(9,-52),P(13,-34),P(17+hs,0),P(-17+hs,0),P(-13,-34)],ROBE[2])
        L.poly([P(4,-50),P(9,-52),P(13,-34),P(17+hs,-1),P(8+hs,-1),P(6,-34)],ROBE[3])
        L.line([P(10,-44),P(13,-30),P(16,-2)],ROBE[4]); L.line([P(11,-40),P(14,-20)],ROBE[5])
        for fx in (-11,-5,1): L.line([P(fx,-30),P(fx-2,-1)],ROBE[1])
        L.line([P(-4,-32),P(-5,-2)],ROBE[3])
        L.line([P(5,-33),P(8,-1)],GOLD[2]); L.line([P(6,-33),P(9,-1)],GOLD[1])
        L.rect(ox-17,oy-2,34,2,GOLD[1]); L.line([P(-17,-2),P(16,-2)],GOLD[3])
        for gx in range(-14,15,5): L.px(ox+gx,oy-1,GOLD[4])
        # shoes
        fxs=ox+6+(round(ws*4) if walk is not None else 0)
        L.rect(fxs,oy-1,7,2,'#2a1418'); L.rect(fxs+5,oy-2,3,1,'#2a1418')
        # belt + buckle + pouch
        L.rect(ox-12,oy-35,26,3,GOLD[2]); L.rect(ox-12,oy-35,26,1,GOLD[3]); L.rect(ox+1,oy-36,4,5,GOLD[4]); L.rect(ox+2,oy-35,2,3,GOLD[2])
        L.rect(ox-10,oy-32,5,6,WOOD[2]); L.rect(ox-10,oy-32,5,1,WOOD[4])
        # mantle with gold zig-zag
        L.poly([P(-11,-53),P(0,-57),P(10,-55),P(14,-46),P(6,-42),P(-6,-43),P(-13,-47)],ROBE[3])
        L.poly([P(2,-55),P(10,-55),P(14,-46),P(8,-44)],ROBE[4])
        zz=[P(-12,-47+(i%2)) for i in range(0)]
        for i in range(0,25,2): L.px(ox-12+i,oy-47+(1 if (i//2)%2 else 0),GOLD[3]); L.px(ox-12+i,oy-46+(1 if (i//2)%2 else 0),GOLD[1])
        L.line([P(-6,-43),P(6,-42),P(14,-46)],GOLD[3]); L.line([P(-6,-42),P(6,-41)],GOLD[1])
        L.px(ox+11,oy-50,GOLD[5])
        # right arm -> spoon hand
        if right=='stir': hx=ox+24+round(math.cos(stir_a)*3); hy=oy-38+round(math.sin(stir_a)*1.5)
        elif right=='cast': hx=ox+26+round(math.sin(t*5)*1); hy=oy-78+round(math.cos(t*5)*1)
        elif right=='point': hx=ox+25; hy=oy-64
        elif right=='shrug': hx=ox+22; hy=oy-46
        elif right=='scale': hx=ox+22; hy=oy-50+round(math.sin(t*9)*6)
        elif right=='swing': hx=ox+20+round(math.sin((walk or 0)*TAU)*4); hy=oy-40
        elif right=='wand': hx=ox+24; hy=oy-62+round(math.sin(t*6)*1)
        elif right=='thumb': hx=ox+24; hy=oy-52
        elif right=='facepalm': hx=ox+16; hy=oy-62
        elif right=='clap': hx=ox+20+round(abs(math.sin(t*10))*3); hy=oy-54
        elif right=='bang': hx=ox+22; hy=oy-58-round(abs(math.sin(lp*TAU*2))*8)
        else: hx=ox+20; hy=oy-40
        hand_r=(hx,hy) if right=='stir' else None
        if right=='bang': L.rect(hx-2,hy-8,9,3,IRON[3]); L.rect(hx-2,hy-8,9,1,IRON[5]); L.line([(hx+2,hy-5),(hx+2,hy)],WOOD[3])
        if right=='point': L.px(hx+3,hy-1,SKIN[3]); L.px(hx+4,hy-2,SKIN[3]); L.px(hx+5,hy-3,SKIN[2])
        if right=='wand':
            L.line([(hx+1,hy+1),(hx+7,hy-11)],WOOD[2],2); L.line([(hx+2,hy),(hx+7,hy-10)],WOOD[4])
            sx,sy=hx+8,hy-13; tw=1 if int(t*8)%2 else 2
            for dx,dy in ((0,0),(-1,0),(1,0),(0,-1),(0,1)): L.px(sx+dx,sy+dy,GOLD[5] if (dx,dy)==(0,0) else GOLD[4])
            L.px(sx-tw-1,sy,GOLD[3]); L.px(sx+tw+1,sy,GOLD[3]); L.px(sx,sy-tw-1,GOLD[3]); L.px(sx,sy+tw+1,GOLD[3])
        if right=='thumb': L.rect(hx,hy-4,2,4,SKIN[3]); L.px(hx,hy-4,SKIN[4])
        draw_arm(L,ox+9,oy-50,hx-2,hy,ROBE[3],ROBE[5],bend=-1 if hy<oy-55 else 1)
        if left=='rest' or (left in('throw','wave') and lp<=0):
            draw_arm(L,ox-4,oy-50,ox-3,oy-39,ROBE[2],ROBE[4],bend=-1)
    hx0=ox; hy0=oy+hb
    if show_hatbeard:
        Q=lambda x,y:(hx0+x,hy0+y+head_tilt*0)
        if show_body:
            # face
            L.poly([Q(-1,-69),Q(10,-69),Q(12,-64),Q(11,-56),Q(0,-56)],SKIN[1])
            L.rect(hx0+2,hy0-68,8,5,SKIN[2]); L.rect(hx0+3,hy0-67,6,2,SKIN[3])
            L.rect(hx0+11,hy0-65,3,4,SKIN[3]); L.px(hx0+13,hy0-62,SKIN[2]); L.px(hx0+11,hy0-61,SKIN[1])   # nose
            L.px(hx0+7,hy0-62,SKIN[0])                                                                 # cheek shadow
        # eyes / brows (also shown when invisible: floating eyes)
        ex,ey=hx0+8,hy0-65
        lx={'back':-1,'fwd':0,'ahead':1}.get(look,0); ly=-1 if look=='up' else 0
        if eyes=='open':
            L.px(ex-1,ey,'#efe6dc' if show_body else '#1a0808'); L.px(ex+lx,ey+ly,'#1a0808'); L.px(ex+lx,ey-1+ly,'#2a1010' if show_body else '#1a0808'); L.px(ex+1,ey,SKIN[1] if show_body else '#1a0808')
        elif eyes=='star':
            tw=int(t*8)%2
            for dx,dy in ((0,0),(-1,0),(1,0),(0,-1),(0,1)): L.px(ex+dx,ey-1+dy,'#fff8c0' if (dx,dy)==(0,0) else '#ffd040')
            if tw: L.px(ex-2,ey-1,'#ffd040'); L.px(ex+2,ey-1,'#ffd040')
        elif eyes=='heart':
            for dx,dy in ((-1,-2),(1,-2),(-1,-1),(0,-1),(1,-1),(0,0)): L.px(ex+dx,ey+dy,'#ff3a7a')
            L.px(ex-1,ey-2,'#ff9ac0')
        elif eyes=='sleepy':
            L.line([(ex-1,ey),(ex+1,ey)],'#1a0808'); L.line([(ex-1,ey-1),(ex+1,ey-1)],SKIN[1])
        elif eyes=='closed': L.line([(ex-1,ey),(ex+1,ey)],'#1a0808')
        elif eyes=='wide': L.rect(ex-1,ey-2,3,3,'#ffffff'); L.px(ex,ey-1,'#1a0808')
        elif eyes=='dizzy': L.px(ex-1,ey-1,'#1a0808'); L.px(ex+1,ey+1,'#1a0808'); L.px(ex+1,ey-1,'#1a0808'); L.px(ex-1,ey+1,'#1a0808'); L.px(ex,ey,'#1a0808')
        if brow=='up': L.rect(ex-2,ey-4,5,1,BEARD[2]); L.px(ex-2,ey-3,BEARD[1])
        elif brow=='angry': L.line([(ex-2,ey-4),(ex+2,ey-2)],BEARD[3]); L.px(ex-2,ey-3,BEARD[1])
        elif brow=='sad': L.line([(ex-2,ey-2),(ex+2,ey-4)],BEARD[2])
        else: L.rect(ex-2,ey-3,5,1,BEARD[2])
        if glasses:
            L.rect(ex-3,ey-2,6,3,'#101014'); L.rect(ex+3,ey-2,4,3,'#101014'); L.px(ex-2,ey-2,'#5a5a70'); L.line([(ex-3,ey-1),(ex-6,ey-2)],'#e8e0d0')
        # beard (sways)
        bs=round(math.sin(t*TAU*0.6)*0.8)
        L.poly([Q(0,-60),Q(13,-60),Q(13,-54),Q(11,-46),Q(8+bs,-36),Q(5+bs,-37),Q(2,-46),Q(-1,-54)],BEARD[2])
        L.poly([Q(4,-60),Q(13,-60),Q(12,-52),Q(9+bs,-40),Q(7,-48)],BEARD[3])
        L.line([Q(10,-59),Q(9,-47)],BEARD[4]); L.line([Q(1,-54),Q(4,-45)],BEARD[1]); L.line([Q(6,-50),Q(7+bs,-39)],BEARD[1])
        if mouth:
            if mouth==4:
                L.line([(hx0+7,hy0-57),(hx0+11,hy0-57)],'#2a0a0e'); L.px(hx0+6,hy0-58,'#2a0a0e'); L.px(hx0+12,hy0-58,'#2a0a0e')
            mh={1:1,2:2,3:3,4:0}[mouth]; mw={1:4,2:5,3:3,4:0}[mouth]; mx=hx0+(7 if mouth!=3 else 8)
            if mouth!=4: L.rect(mx,hy0-58,mw,mh+1,'#2a0a0e'); L.rect(mx+1,hy0-58+mh,max(1,mw-2),1,'#b04a5a')
            if mouth==2: L.rect(mx,hy0-58,mw,1,'#f4ece0')
        L.rect(hx0+5,hy0-60,9,2,BEARD[4]); L.rect(hx0+11,hy0-59,3,1,BEARD[3])                       # moustache
        if hat:
            hy1=hy0+hat_dy; R=lambda x,y:(hx0+x,hy1+y)
            tipx=-13+round(math.sin(t*TAU*0.45)*1.2)
            L.poly([R(tipx,-98),R(tipx+3,-97),R(2,-86),R(11,-74),R(-6,-74),R(-6,-84)],MAUVE[2])
            L.poly([R(tipx,-98),R(tipx+3,-97),R(2,-86),R(11,-74),R(5,-74),R(-1,-84)],MAUVE[1])
            L.poly([R(tipx,-97),R(-8,-90),R(-6,-80),R(-5,-74),R(-6,-74),R(-7,-86)],MAUVE[3])
            L.line([R(tipx+1,-97),R(-8,-90),R(-5,-80)],MAUVE[4])
            L.rect(hx0-6,hy1-77,17,3,GOLD[2]); L.rect(hx0-6,hy1-77,17,1,GOLD[4]); L.px(hx0+2,hy1-76,GOLD[5])  # band + gem
            L.px(hx0+2,hy1-76,'#60c0ff')
            L.poly([R(-11,-73),R(-3,-76),R(12,-75),R(19,-71),R(10,-70),R(-6,-70)],GOLD[2])
            L.line([R(-11,-73),R(-3,-76),R(12,-75)],GOLD[4]); L.line([R(-6,-70),R(10,-70),R(19,-71)],GOLD[1])
            for sx,sy in [(-4,-88),(3,-80),(-1,-93)]: L.px(hx0+sx,hy1+sy,GOLD[5])                       # hat stars
        if cat:   # cat ears + whiskers (after the swap)
            for ex in (0,8): L.poly([(hx0+ex,hy0-68),(hx0+ex+4,hy0-68),(hx0+ex+1,hy0-75)],'#2a2030'); L.px(hx0+ex+1,hy0-70,'#e07090')
            L.rect(hx0-1,hy0-70,12,2,'#2a2030')
            for dy in (-62,-60): L.line([(hx0+13,hy0+dy),(hx0+17,hy0+dy-1)],'#e8e0d0')
    if show_body and not (left=='rest' or (left in('throw','wave') and lp<=0)):
        if left=='throw':
            a=lp
            if a<0.5: tx,ty=-2+a*2*14,-50-a*2*16
            else: tx,ty=12+(a-.5)*2*12,-66+(a-.5)*2*12
        elif left=='hold':  tx,ty=18,-60
        elif left=='point': tx,ty=14,-76
        elif left=='think': tx,ty=9,-55
        elif left=='cast':  tx,ty=-14+round(math.sin(t*5+1)*1),-80+round(math.cos(t*5+1)*1)
        elif left=='shrug': tx,ty=-14,-46
        elif left=='scale': tx,ty=-14,-50-round(math.sin(t*9)*6)
        elif left=='bang':  tx,ty=10,-64-round(abs(math.sin(lp*TAU*2))*8)
        elif left=='drink': tx,ty=12,-60
        elif left=='book':  tx,ty=13,-52
        elif left=='clap':  tx,ty=14-round(abs(math.sin(t*10))*3),-54
        else:               tx,ty=10+round(math.sin(lp*TAU*3)*3),-68
        tx,ty=ox+round(tx),oy+round(ty)
        draw_arm(L,ox-1,oy-50,tx,ty+2,ROBE[3],ROBE[5],bend=1 if tx>ox else -1)
        if flask: draw_flask(L,tx,ty-4,*flask)
        if left=='point': L.px(tx+3,ty-1,SKIN[3]); L.px(tx+4,ty-2,SKIN[3])
        if left=='book':
            bx,by=tx+3,ty-3; L.rect(bx-1,by-1,15,9,'#5a1e1e'); L.rect(bx,by,6,7,'#f0e6c8'); L.rect(bx+7,by,6,7,'#e6dabc'); L.line([(bx+6,by),(bx+6,by+6)],'#8a6a40')
            for k in range(3): L.line([(bx+1,by+2+k*2),(bx+4,by+2+k*2)],'#b0a080'); L.line([(bx+8,by+2+k*2),(bx+11,by+2+k*2)],'#b0a080')
            fl=(t*1.3)%3
            if fl<0.35: fx=bx+7+round(-fl/0.35*7); L.line([(fx,by-1),(fx,by+6)],'#fff8e0')
    if show_body and right=='facepalm':
        L.rect(hx0+8,hy0-68,5,5,SKIN[2]); L.rect(hx0+8,hy0-68,5,1,SKIN[3]); L.px(hx0+12,hy0-64,SKIN[1])
    if show_body and rim:
        for yy_ in range(oy-50,oy-2,2): L.px(ox+15+((yy_-oy)//-12 if yy_>oy-34 else -2),yy_,rim)
    return hand_r

def draw_flask(L,x,y,fill,ramp,corked=True):
    """small flask held at (x,y) = neck bottom"""
    L.ell(x+1,y+4,4,4,'#3a3a52'); L.rect(x,y-3,3,5,'#3a3a52')
    L.ell(x+1,y+4,3,3,'#1a1a28')
    if fill>0:
        top=round(y+7-fill*7)
        for j in range(top,y+8):
            for i in range(x-3,x+6):
                if ((i-x-1)/3.6)**2+((j-y-4)/3.6)**2<=1: L.px(i,j,ramp[2] if j>top else ramp[3])
    L.px(x-1,y+2,'#ffffff'); L.px(x-1,y+3,'#c0c0e0')
    if corked: L.rect(x,y-5,3,2,WOOD[4])

# ================= frog =================
def draw_frog(L,x,y,t,croak=0.0,blink=False,hop=0.0):
    """frog wizard sitting at feet position (x,y); hop 0..1 lifts it"""
    G=['#0c2a10','#1a4a1c','#2c7a2a','#4aa83a','#8ad860','#c8f090']
    oy=y-round(math.sin(hop*math.pi)*12)
    L.ell(x,oy-6,11,7,G[2]); L.ell(x-2,oy-8,8,4,G[3]); L.ell(x-3,oy-10,4,2,G[4])
    L.ell(x+2,oy-3,8,3,'#d8e890')                                          # belly
    for fx in (-9,7): L.ell(x+fx,oy-1,4,2,G[2]); L.px(x+fx-2,oy,G[1]); L.px(x+fx+2,oy,G[1])
    L.ell(x+7,oy-4,2,3,G[3])                                               # front leg
    # eyes
    for ex in (-5,5):
        L.ell(x+ex,oy-13,3,3,G[3]); L.ell(x+ex,oy-13,2,2,'#ffffff')
        if blink: L.line([(x+ex-2,oy-13),(x+ex+2,oy-13)],G[1])
        else: L.rect(x+ex,oy-14,2,2,'#101010')
    L.line([(x-4,oy-7),(x+6,oy-7)],G[1]); L.px(x+7,oy-8,G[1])               # smile
    # throat sac
    if croak>0:
        r=round(2+croak*4); L.ell(x+3,oy-4,r+1,r,'#e8d8a0'); L.ell(x+2,oy-5,max(1,r-2),max(1,r-2),'#fff8d0')
    # tiny beard + hat
    L.poly([(x-1,oy-6),(x+5,oy-6),(x+2,oy+1)],BEARD[3]); L.px(x+2,oy-4,BEARD[4])
    L.poly([(x-10,oy-17),(x+10,oy-17),(x+7,oy-15),(x-7,oy-15)],GOLD[2]); L.line([(x-10,oy-17),(x+10,oy-17)],GOLD[4])
    L.poly([(x-6,oy-17),(x+5,oy-17),(x-2,oy-31),(x-5,oy-32)],MAUVE[2]); L.poly([(x-1,oy-17),(x+5,oy-17),(x-3,oy-31)],MAUVE[1])
    L.rect(x-6,oy-19,11,2,GOLD[2]); L.px(x-1,oy-19,'#60c0ff')

# ================= cauldron & fx =================
CX,CY=78,140; SURF=127
def fire(C,f,cx,cy,big=1.0):
    rnd=random.Random(f//2)
    for dx in range(-12,13,3):
        h=round((rnd.randint(5,10)-abs(dx)//4)*big)
        C.poly([(cx+dx-2,cy),(cx+dx+2,cy),(cx+dx+rnd.choice((-1,0,1)),cy-h)],'#d84010')
        C.poly([(cx+dx-1,cy),(cx+dx+1,cy),(cx+dx,cy-max(1,h-4))],'#ffb030')
        if h>7: C.px(cx+dx,cy-h+5,'#fff0a0')
    for i in range(-14,15,4): C.rect(cx+i,cy,4,3,WOOD[1]); C.rect(cx+i,cy,4,1,'#ff7020' if rnd.random()<.5 else '#a03010')
    for k in range(4):   # embers
        ph=(f/30*0.8+k*0.27)%1; C.px(cx-8+k*5+round(math.sin(ph*9)*2),cy-6-round(ph*26),'#ffa040' if ph<.6 else '#a04020')
def cauldron(C,t,f,ramp,stir_a,hand,shake=0.0,level=0.0):
    rnd=random.Random(f)
    sx=round(rnd.uniform(-1,1)*shake*2); sy=round(rnd.uniform(-1,1)*shake)
    cx,cy=CX+sx,CY+sy
    fire(C,f,CX,158,1+shake*0.6)
    L=Layer(W,H)
    for lx in (cx-14,cx+11): L.rect(lx,cy+10,4,8,IRON[1]); L.rect(lx,cy+10,1,8,IRON[3])
    L.ell(cx,cy,21,15,IRON[1]); L.ell(cx-3,cy-2,16,11,IRON[2]); L.ell(cx-6,cy-4,9,6,IRON[3]); L.ell(cx-8,cy-6,4,3,IRON[4])
    L.line([(cx-12,cy-8),(cx-15,cy-1)],IRON[5]); L.line([(cx-11,cy-9),(cx-13,cy-6)],'#8a8a9a')
    L.rect(cx-21,cy-3,42,2,IRON[2]); L.rect(cx-21,cy-3,42,1,IRON[3])                       # band
    for rx in (cx-23,cx+20): L.ell(rx+1,cy-6,2,3,IRON[3]); L.px(rx+1,cy-6,IRON[0])         # ring handles
    surf=SURF+sy-round(level*3)
    L.ell(cx,SURF+sy,22,4,IRON[4]); L.ell(cx,SURF+sy,20,3,IRON[2])
    L.ell(cx,surf+1,19,2,ramp[1]); L.ell(cx,surf,17,2,ramp[2]); L.ell(cx-3,surf,10,1,ramp[3])
    from px import Canvas as _C
    composite(C,L)
    # rim reflections of the glow
    C.line([(cx-19,SURF+sy+3),(cx+19,SURF+sy+3)],mix(IRON[3],ramp[2],.35))
    C.px(cx-16,SURF+sy+1,IRON[5]); C.px(cx-15,SURF+sy+1,IRON[5])
    # swirl highlight
    sw=cx+round(math.cos(stir_a+1.6)*11); C.rect(sw-3,surf,5,1,ramp[4]); C.px(sw-5,surf+1,ramp[3])
    # bubbles
    nb=6+round(shake*8)
    for k in range(nb):
        ph=(t*(1.3+shake*1.5)+k*0.37)%1; bx=cx-15+(k*11)%31; by=surf
        rb=1 if ph<0.3 else 2 if ph<0.55 or shake<0.3 else 3
        if ph<0.7: C.ell(bx,by-rb+1,rb,rb,ramp[3]); C.px(bx-1,by-rb,ramp[4])
        elif ph<0.82: 
            for dx,dy in((-2,-2),(2,-2),(0,-3),(-3,0),(3,0)): C.px(bx+dx,by+dy,ramp[4])
    # spoon
    if hand:
        hx,hy=hand
        ex=cx+round(math.cos(stir_a)*8); ey=surf
        C.line([(hx+1,hy-6),(ex,ey)],WOOD[3],2); C.line([(hx+1,hy-7),(ex-1,ey-1)],WOOD[5]); C.px(hx+1,hy-7,WOOD[5])
    return cx,surf
def steam(C,t,ramp,cx,cy,amount=1.0):
    for k in range(int(16*amount)):
        ph=(t*0.42+k/16)%1
        x=cx-14+(k*7)%29+math.sin(ph*TAU+k)*3; y=cy-3-ph*55
        s=3 if ph<0.35 else 2 if ph<0.7 else 1
        c=mix(ramp[3],'#6a6080',min(1,ph*1.3))
        if ph<0.92: C.rect(x,y,s,s,c)
def burst(C,t,t0,cx,cy,n,cols,spread=1.0,seed=0,life=1.4,grav=18):
    age=t-t0
    if age<0 or age>life: return
    rnd=random.Random(seed)
    for k in range(n):
        a=rnd.uniform(0,TAU); v=rnd.uniform(12,40)*spread
        x=cx+math.cos(a)*v*age; y=cy+math.sin(a)*v*age*0.8+grav*age*age-8*age
        c=cols[(k+int(age*12))%len(cols)]
        if age<life*0.75 or k%2:
            if (k+int(t*20))%4: C.px(x,y,c)
            if age<0.35: C.rect(x,y,2,2,c)
            elif k%5==0 and int(t*12)%2: C.px(x-1,y,c); C.px(x+1,y,c); C.px(x,y-1,c); C.px(x,y+1,c)

# ---- ingredients ----
def ingredient(C,kind,x,y,spin):
    L=Layer(W,H); x,y=round(x),round(y)
    flip=int(spin*4)%2
    if kind=='crystal':
        L.poly([(x,y-5),(x+3,y-1),(x,y+5),(x-3,y-1)],'#3090ff'); L.poly([(x,y-5),(x+3,y-1),(x,y+1)],'#90d8ff'); L.px(x-1,y-2,'#ffffff')
    elif kind=='feather':
        L.line([(x-4,y+4),(x+4,y-4)],'#d8e8ff',3); L.line([(x-4,y+4),(x+4,y-4)],'#6aa0e0'); L.line([(x-5,y+5),(x-3,y+3)],'#ffffff')
    elif kind=='bolt':
        L.poly([(x+1,y-6),(x-3,y+1),(x,y+1),(x-1,y+6),(x+3,y-1),(x,y-1)],'#ffe040'); L.px(x,y-3,'#ffffff')
    elif kind=='leaf':
        L.ell(x,y,3,5,'#3aa83a'); L.ell(x-1,y-1,1,3,'#8ae070'); L.line([(x,y-4),(x,y+6)],'#1a6a1a')
    elif kind=='ghost':
        L.ell(x,y-1,4,4,'#e8f0ff'); L.rect(x-4,y-1,9,5,'#e8f0ff')
        for i in (-4,-1,2): L.px(x+i,y+4,'#e8f0ff'); L.px(x+i+1,y+4,'#e8f0ff')
        L.px(x-2,y-2,'#202040'); L.px(x+1,y-2,'#202040'); L.px(x,y,'#202040')
    elif kind=='eye':
        L.ell(x,y,4,4,'#f8f8f0'); L.ell(x+1,y,2,2,'#30a050'); L.px(x+1,y,'#000000'); L.px(x-2,y-2,'#ffffff'); L.line([(x-4,y+1),(x-2,y+2)],'#e04040')
    elif kind=='mushroom':
        L.rect(x-1,y,3,5,'#f0e8d8'); L.ell(x,y-1,5,3,'#e02838'); L.rect(x-5,y-1,11,1,'#a01828')
        for dx,dy in((-3,-2),(1,-3),(3,-1)): L.px(x+dx,y+dy,'#ffffff')
    elif kind=='star':
        pts=[]
        for i in range(10):
            a=-math.pi/2+i*math.pi/5+spin*0.5; r=5 if i%2==0 else 2
            pts.append((x+math.cos(a)*r,y+math.sin(a)*r))
        L.poly(pts,'#ffd840'); L.px(x,y,'#fffad0')
    elif kind=='chili':
        L.poly([(x-4,y-2),(x+3,y-1),(x+4,y+3),(x-2,y+2)],'#e02020'); L.line([(x-3,y-1),(x+2,y)],'#ff7060'); L.rect(x-5,y-4,2,3,'#2a8a2a')
    elif kind=='skull':
        L.ell(x,y-1,4,4,'#e8e0d0'); L.rect(x-2,y+2,5,3,'#e8e0d0'); L.rect(x-2,y-1,2,2,'#201818'); L.rect(x+1,y-1,2,2,'#201818'); L.px(x,y+3,'#201818')
    if flip: L.im=L.im.transpose(Image.FLIP_LEFT_RIGHT); L.im=L.im.transform(L.im.size,Image.AFFINE,(1,0,W-1-2*x,0,1,0)) if False else L.im
    composite(C,L)
def throw_path(u,start,end):
    x=start[0]+(end[0]-start[0])*u; y=start[1]+(end[1]-start[1])*u-math.sin(u*math.pi)*26
    return x,y

# ================= UI / captions =================
CAPCOL={'white':((255,255,255),(110,40,170)),'yellow':((255,226,80),(150,60,20)),'blue_big':((120,210,255),(20,60,160)),
        'red_big':((255,90,90),(120,10,30)),'green_big':((150,255,110),(20,100,40)),'white_big':((255,255,255),(200,40,120))}
def caption(ui,text,t,t0,t1,style='white',y=58):
    if not (t0<=t<t1): return
    big=style.endswith('big'); scale=3 if big else 2
    col,sh=CAPCOL[style]
    lines=wrap(text,200,scale)
    # pop-in: letters appear typewriter style, whole block bounces in
    n_vis=int((t-t0)*40)+1
    bounce=0 if t-t0>0.18 else round((0.18-(t-t0))*60)
    lh=12*scale//1+ (4 if big else 3)
    yy0=y-bounce
    shown=0
    for li,line in enumerate(lines):
        vis=line[:max(0,n_vis-shown)]; shown+=len(line)
        w=text_width(line,scale); x=(216-w)//2
        if big and (int(t*8)%2==0): x+=1    # tiny jitter on shouty captions
        draw_text(ui,vis,x,yy0+li*lh,col,scale,outline=(12,6,20),shadow=sh)
def banner(ui,t,t0,num,name,col):
    d=t-t0
    if d<0 or d>2.6: return
    slide=round(max(0,0.25-d)*600) if d<0.25 else (round((d-2.35)*900) if d>2.35 else 0)
    dr=ImageDraw.Draw(ui)
    y=150
    x0=-slide
    c=hexc(col)
    dr.rectangle([x0,y-4,x0+215,y+38],fill=(10,6,18)); dr.rectangle([x0,y-2,x0+215,y+36],fill=tuple(int(v*0.55) for v in c))
    dr.rectangle([x0,y-2,x0+215,y],fill=c); dr.rectangle([x0,y+34,x0+215,y+36],fill=c)
    s=f'POÇÃO {num}'; w=text_width(s,2); draw_text(ui,s,x0+(216-w)//2,y+5,(255,255,255),2)
    w=text_width(name,2); draw_text(ui,name,x0+(216-w)//2,y+22,(255,240,140),2)

# ================= story state per scene-time =================
BG=background()
def potion_state(st):
    """which potion phase we are in -> (P dict, index, ramp, phase info)"""
    if st<P1['banner']: return None,0
    if st<P2['banner']: return P1,1
    if st<P3['banner']: return P2,2
    return P3,3
def liquid_ramp(st):
    def toward(base,target,t): return ramp_mix(base,target,ease(t))
    r=LIQ['idle']
    for P,target in ((P1,'blue'),(P2,'green')):
        if st>=P['ingr'][0][0]+0.8:
            prev=r; n=sum(1 for (ti,_) in P['ingr'] if st>=ti+0.8)
            r=toward(LIQ['idle'],LIQ[target],n/len(P['ingr']))
        if st>=P['after'][1]: r=LIQ['idle']
    if st>=P3['ingr'][0][0]+0.8:
        names=['red','purple','gold','blue','green']
        k=(st*3)%len(names); a=names[int(k)]; b=names[(int(k)+1)%len(names)]
        r=ramp_mix(LIQ[a],LIQ[b],k-int(k))
    return r

def render(vt,f):
    st=st_of(vt)
    C=Canvas(W,H); C.im=BG.im.copy(); C.d=ImageDraw.Draw(C.im)
    ramp=liquid_ramp(st)
    rnd=random.Random(f//3)
    # -------- decide wizard / frog state --------
    frog_mode = st>=P3['frog']
    smoke_amt=0.0
    if win(st,*P3['smoke']): smoke_amt=1-prog(st,P3['boom']+0.3,P3['smoke'][1])
    if st>=P3['boom'] and st<P3['boom']+0.3: smoke_amt=1
    shake=0.0
    if win(st,*P3['shake']): shake=ease(prog(st,*P3['shake']))
    level=shake
    # stirring speed
    speed=1.0
    for P in (P1,P2):
        if win(st,*P['stir']): speed=2.6
    if win(st,*P3['shake']): speed=1.5+shake*2
    stir_a=math.floor(st*speed*12)/12*TAU
    left,lp,eyes,flask,hat_dy='rest',0.0,'open',None,0
    if int(st*10)%37==0: eyes='closed'
    wx,wy=WX,WY; visible=1.0; show_body=True; trail=[]; dizzy=False
    for i,P in enumerate((P1,P2,P3)):
        for (ti,kind) in P['ingr']:
            if win(st,ti-0.5,ti+0.15): left='throw'; lp=prog(st,ti-0.5,ti+0.15)
        if 'fill' in P:
            if win(st,*P['fill']): left='hold'; flask=(ease(prog(st,P['fill'][0]+0.3,P['fill'][1])),ramp,False)
            if win(st,*P['drink']):
                left='drink'; lp=prog(st,*P['drink']); flask=(1-ease(prog(st,P['drink'][0]+0.3,P['drink'][1])),ramp,False); eyes='closed'
    # potion 1 effect: dash around
    a,b=P1['effect']
    if win(st,a,b):
        u=prog(st,a,b)
        path=lambda uu: (30+math.sin(uu*TAU*2.5)*34, 156)
        wx,wy=path(u); wx=round(wx)
        for k in range(1,5): trail.append(path(max(0,u-k*0.018)))
        eyes='wide'
    if win(st,*P1['after']): eyes='dizzy'; dizzy=True; hat_dy=-round(abs(math.sin(st*8))*3)
    # potion 2 effect: invisible
    a,b=P2['effect']
    if win(st,a,b):
        visible=1-ease(prog(st,a,a+1.0)) if st<b-1.0 else ease(prog(st,b-1.0,b))
        if st>a+3.0 and st<b-1.0: wx=WX+round(math.sin((st-a-3)*2.2)*6)
    if win(st,48.6,P3['boom']): eyes='wide'
    # -------- light/background effects (pre) --------
    img=np.asarray(C.im,float)
    img=light(img,27,30,40,'#6070c0',0.35,4)                               # moonlight
    for (cx,cy) in CANDLES: img=light(img,cx,cy-3,14+rnd.random()*2,'#ffb050',0.5,4)
    glow_s=0.55+0.12*math.sin(st*TAU*1.1)+shake*0.4
    img=light(img,CX,SURF-6,52+shake*16,ramp[2],glow_s,6)
    img=light(img,CX,160,30,'#ff7020',0.6,4)
    C.im=Image.fromarray(np.clip(img,0,255).astype('uint8')); C.d=ImageDraw.Draw(C.im)
    for (cx,cy) in CANDLES:
        h=rnd.randint(2,3); C.px(cx,cy-1,'#ffd060'); C.px(cx,cy-h,'#ff9030'); C.px(cx,cy-1-h//2,'#fff0b0')
    # dust motes in the moonbeam / glow
    for k in range(18):
        ph=(st*0.05+k*0.137)%1; x=(k*37)%W+math.sin(st*0.7+k)*3; y=20+ph*130
        if (k+int(st*4))%5: C.px(x,y,'#8a80a8' if k%2 else '#c0a070')
    steam(C,st,ramp,CX,SURF,1.0+shake)
    # -------- wizard / frog --------
    hand=None
    if not frog_mode:
        for i,(tx,ty) in enumerate(trail):                                     # speed afterimages
            L=Layer(W,H); draw_wizard(L,round(tx),round(ty),st,stir_a,'rest',0,'wide'); composite(C,L,None,alpha=0.55-i*0.12,tint=['#60c0ff','#3a80e0','#2a50a0','#203070'][i])
        L=Layer(W,H)
        hand=draw_wizard(L,wx,wy,st,stir_a,left,lp,eyes,hat_dy,flask=flask)
        if visible<1.0:
            composite(C,L,alpha=visible)
            L2=Layer(W,H); draw_wizard(L2,wx,wy,st,stir_a,'rest',0,'open',0,show_body=False)
            if visible<0.5: composite(C,L2)        # floating hat, eyes and beard
        else: composite(C,L)
        if trail: hand=None
        if visible<0.5: hand=(WX+24+round(math.cos(stir_a)*3),WY-38)    # spoon keeps stirring by itself
        if dizzy:
            for k in range(3):
                a=st*6+k*TAU/3; C.px(wx+4+round(math.cos(a)*9),wy-82+round(math.sin(a)*3),'#ffe040')
                C.px(wx+4+round(math.cos(a)*9)+1,wy-82+round(math.sin(a)*3),'#fffad0')
    if win(st,*P1['effect']) and not frog_mode:                              # speed lines + dust
        for k in range(10):
            y=100+((k*29+f*7)%56); x=(k*41+f*13)%W
            C.line([(x,y),(x+10,y)],'#a0d8ff' if k%2 else '#ffffff')
        for k in range(6): C.px(wx-6-k*4,155-(k%2),'#8a7060')
    cx,surf=cauldron(C,st,f,ramp,stir_a,hand,shake,level)
    # stream into flask while filling
    for P in (P1,P2):
        if win(st,*P['fill']):
            fx,fy=WX+19,WY-71
            for i in range(20):
                u=((st*1.8)+i/20)%1
                x=cx-6+(fx-(cx-6))*u; y=surf-3-math.sin(u*math.pi)*24+(fy-(surf-3))*u
                C.rect(x,y,2,2,ramp[3] if i%3 else ramp[4])
    # ingredients flying from the shelf
    for P in (P1,P2,P3):
        for j,(ti,kind) in enumerate(P['ingr']):
            if win(st,ti,ti+0.8):
                u=prog(st,ti,ti+0.8); start=(WX+26,WY-58)
                x,y=throw_path(ease(u)*0.9+u*0.1,start,(cx+(j%3-1)*6,surf))
                ingredient(C,kind,x,y,st*3)
            burst(C,st,ti+0.8,cx+(j%3-1)*6,surf,14,[ramp[3],ramp[4],'#ffffff'],0.5,seed=j*3+P['banner'],life=0.8,grav=40)
    # banner sparkle bursts when potion completes
    for P in (P1,P2):
        burst(C,st,P['stir'][0]+0.1,cx,surf-4,30,['#ffffff',ramp[4],ramp[3],'#ffe060'],0.9,seed=11,life=1.3)
    # -------- explosion --------
    tb=P3['boom']
    burst(C,st,tb,cx,surf-6,90,['#ffffff','#ffe060','#ff8040','#e060ff','#60e0ff','#80ff80'],2.4,seed=5,life=2.2,grav=30)
    if frog_mode:
        hop=prog(st,*FROG_HOP); fxp=WX+6+round((CX-WX-6)*ease(hop)); fyp=WY+round((SURF-4-WY)*ease(hop))
        croak=0.0
        for c0 in FROG_CROAK:
            if win(st,c0,c0+0.9): croak=abs(math.sin(prog(st,c0,c0+0.9)*math.pi*2))
        if st<SPLASH:
            L=Layer(W,H); draw_frog(L,fxp,fyp,st,croak,int(st*10)%29==0,hop if win(st,*FROG_HOP) else 0); composite(C,L)
        burst(C,st,SPLASH,cx,surf,40,[ramp[2],ramp[3],ramp[4],'#ffffff'],1.2,seed=21,life=1.2,grav=60)
        if st>=SPLASH-0.05:   # the wizard hat floats on the potion afterwards
            hx=cx+round(math.sin(st*2)*4); L=Layer(W,H)
            L.poly([(hx-8,surf-1),(hx+8,surf-1),(hx+5,surf-3),(hx-5,surf-3)],GOLD[2])
            L.poly([(hx-4,surf-3),(hx+4,surf-3),(hx-1,surf-14),(hx-3,surf-14)],MAUVE[2]); composite(C,L)
    # smoke cloud
    if smoke_amt>0:
        sr=random.Random(9)
        for k in range(46):
            a=sr.uniform(0,TAU); dist=sr.uniform(0,40)*min(1,(st-tb)*3+0.2)
            x=cx-22+math.cos(a)*dist*1.1; y=135+math.sin(a)*dist*0.9-(st-tb)*3
            r=sr.randint(5,11)
            L=Layer(W,H); L.ell(x,y,r,r,'#5a5068' if k%3 else '#7a7088'); L.ell(x-2,y-2,r//2,r//2,'#9a90a8')
            composite(C,L,None,alpha=min(1,smoke_amt*1.4)*0.95)
    # -------- post: vignette, flashes, camera --------
    img=np.asarray(C.im,float)
    img=vignette(img,0.6)
    if win(st,tb,tb+0.12): img=img*0+255
    elif win(st,tb+0.12,tb+0.4): img=img+(255-img)*(1-prog(st,tb+0.12,tb+0.4))
    if win(st,P1['stir'][0],P1['stir'][0]+0.15) or win(st,P2['stir'][0],P2['stir'][0]+0.15): img=img+(255-img)*0.35
    if win(st,SPLASH,SPLASH+0.2): img=img+(255-img)*0.5
    C.im=Image.fromarray(np.clip(img,0,255).astype('uint8'))
    # camera shake
    sh=0
    if win(st,*P3['shake']): sh=round(shake*2)
    if win(st,tb,tb+0.8): sh=3
    if win(st,*P1['effect']): sh=max(sh,1)
    if sh:
        r=random.Random(f); dx,dy=r.randint(-sh,sh),r.randint(-sh,sh)
        a=np.asarray(C.im); a=np.roll(np.roll(a,dx,1),dy,0); C.im=Image.fromarray(a)
    # camera punch-in (integer 2x zoom) on key reaction moments
    zoom=None
    if win(st,48.6,P3['boom']): zoom=(WX+6,WY-62)                  # "ESPERA..." on the wizard face
    if win(st,P2['effect'][0]+3.2,P2['effect'][0]+4.8): zoom=(WX+8,WY-70)
    if win(st,FROG_CROAK[0],FROG_CROAK[0]+1.2) or (vt<HOOK_END and vt>1.6): zoom=(WX+8,WY-14)
    if zoom:
        zx=min(max(0,zoom[0]-W//4),W//2); zy=min(max(0,zoom[1]-H//4),H//2)
        C.im=C.im.crop((zx,zy,zx+W//2,zy+H//2)).resize((W,H),Image.NEAREST)
    # -------- UI layer (2x world) --------
    ui=C.im.resize((W*2,H*2),Image.NEAREST)
    # rewind VHS effect
    if HOOK_END<=vt<REWIND_END:
        a=np.asarray(ui).astype(float)
        a[::4]*=0.55; a[:,:,2]=np.minimum(255,a[:,:,2]*1.25)
        rr=random.Random(f); 
        for _ in range(5):
            y=rr.randrange(384); a[y:y+3]=np.roll(a[y:y+3],rr.randint(-12,12),1)
        ui=Image.fromarray(a.clip(0,255).astype('uint8'))
        draw_text(ui,'<< REBOBINANDO',30,46,(255,255,255),2)
    if vt<HOOK_END:
        caption(ui,HOOK_CAPTION[2],vt,*HOOK_CAPTION[:2],'white',y=60)
    else:
        caption(ui,INTRO_CAPTION[2],st,*INTRO_CAPTION[:2],'yellow',y=60)
        for (a,b,text,style) in CAPTIONS: caption(ui,text,st,a,b,style,y=60)
        banner(ui,st,P1['banner'],1,'VELOCIDADE','#3a8aff')
        banner(ui,st,P2['banner'],2,'INVISIBILIDADE','#40c040')
        banner(ui,st,P3['banner'],3,'???','#ff4060')
        # potion progress chips (top-left), like a checklist
        for i,(P,col) in enumerate(((P1,'#3a8aff'),(P2,'#40c040'),(P3,'#ff4060'))):
            if st>=P['banner'] and vt>=REWIND_END:
                done = st>=(P['after'][1] if 'after' in P else P['boom'])
                d=ImageDraw.Draw(ui); x=8+i*16; y=22
                d.rectangle([x-1,y-1,x+12,y+12],fill=(10,6,18)); d.rectangle([x,y,x+11,y+11],fill=hexc(col) if done else (40,30,60))
                draw_text(ui,str(i+1) if not done or i<2 else '!',x+3,y+3,(255,255,255),1,outline=None)
    # final fade to the loop point (white flash that matches the hook start)
    if vt>END_FLASH-OFFSET:
        a=np.asarray(ui,float); u=prog(vt,END_FLASH-OFFSET,DUR); ui=Image.fromarray((a+(255-a)*u).clip(0,255).astype('uint8'))
    if vt<0.15:
        a=np.asarray(ui,float); ui=Image.fromarray((a+(255-a)*(1-vt/0.15)).clip(0,255).astype('uint8'))
    return ui

if __name__=='__main__':
    os.makedirs('frames',exist_ok=True)
    args=sys.argv[1:]
    if args and args[0]=='at':
        for s in args[1:]:
            vt=float(s); render(vt,int(vt*FPS)).save(f'test_{s}.png')
    else:
        a,b=(int(args[0]),int(args[1])) if args else (0,int(DUR*FPS))
        for f in range(a,b): render(f/FPS,f).save(f'frames/f{f:05d}.png')
