// Lida no Sertão (MonoGame) — arte da interface desenhada em código, pixel a pixel:
// moldura de madeira com cravos, pergaminho, casas da mochila, botões redondos, joystick e ícones dos itens.
// Tudo original, no estilo dos jogos de fazenda em pixel art (contorno escuro, luz de cima, cores quentes).
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
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

    /// <summary>Texturas da interface geradas uma vez no início.</summary>
    public class UiArt
    {
        public static readonly Color Ink = new Color(52, 28, 12), Wood = new Color(164, 94, 42), WoodHi = new Color(214, 140, 70), WoodLo = new Color(112, 60, 26),
            Paper = new Color(250, 222, 166), PaperLo = new Color(222, 180, 118), Brown = new Color(86, 46, 18), Gold = new Color(255, 214, 92);
        public Texture2D Frame, Plank, Slot, SlotSel, Btn, BtnDown, JoyBase, JoyKnob, Tab, TabOn, Close;
        public readonly Dictionary<string, Texture2D> Icon = new Dictionary<string, Texture2D>();

        public UiArt(GraphicsDevice gd)
        {
            Frame = Box(gd, Paper); Plank = Box(gd, new Color(178, 108, 52), true);
            Slot = SlotTex(gd, false); SlotSel = SlotTex(gd, true);
            Btn = Round(gd, 32, Wood, WoodHi, WoodLo); BtnDown = Round(gd, 32, new Color(200, 132, 60), new Color(240, 180, 100), Wood);
            JoyBase = Ring(gd); JoyKnob = Round(gd, 20, new Color(236, 196, 120), new Color(255, 236, 180), new Color(180, 120, 56));
            Tab = Box(gd, new Color(196, 128, 62), true); TabOn = Box(gd, Paper);
            Close = Round(gd, 16, new Color(196, 52, 40), new Color(240, 110, 90), new Color(130, 30, 22));
            Icons(gd);
        }

        // moldura 24×24 para fatiar em 9 partes (cantos de 8 px): borda de madeira com veio, cravos dourados e miolo
        static Texture2D Box(GraphicsDevice gd, Color fill, bool planks = false)
        {
            const int S = 24; var p = new Px(S, S);
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++)
            {
                int cx = Math.Min(x, S - 1 - x), cy = Math.Min(y, S - 1 - y); int d = Math.Min(cx, cy);
                if (cx + cy < 2) continue; // canto chanfrado
                Color c;
                if (d == 0 || cx + cy == 2) c = Ink;
                else if (d <= 5)
                {
                    bool top = y <= 5 && cy <= cx, left = x <= 5 && cx < cy, bot = y >= S - 6 && cy <= cx, right = x >= S - 6 && cx < cy;
                    c = Wood; if ((top || left) && d == 1) c = WoodHi; else if ((bot || right) && d == 5) c = WoodLo; else if (d == 3 && ((x + y) % 5 == 0)) c = WoodLo;
                    if (top || bot) { if ((x * 7 + d * 3) % 11 == 0) c = Color.Lerp(c, WoodLo, 0.5f); } else if ((y * 7 + d * 3) % 11 == 0) c = Color.Lerp(c, WoodLo, 0.5f);
                }
                else if (d == 6) c = Ink;
                else if (d == 7) c = planks ? Color.Lerp(fill, Color.Black, 0.25f) : Color.Lerp(fill, PaperLo, 0.8f);
                else c = planks && (y % 6 == 0) ? Color.Lerp(fill, Color.Black, 0.18f) : fill;
                p.Set(x, y, c);
            }
            foreach (var (x, y) in new[] { (3, 3), (S - 4, 3), (3, S - 4), (S - 4, S - 4) }) { p.Set(x, y, Gold); p.Set(x - 1, y, new Color(150, 110, 40)); p.Set(x, y + 1, new Color(150, 110, 40)); }
            return p.Tex(gd);
        }

        static Texture2D SlotTex(GraphicsDevice gd, bool sel)
        {
            const int S = 20; var p = new Px(S, S); var edge = sel ? new Color(214, 56, 40) : new Color(120, 70, 30);
            p.Rect(0, 0, S, S, edge); p.Rect(1, 1, S - 2, S - 2, sel ? new Color(255, 120, 80) : new Color(146, 90, 40)); p.Rect(2, 2, S - 4, S - 4, new Color(226, 186, 124));
            p.Rect(2, 2, S - 4, 1, new Color(190, 146, 90)); p.Rect(2, 2, 1, S - 4, new Color(200, 156, 100)); p.Rect(3, S - 3, S - 5, 1, new Color(242, 210, 150));
            if (sel) { p.Rect(0, 0, S, 2, edge); p.Rect(0, S - 2, S, 2, edge); p.Rect(0, 0, 2, S, edge); p.Rect(S - 2, 0, 2, S, edge); }
            p.Set(0, 0, Color.Transparent); p.Set(S - 1, 0, Color.Transparent); p.Set(0, S - 1, Color.Transparent); p.Set(S - 1, S - 1, Color.Transparent);
            return p.Tex(gd);
        }

        static Texture2D Round(GraphicsDevice gd, int s, Color mid, Color hi, Color lo)
        {
            var p = new Px(s, s); float r = s / 2f - 1; p.Ell(s / 2f, s / 2f, r, r, Ink); p.Ell(s / 2f, s / 2f, r - 1, r - 1, lo); p.Ell(s / 2f, s / 2f - 1, r - 2, r - 2.5f, mid);
            p.Ell(s / 2f - r * 0.3f, s / 2f - r * 0.45f, r * 0.35f, r * 0.18f, hi); return p.Tex(gd);
        }

        static Texture2D Ring(GraphicsDevice gd)
        {
            const int S = 64; var p = new Px(S, S); p.Ell(32, 32, 31, 31, Ink * 0.8f); p.Ell(32, 32, 30, 30, new Color(164, 94, 42) * 0.85f); p.Ell(32, 32, 26, 26, new Color(40, 22, 10) * 0.35f);
            for (int k = 0; k < 4; k++) { float a = k * MathHelper.PiOver2; int x = (int)(32 + Math.Cos(a) * 21), y = (int)(32 + Math.Sin(a) * 21); p.Ell(x, y, 2.5f, 2.5f, new Color(255, 230, 170) * 0.7f); }
            return p.Tex(gd);
        }

        // ---------------- ícones 16×16 (desenhados em 18×18 para caber o contorno) ----------------
        void Icons(GraphicsDevice gd)
        {
            Px N() => new Px(18, 18);
            Texture2D Fin(Px p, bool shade = true) { if (shade) p.Shade(); p.Outline(Ink); return p.Tex(gd); }
            Color rope = new Color(206, 160, 92), ropeD = new Color(150, 104, 52), steel = new Color(186, 192, 200), steelD = new Color(120, 128, 140), leaf = new Color(96, 160, 60), leafD = new Color(60, 110, 40);

            // laço: rolo de corda com a ponta solta
            var q = N(); q.Ell(8, 8, 7, 6, rope); q.Ell(8, 8, 5, 4, ropeD); q.Ell(8, 8, 4, 3, rope); q.Ell(8, 8, 2, 1.5f, Color.Transparent);
            for (int i = 0; i < 16; i++) { double a = i * Math.PI / 8; q.Set((int)(8 + Math.Cos(a) * 6), (int)(8 + Math.Sin(a) * 5), ropeD); }
            q.Line(13, 11, 16, 16, rope, 2); q.Set(16, 16, ropeD); Icon["laco"] = Fin(q);

            // balde de zinco com alça e água
            q = N(); for (int y = 6; y < 16; y++) { int w = 12 - (y - 6) / 3; q.Rect(9 - w / 2, y, w, 1, y == 10 ? steelD : steel); }
            q.Rect(3, 6, 12, 2, new Color(90, 160, 220)); q.Line(3, 6, 5, 2, steelD); q.Line(5, 2, 12, 2, steelD); q.Line(12, 2, 14, 6, steelD); Icon["balde"] = Fin(q);

            // facão: lâmina larga e cabo de madeira
            q = N(); q.Line(5, 12, 14, 3, steel, 2); q.Line(6, 13, 15, 4, steelD); q.Line(1, 16, 5, 12, new Color(120, 70, 30), 2); q.Set(5, 11, Gold); q.Set(6, 12, Gold); Icon["facao"] = Fin(q, false);

            // saco de sal mineral
            q = N(); q.Ell(9, 11, 6, 5.5f, new Color(240, 238, 230)); q.Rect(6, 3, 6, 4, new Color(240, 238, 230)); q.Rect(6, 5, 6, 1, new Color(70, 110, 190)); q.Rect(5, 11, 8, 2, new Color(70, 110, 190)); Icon["sal"] = Fin(q);

            // saco de ração (estopa)
            q = N(); q.Ell(9, 11, 6.5f, 5.5f, new Color(200, 156, 96)); q.Rect(5, 3, 8, 4, new Color(200, 156, 96)); q.Rect(5, 6, 8, 1, ropeD); q.Rect(6, 10, 6, 3, leaf); q.Set(8, 11, Gold); q.Set(10, 11, Gold);
            for (int i = 0; i < 6; i++) q.Set(4 + i * 2, 14 - i % 2, new Color(170, 126, 70)); Icon["racao"] = Fin(q);

            // espiga de milho com palha
            q = N(); q.Ell(9, 8, 3.5f, 6.5f, new Color(250, 206, 60)); for (int y = 3; y < 14; y += 2) for (int x = 7; x < 12; x += 2) q.Set(x, y, new Color(220, 160, 30));
            q.Line(4, 16, 7, 6, leaf, 2); q.Line(14, 16, 11, 7, leafD, 2); Icon["milho"] = Fin(q);

            // queijo coalho (bloco)
            q = N(); q.Rect(2, 7, 14, 8, new Color(246, 226, 160)); q.Rect(2, 5, 14, 2, new Color(214, 160, 80)); q.Ell(6, 10, 1.2f, 1.2f, new Color(220, 190, 120)); q.Ell(11, 12, 1.5f, 1.2f, new Color(220, 190, 120)); Icon["queijo"] = Fin(q);

            // garrafa de leite
            q = N(); q.Rect(5, 7, 8, 9, new Color(250, 250, 244)); q.Rect(6, 4, 6, 3, new Color(250, 250, 244)); q.Rect(6, 2, 6, 2, new Color(60, 120, 200)); q.Rect(5, 10, 8, 3, new Color(60, 120, 200)); Icon["leite"] = Fin(q);

            // ovo
            q = N(); q.Ell(9, 10, 5, 6, new Color(250, 236, 210)); q.Ell(7, 7, 1.5f, 2, Color.White); Icon["ovo"] = Fin(q, false);

            // ---- ícones da interface ----
            // mochila (abre o menu)
            q = N(); q.Rect(3, 5, 12, 11, new Color(150, 90, 40)); q.Rect(3, 5, 12, 5, new Color(190, 120, 56)); q.Rect(8, 8, 2, 3, Gold); q.Line(6, 5, 7, 1, ropeD, 2); q.Line(12, 5, 11, 1, ropeD, 2); q.Line(7, 1, 11, 1, ropeD); Icon["bolsa"] = Fin(q);
            // mão (ação)
            q = N(); var skin = new Color(240, 196, 150); q.Rect(4, 8, 10, 8, skin); for (int i = 0; i < 4; i++) q.Rect(4 + i * 2 + (i > 1 ? 1 : 0), 2 + (i == 0 || i == 3 ? 2 : 0), 2, 7, skin); q.Line(14, 9, 16, 6, skin, 2); Icon["mao"] = Fin(q);
            // bota (correr)
            q = N(); var boot = new Color(140, 80, 36); q.Rect(5, 2, 7, 11, boot); q.Rect(5, 11, 11, 4, boot); q.Rect(5, 15, 11, 1, Ink); q.Rect(5, 4, 7, 1, Gold); q.Line(15, 13, 17, 13, new Color(200, 200, 200)); Icon["bota"] = Fin(q);
            // mapa
            q = N(); q.Rect(2, 3, 14, 12, Paper); q.Line(6, 3, 6, 15, PaperLo); q.Line(11, 3, 11, 15, PaperLo); q.Line(3, 12, 8, 7, new Color(80, 150, 210)); q.Line(12, 6, 14, 8, new Color(200, 40, 30)); q.Line(14, 6, 12, 8, new Color(200, 40, 30)); Icon["mapa"] = Fin(q, false);
            // pata (animais)
            q = N(); var paw = new Color(130, 76, 36); q.Ell(9, 12, 4.5f, 3.5f, paw); q.Ell(4, 7, 1.8f, 2.2f, paw); q.Ell(7.5f, 4, 1.8f, 2.2f, paw); q.Ell(11.5f, 4, 1.8f, 2.2f, paw); q.Ell(15, 7, 1.8f, 2.2f, paw); Icon["pata"] = Fin(q);
            // engrenagem (opções)
            q = N(); var gear = new Color(170, 176, 186); for (int i = 0; i < 8; i++) { double a = i * Math.PI / 4; q.Ell((float)(9 + Math.Cos(a) * 6), (float)(9 + Math.Sin(a) * 6), 1.8f, 1.8f, gear); } q.Ell(9, 9, 5.5f, 5.5f, gear); q.Ell(9, 9, 2, 2, Color.Transparent); Icon["engr"] = Fin(q);
            // sol, lua, chuva (relógio)
            q = N(); for (int i = 0; i < 8; i++) { double a = i * Math.PI / 4; q.Line(9, 9, (float)(9 + Math.Cos(a) * 8), (float)(9 + Math.Sin(a) * 8), new Color(255, 170, 40)); } q.Ell(9, 9, 4.5f, 4.5f, new Color(255, 214, 60)); Icon["sol"] = Fin(q);
            q = N(); q.Ell(9, 9, 6, 6, new Color(240, 236, 200)); q.Ell(12, 7, 5, 5, Color.Transparent); Icon["lua"] = Fin(q);
            q = N(); q.Ell(7, 7, 4, 3.5f, new Color(230, 236, 244)); q.Ell(11, 6, 4.5f, 4, new Color(230, 236, 244)); q.Rect(4, 7, 11, 4, new Color(230, 236, 244)); for (int i = 0; i < 3; i++) q.Line(5 + i * 4, 13, 4 + i * 4, 16, new Color(80, 150, 230)); Icon["chuva"] = Fin(q);
            // coração (afeição)
            q = N(); q.Ell(6, 7, 3.5f, 3.5f, new Color(226, 52, 64)); q.Ell(12, 7, 3.5f, 3.5f, new Color(226, 52, 64)); for (int y = 8; y < 16; y++) q.Rect(2 + (y - 8), y, 15 - 2 * (y - 8), 1, new Color(226, 52, 64)); q.Set(5, 5, new Color(255, 170, 170)); Icon["cor"] = Fin(q);
            q = N(); q.Ell(6, 7, 3.5f, 3.5f, new Color(190, 150, 110)); q.Ell(12, 7, 3.5f, 3.5f, new Color(190, 150, 110)); for (int y = 8; y < 16; y++) q.Rect(2 + (y - 8), y, 15 - 2 * (y - 8), 1, new Color(190, 150, 110)); Icon["cor0"] = Fin(q, false);
            // moeda
            q = N(); q.Ell(9, 9, 6.5f, 6.5f, Gold); q.Ell(9, 9, 4.5f, 4.5f, new Color(240, 180, 50)); q.Rect(8, 6, 2, 6, Gold); Icon["moeda"] = Fin(q);
            // salvar (disquete) e sair (porta)
            q = N(); q.Rect(3, 3, 12, 12, new Color(70, 110, 190)); q.Rect(5, 3, 8, 4, new Color(220, 224, 232)); q.Rect(5, 10, 8, 5, Color.White); Icon["salvar"] = Fin(q);
            q = N(); q.Rect(4, 2, 10, 14, new Color(150, 90, 40)); q.Rect(6, 4, 6, 4, new Color(120, 70, 30)); q.Rect(6, 10, 6, 4, new Color(120, 70, 30)); q.Set(12, 9, Gold); Icon["porta"] = Fin(q);
        }
    }
}
