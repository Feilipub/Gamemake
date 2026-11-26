"""Tiny pixel-art toolkit: everything is drawn on a low-res grid, no anti-aliasing."""
import numpy as np, math
from PIL import Image, ImageDraw
def hexc(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def mix(a,b,t): a,b=hexc(a),hexc(b); return '#%02x%02x%02x'%tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3))
class Canvas:
    def __init__(s,w,h,bg='#000000'):
        s.w,s.h=w,h; s.im=Image.new('RGB',(w,h),hexc(bg)); s.d=ImageDraw.Draw(s.im)
    def px(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.im.putpixel((int(x),int(y)),hexc(c))
    def get(s,x,y):
        if not(0<=x<s.w and 0<=y<s.h): return None
        return '#%02x%02x%02x'%s.im.getpixel((x,y))
    def rect(s,x,y,w,h,c):
        if w<1 or h<1: return
        x,y,w,h=round(x),round(y),round(w),round(h)
        s.d.rectangle([x,y,x+w-1,y+h-1],fill=hexc(c))
    def poly(s,pts,c): s.d.polygon([tuple(p) for p in pts],fill=hexc(c))
    def line(s,pts,c,w=1): s.d.line([tuple(p) for p in pts],fill=hexc(c),width=w)
    def ell(s,cx,cy,rx,ry,c): s.d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=hexc(c))
    def dither(s,x,y,w,h,c,phase=0):
        for j in range(y,y+h):
            for i in range(x,x+w):
                if (i+j+phase)%2==0: s.px(i,j,c)
    def glow(s,cx,cy,r,c,strength=0.6,steps=4):
        """banded radial light: posterized like pixel art, not a smooth gradient"""
        col=hexc(c)
        for j in range(max(0,int(cy-r)),min(s.h,int(cy+r+1))):
            for i in range(max(0,int(cx-r)),min(s.w,int(cx+r+1))):
                d=math.hypot(i-cx,j-cy)/r
                if d<1:
                    t=math.ceil((1-d)*steps)/steps*strength
                    p=s.im.getpixel((i,j)); s.im.putpixel((i,j),tuple(round(p[k]+(col[k]-p[k])*t) for k in range(3)))
    def outline(s,mask_color_fn,c): pass
    def save(s,path,scale=1):
        s.im.resize((s.w*scale,s.h*scale),Image.NEAREST).save(path)
def compare(draw,ref,out,scale):
    r=Image.open(ref).convert('RGB'); d=Image.open(draw).convert('RGB')
    W=d.width*scale; H=d.height*scale
    c=Image.new('RGB',(W*2+8,H),(255,255,255))
    c.paste(r.resize((W,H),Image.BOX if r.width>W else Image.NEAREST),(0,0)); c.paste(d.resize((W,H),Image.NEAREST),(W+8,0)); c.save(out)

class Layer(Canvas):
    """Transparent drawing layer; composite onto a Canvas with an automatic dark outline."""
    def __init__(s,w,h):
        s.w,s.h=w,h; s.im=Image.new('RGBA',(w,h),(0,0,0,0)); s.d=ImageDraw.Draw(s.im)
    def px(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.im.putpixel((int(x),int(y)),hexc(c)+(255,))
    def get(s,x,y):
        if not(0<=x<s.w and 0<=y<s.h): return None
        p=s.im.getpixel((x,y))
        return None if p[3]==0 else '#%02x%02x%02x'%p[:3]
    def rect(s,x,y,w,h,c):
        if w<1 or h<1: return
        x,y,w,h=round(x),round(y),round(w),round(h)
        s.d.rectangle([x,y,x+w-1,y+h-1],fill=hexc(c)+(255,))
    def poly(s,pts,c): s.d.polygon([tuple(p) for p in pts],fill=hexc(c)+(255,))
    def line(s,pts,c,w=1): s.d.line([tuple(p) for p in pts],fill=hexc(c)+(255,),width=w)
    def ell(s,cx,cy,rx,ry,c): s.d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=hexc(c)+(255,))
def composite(canvas,layer,outline='#0a1f21',bottom_heavy=True):
    a=np.asarray(layer.im)[:,:,3]>0
    if outline:
        m=np.zeros_like(a)
        m[1:,:]|=a[:-1,:]; m[:-1,:]|=a[1:,:]; m[:,1:]|=a[:,:-1]; m[:,:-1]|=a[:,1:]
        if bottom_heavy: m[2:,:]|=a[:-2,:]          # thicker outline on the bottom = grounded look
        ring=m&~a
        base=np.asarray(canvas.im).copy(); base[ring]=hexc(outline)
        canvas.im=Image.fromarray(base); canvas.d=ImageDraw.Draw(canvas.im)
    canvas.im.paste(layer.im,(0,0),layer.im); canvas.d=ImageDraw.Draw(canvas.im)
