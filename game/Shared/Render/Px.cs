// Terra de Crinas — tela de pintura em memória para gerar sprites em código (retângulos, elipses, linhas, contorno).
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Render
{
    /// <summary>Tela de pintura em memória: retângulos, elipses, linhas e contorno automático.</summary>
    public class Px
    {
        public readonly int W, H; public readonly Color[] P;
        public Px(int w, int h) { W = w; H = h; P = new Color[w * h]; }
        public void Set(int x, int y, Color c) { if (x >= 0 && y >= 0 && x < W && y < H) P[y * W + x] = c; }
        public Color Get(int x, int y) => x < 0 || y < 0 || x >= W || y >= H ? Color.Transparent : P[y * W + x];
        public bool On(int x, int y) => Get(x, y).A > 0;
        public void Rect(int x, int y, int w, int h, Color c) { for (int j = y; j < y + h; j++) for (int i = x; i < x + w; i++) Set(i, j, c); }
        public void Ell(float cx, float cy, float rx, float ry, Color c)
        {
            for (int y = (int)(cy - ry - 1); y <= cy + ry + 1; y++) for (int x = (int)(cx - rx - 1); x <= cx + rx + 1; x++)
            { float dx = (x + 0.5f - cx) / rx, dy = (y + 0.5f - cy) / ry; if (dx * dx + dy * dy <= 1) Set(x, y, c); }
        }
        public void Line(float x0, float y0, float x1, float y1, Color c, int t = 1)
        {
            int n = (int)Math.Ceiling(Math.Max(Math.Abs(x1 - x0), Math.Abs(y1 - y0))) + 1;
            for (int i = 0; i <= n; i++) { float k = i / (float)n; int x = (int)Math.Floor(x0 + (x1 - x0) * k), y = (int)Math.Floor(y0 + (y1 - y0) * k); Rect(x, y, t, t, c); }
        }
        /// <summary>Contorno de 1 px em volta de tudo que foi pintado.</summary>
        public void Outline(Color c)
        {
            var src = (Color[])P.Clone();
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
            {
                if (src[y * W + x].A > 0) continue;
                bool n = false; for (int k = 0; k < 4 && !n; k++) { int xx = x + (k == 0 ? 1 : k == 1 ? -1 : 0), yy = y + (k == 2 ? 1 : k == 3 ? -1 : 0); n = xx >= 0 && yy >= 0 && xx < W && yy < H && src[yy * W + xx].A > 0; }
                if (n) P[y * W + x] = c;
            }
        }
        /// <summary>Luz de cima: clareia a primeira linha de cada coluna e escurece a última.</summary>
        public void Shade(float hi = 0.25f, float lo = 0.22f)
        {
            var src = (Color[])P.Clone();
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
            {
                var c = src[y * W + x]; if (c.A == 0) continue;
                if (y == 0 || src[(y - 1) * W + x].A == 0) P[y * W + x] = Color.Lerp(c, Color.White, hi);
                else if (y == H - 1 || src[(y + 1) * W + x].A == 0) P[y * W + x] = Color.Lerp(c, Color.Black, lo);
            }
        }
        public Texture2D Tex(GraphicsDevice gd) { var t = new Texture2D(gd, W, H); t.SetData(P); return t; }
    }

}
