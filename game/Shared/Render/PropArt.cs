// Terra de Crinas — objetos do cenário desenhados em código, com volume (luz de cima à esquerda), contorno e
// variações: carvalho (3, um florido), pinheiro (2), arbusto (2, um com frutinhas), pedra (3), toco, tronco caído,
// flores (4 cores), tufo de capim (2), cerca, mourão, estábulo, bebedouro, fardo de feno e placa.
using System;
using System.Collections.Generic;
using Crinas.World;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Render
{
    public sealed class PropArt
    {
        public struct Spr { public Texture2D Tex; public Vector2 Anchor; public float ShadowR; }
        readonly Dictionary<int, Spr> spr = new Dictionary<int, Spr>();
        public static readonly int[] Variants = { 3, 2, 2, 3, 1, 1, 4, 2, 1, 1, 1, 1, 1, 2, 1 };
        static readonly Color Ink = new Color(36, 30, 26);

        public Spr Get(PropKind k, int var) { int n = Variants[(int)k]; return spr[(int)k * 8 + var % n]; }

        public PropArt(GraphicsDevice gd)
        {
            void Add(PropKind k, int v, Px p, float ax, float ay, float sh) { spr[(int)k * 8 + v] = new Spr { Tex = p.Tex(gd), Anchor = new Vector2(ax, ay), ShadowR = sh }; }
            var leaf = new[] { new[] { new Color(40, 86, 44), new Color(62, 124, 56), new Color(96, 160, 70), new Color(150, 200, 100) },
                               new[] { new Color(44, 92, 50), new Color(70, 132, 60), new Color(110, 170, 76), new Color(170, 214, 116) },
                               new[] { new Color(150, 60, 96), new Color(200, 92, 132), new Color(236, 140, 170), new Color(255, 200, 216) } };
            for (int v = 0; v < 3; v++) Add(PropKind.Oak, v, Oak(v, leaf[v]), 24, 54, 16);
            for (int v = 0; v < 2; v++) Add(PropKind.Pine, v, Pine(v), 18, 62, 11);
            for (int v = 0; v < 2; v++) Add(PropKind.Bush, v, Bush(v), 12, 16, 9);
            for (int v = 0; v < 3; v++) Add(PropKind.Rock, v, Rock(v), 10, 13, 8);
            Add(PropKind.Stump, 0, Stump(), 9, 12, 7);
            Add(PropKind.Log, 0, Log(), 14, 10, 12);
            var flowerC = new[] { new Color(250, 214, 70), new Color(250, 250, 244), new Color(240, 120, 160), new Color(150, 120, 230) };
            for (int v = 0; v < 4; v++) Add(PropKind.Flowers, v, Flowers(flowerC[v], v), 7, 9, 0);
            for (int v = 0; v < 2; v++) Add(PropKind.Tuft, v, Tuft(v), 7, 10, 0);
            Add(PropKind.FenceH, 0, FenceH(), 8, 16, 0);
            Add(PropKind.FenceV, 0, FenceV(), 8, 16, 0);
            Add(PropKind.Post, 0, Post(), 4, 18, 3);
            Add(PropKind.Stable, 0, Stable(), 50, 82, 0);
            Add(PropKind.Trough, 0, Trough(), 16, 14, 14);
            for (int v = 0; v < 2; v++) Add(PropKind.Hay, v, Hay(v), 11, 15, 10);
            Add(PropKind.Sign, 0, Sign(), 9, 24, 4);
        }

        /// <summary>Bola de folhas com sombreamento por normal (luz de cima à esquerda).</summary>
        static void Ball(Px p, float cx, float cy, float r, Color[] pal, int seed)
        {
            for (int y = (int)(cy - r - 1); y <= cy + r + 1; y++) for (int x = (int)(cx - r - 1); x <= cx + r + 1; x++)
                {
                    float nx = (x + 0.5f - cx) / r, ny = (y + 0.5f - cy) / r; float d = nx * nx + ny * ny; if (d > 1) continue;
                    float l = -0.55f * nx - 0.8f * ny + 0.25f * (1 - d) + (Crinas.Core.Noise.Hash(x, y, seed) - 0.5f) * 0.35f;
                    int i = l > 0.62f ? 3 : l > 0.18f ? 2 : l > -0.35f ? 1 : 0; p.Set(x, y, pal[i]);
                }
        }

        static Px Oak(int v, Color[] pal)
        {
            var p = new Px(48, 58); var bark = new Color(112, 76, 46); var barkD = new Color(78, 50, 30); var barkL = new Color(150, 106, 66);
            // tronco com raízes
            p.Rect(20, 34, 8, 20, bark); p.Rect(20, 34, 2, 20, barkL); p.Rect(26, 34, 2, 20, barkD); p.Rect(17, 51, 14, 3, bark); p.Rect(16, 53, 3, 1, barkD); p.Rect(29, 53, 3, 1, barkD);
            p.Line(22, 40, 22, 47, barkD); p.Line(25, 37, 25, 43, barkD); p.Line(24, 34, 16, 26, bark, 2); p.Line(25, 34, 32, 27, bark, 2);
            var rng = new Crinas.Core.Rng(17 + v * 31);
            var balls = new List<(float x, float y, float r)>();
            for (int i = 0; i < 9; i++) { float a = i / 9f * 6.283f + rng.Range(-0.3f, 0.3f), rr = rng.Range(6, 12); balls.Add((24 + (float)Math.Cos(a) * rr * 1.15f, 22 + (float)Math.Sin(a) * rr * 0.8f, rng.Range(7, 10))); }
            balls.Add((24, 18, 11)); balls.Add((18, 26, 9)); balls.Add((30, 26, 9));
            balls.Sort((a, b) => a.y.CompareTo(b.y));
            int s = 0; foreach (var b in balls) Ball(p, b.x, b.y, b.r, pal, 100 + s++ + v * 13);
            if (v == 0) for (int i = 0; i < 6; i++) { int x = rng.Int(12, 36), y = rng.Int(12, 32); if (p.On(x, y)) { p.Set(x, y, new Color(220, 60, 50)); p.Set(x, y - 1, new Color(250, 120, 100)); } } // frutinhas
            p.Outline(Ink); return p;
        }

        static Px Pine(int v)
        {
            var p = new Px(36, 64); var bark = new Color(104, 70, 44);
            p.Rect(16, 48, 5, 14, bark); p.Rect(16, 48, 1, 14, new Color(140, 100, 64));
            var pal = v == 0 ? new[] { new Color(30, 72, 52), new Color(44, 100, 66), new Color(70, 134, 84), new Color(120, 176, 110) } : new[] { new Color(36, 78, 60), new Color(52, 108, 76), new Color(84, 144, 96), new Color(136, 188, 120) };
            for (int tier = 0; tier < 5; tier++)
            {
                int top = 4 + tier * 9, h = 14 + tier, half = 6 + tier * 3;
                for (int y = 0; y < h; y++)
                {
                    int w = (int)(half * (y + 2) / (float)(h + 1)); int yy = top + y;
                    for (int x = -w; x <= w; x++)
                    {
                        float l = -x / (float)(w + 1) * 0.7f - (y / (float)h) * 0.6f + 0.35f + (Crinas.Core.Noise.Hash(x, yy, 7 + v) - 0.5f) * 0.3f;
                        int i = y == h - 1 ? 0 : l > 0.6f ? 3 : l > 0.15f ? 2 : l > -0.3f ? 1 : 0; p.Set(18 + x, yy, pal[i]);
                    }
                }
            }
            p.Outline(Ink); return p;
        }

        static Px Bush(int v)
        {
            var p = new Px(24, 18); var pal = new[] { new Color(44, 92, 46), new Color(68, 130, 58), new Color(104, 166, 74), new Color(156, 206, 110) };
            Ball(p, 8, 10, 6, pal, 3 + v); Ball(p, 16, 10, 6, pal, 4 + v); Ball(p, 12, 7, 6.5f, pal, 5 + v);
            if (v == 1) foreach (var (x, y) in new[] { (7, 8), (12, 5), (16, 9), (10, 11), (15, 6) }) { p.Set(x, y, new Color(200, 50, 70)); p.Set(x + 1, y, new Color(240, 100, 110)); }
            p.Outline(Ink); return p;
        }

        static Px Rock(int v)
        {
            var p = new Px(20, 15); var b = v == 2 ? new Color(150, 146, 136) : new Color(166, 162, 156);
            float rx = v == 1 ? 6 : 8, ry = v == 1 ? 5 : 5.5f;
            for (int y = 0; y < 15; y++) for (int x = 0; x < 20; x++)
                {
                    float nx = (x + 0.5f - 10) / rx, ny = (y + 0.5f - 8) / ry; float d = nx * nx + ny * ny; if (d > 1 || y > 12) continue;
                    float l = -0.5f * nx - 0.8f * ny; var c = l > 0.45f ? new Color(214, 210, 202) : l > 0 ? b : l > -0.5f ? new Color(122, 118, 112) : new Color(92, 88, 84);
                    if (v == 2 && ny < -0.2f && Crinas.Core.Noise.Hash(x, y, 9) < 0.6f) c = new Color(96, 146, 70); // musgo
                    p.Set(x, y, c);
                }
            p.Outline(Ink); return p;
        }

        static Px Stump()
        {
            var p = new Px(18, 14); var bark = new Color(112, 76, 46);
            p.Rect(4, 5, 10, 7, bark); p.Rect(4, 5, 2, 7, new Color(146, 104, 64)); p.Ell(9, 5, 5, 2.2f, new Color(212, 176, 118)); p.Ell(9, 5, 2.5f, 1, new Color(176, 136, 86)); p.Rect(2, 11, 14, 1, bark);
            p.Outline(Ink); return p;
        }
        static Px Log()
        {
            var p = new Px(28, 12); var bark = new Color(104, 70, 42);
            p.Rect(3, 3, 22, 7, bark); p.Rect(3, 3, 22, 2, new Color(140, 98, 60)); p.Ell(25, 6.5f, 2.5f, 3.6f, new Color(210, 172, 116)); p.Line(8, 6, 18, 6, new Color(80, 52, 30));
            p.Outline(Ink); return p;
        }
        static Px Flowers(Color c, int v)
        {
            var p = new Px(14, 11); var st = new Color(70, 132, 56); var r = new Crinas.Core.Rng(5 + v);
            for (int i = 0; i < 4; i++) { int x = 2 + i * 3 + r.Int(0, 2), top = r.Int(2, 5); p.Line(x, top + 2, x, 10, st); p.Set(x, top, c); p.Set(x - 1, top + 1, c); p.Set(x + 1, top + 1, c); p.Set(x, top + 2, c); p.Set(x, top + 1, new Color(240, 200, 60)); }
            return p;
        }
        static Px Tuft(int v)
        {
            var p = new Px(14, 11); var d = new Color(70, 130, 54); var l = new Color(150, 200, 96);
            for (int i = 0; i < 6; i++) { int x = 2 + i * 2, h = 4 + (i * 3 + v) % 5; p.Line(x, 10, x + (i % 2 == 0 ? -1 : 1), 10 - h, d); p.Set(x + (i % 2 == 0 ? -1 : 1), 10 - h, l); }
            return p;
        }
        static Color WoodC = new Color(150, 104, 62), WoodD = new Color(102, 66, 38), WoodL = new Color(190, 140, 88);
        static Px FenceH()
        {
            var p = new Px(16, 17); p.Rect(0, 5, 16, 2, WoodC); p.Rect(0, 5, 16, 1, WoodL); p.Rect(0, 10, 16, 2, WoodC); p.Rect(0, 10, 16, 1, WoodL);
            p.Rect(1, 2, 3, 14, WoodC); p.Rect(1, 2, 1, 14, WoodL); p.Rect(3, 2, 1, 14, WoodD); p.Outline(Ink); return p;
        }
        static Px FenceV()
        {
            var p = new Px(16, 17); p.Rect(6, 0, 3, 16, WoodC); p.Rect(6, 0, 1, 16, WoodL); p.Rect(8, 0, 1, 16, WoodD); p.Rect(5, 2, 5, 3, WoodC); p.Rect(5, 2, 5, 1, WoodL); p.Outline(Ink); return p;
        }
        static Px Post()
        {
            var p = new Px(9, 19); p.Rect(2, 1, 5, 17, WoodC); p.Rect(2, 1, 1, 17, WoodL); p.Rect(6, 1, 1, 17, WoodD); p.Rect(2, 1, 5, 1, WoodL); p.Outline(Ink); return p;
        }
        static Px Trough()
        {
            var p = new Px(32, 15); p.Rect(2, 3, 28, 9, WoodC); p.Rect(2, 3, 28, 1, WoodL); p.Rect(4, 4, 24, 4, new Color(80, 150, 210)); p.Rect(4, 4, 24, 1, new Color(160, 210, 240));
            p.Rect(3, 12, 3, 2, WoodD); p.Rect(26, 12, 3, 2, WoodD); p.Outline(Ink); return p;
        }
        static Px Hay(int v)
        {
            var p = new Px(22, 17); var hay = new Color(222, 190, 96); var hayD = new Color(184, 150, 64);
            if (v == 0) { p.Rect(2, 4, 18, 10, hay); p.Rect(2, 4, 18, 2, new Color(244, 220, 140)); for (int x = 3; x < 20; x += 2) p.Set(x, 8 + x % 3, hayD); p.Rect(7, 4, 1, 10, new Color(150, 110, 60)); p.Rect(14, 4, 1, 10, new Color(150, 110, 60)); }
            else { p.Ell(11, 9, 8.5f, 6.5f, hay); p.Ell(11, 9, 5, 3.6f, hayD); p.Ell(11, 9, 2.5f, 1.8f, hay); p.Ell(8, 6, 3, 1.4f, new Color(244, 220, 140)); }
            p.Outline(Ink); return p;
        }
        static Px Sign()
        {
            var p = new Px(18, 25); p.Rect(8, 10, 2, 14, WoodD); p.Rect(1, 2, 16, 9, WoodC); p.Rect(1, 2, 16, 1, WoodL); p.Rect(3, 5, 9, 1, WoodD); p.Rect(3, 7, 11, 1, WoodD); p.Outline(Ink); return p;
        }

        /// <summary>Estábulo de madeira: telhado de duas águas, porta grande com travessas em X, janela do feno e lampião.</summary>
        static Px Stable()
        {
            var p = new Px(100, 84);
            var wall = new Color(170, 82, 60); var wallD = new Color(132, 60, 44); var wallL = new Color(204, 116, 88); var trim = new Color(240, 232, 214);
            var roof = new Color(84, 92, 112); var roofD = new Color(60, 66, 84); var roofL = new Color(124, 134, 156);
            // paredes de tábuas verticais
            p.Rect(6, 38, 88, 44, wall); for (int x = 6; x < 94; x += 5) { p.Rect(x, 38, 1, 44, wallD); p.Rect(x + 1, 38, 1, 44, wallL); }
            p.Rect(6, 80, 88, 2, wallD);
            // telhado de duas águas com telhas
            for (int y = 0; y < 36; y++)
            {
                int half = 22 + (int)(y * 0.9f); int cx = 50;
                for (int x = cx - half; x <= cx + half; x++) { if (x < 0 || x >= 100) continue; var c = (y % 5 == 4) ? roofD : ((x + y / 5 * 3) % 7 == 0 ? roofD : roof); if (y < 2) c = roofL; p.Set(x, 4 + y, c); }
            }
            p.Rect(4, 39, 92, 2, roofD);
            // frontão branco com janela do feno
            for (int y = 0; y < 24; y++) { int half = (int)(y * 1.15f); for (int x = 50 - half; x <= 50 + half; x++) p.Set(x, 14 + y, y > 22 ? trim : wall); }
            p.Line(50, 13, 23, 38, trim, 2); p.Line(50, 13, 77, 38, trim, 2);
            p.Rect(44, 24, 12, 10, new Color(60, 40, 30)); p.Rect(45, 28, 10, 6, new Color(222, 190, 96)); p.Rect(43, 23, 14, 1, trim); p.Rect(43, 34, 14, 1, trim); p.Rect(43, 23, 1, 12, trim); p.Rect(56, 23, 1, 12, trim);
            // porta grande com X
            p.Rect(34, 50, 32, 32, new Color(140, 64, 48)); p.Rect(33, 49, 34, 2, trim); p.Rect(33, 49, 2, 33, trim); p.Rect(65, 49, 2, 33, trim); p.Rect(49, 51, 2, 31, trim);
            p.Line(35, 51, 49, 81, trim, 2); p.Line(49, 51, 35, 81, trim, 2); p.Line(51, 51, 65, 81, trim, 2); p.Line(65, 51, 51, 81, trim, 2);
            // janelas laterais e lampião
            foreach (int wx in new[] { 13, 76 }) { p.Rect(wx, 52, 11, 10, new Color(250, 214, 140)); p.Rect(wx, 52, 11, 1, trim); p.Rect(wx, 61, 11, 1, trim); p.Rect(wx, 52, 1, 10, trim); p.Rect(wx + 10, 52, 1, 10, trim); p.Rect(wx + 5, 52, 1, 10, trim); }
            p.Rect(70, 44, 3, 4, new Color(250, 200, 90)); p.Set(71, 43, Ink);
            p.Outline(Ink); return p;
        }
    }
}
