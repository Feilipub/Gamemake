// Terra de Crinas — chão em ladrilhos 16×16 desenhados em código: capim, capim alto e viçoso, chão de mata com
// folhas, trilha de terra, areia, água rasa e funda (com brilho animado). Os tipos se misturam com bordas onduladas:
// o de maior prioridade "invade" o vizinho, com friso de sombra (barranco) ou espuma (beira d'água).
using System;
using Crinas.World;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Render
{
    public sealed class TerrainArt
    {
        public const int T = 16, VAR = 4, NT = Tile.Count;
        public Texture2D Atlas;
        /// <summary>Prioridade de mistura: maior fica por cima.</summary>
        public static readonly int[] Prio = new int[NT];
        static TerrainArt() { Prio[Tile.Deep] = 0; Prio[Tile.Water] = 1; Prio[Tile.Sand] = 2; Prio[Tile.Dirt] = 3; Prio[Tile.Forest] = 4; Prio[Tile.Grass] = 5; Prio[Tile.Lush] = 6; }

        // colunas: 0..3 variações, 4..5 animação da água, 6..13 bordas, 14..21 bordas sobre água (com espuma)
        public Rectangle Base(int t, int v) => new Rectangle(v * T, t * T, T, T);
        public Rectangle WaterF(int t, int f) => new Rectangle((4 + f) * T, t * T, T, T);
        public Rectangle Edge(int t, int m, bool onWater) => new Rectangle((6 + m + (onWater ? 8 : 0)) * T, t * T, T, T);

        static float H(int x, int y, int s) => Crinas.Core.Noise.Hash(x, y, s);
        static Color V(Color c, float k) => new Color((int)MathHelper.Clamp(c.R * k, 0, 255), (int)MathHelper.Clamp(c.G * k, 0, 255), (int)MathHelper.Clamp(c.B * k, 0, 255));

        public TerrainArt(GraphicsDevice gd)
        {
            int W = 22 * T, Hh = NT * T; var px = new Color[W * Hh];
            void P(int ax, int ay, int x, int y, Color c) { if (x >= 0 && y >= 0 && x < T && y < T) px[(ay + y) * W + ax + x] = c; }
            var tiles = new Color[NT][][];
            for (int t = 0; t < NT; t++)
            {
                tiles[t] = new Color[VAR + 2][];
                for (int v = 0; v < VAR + 2; v++)
                {
                    if (v >= VAR && !WorldGen.IsWater((byte)t)) continue;
                    var tile = new Color[T * T]; Paint(tile, t, v); tiles[t][v] = tile;
                    for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) P(v * T, t * T, x, y, tile[y * T + x]);
                }
            }
            for (int t = 0; t < NT; t++)
            {
                if (t == Tile.Deep) continue;
                for (int m = 0; m < 8; m++) for (int w = 0; w < 2; w++)
                    {
                        var mask = new bool[T * T];
                        for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) mask[y * T + x] = Covered(m, x, y, t);
                        var src = tiles[t][(m + w) % VAR]; int ax = (6 + m + w * 8) * T, ay = t * T; bool grassy = t >= Tile.Forest;
                        for (int y = 0; y < T; y++) for (int x = 0; x < T; x++)
                            {
                                bool on = mask[y * T + x];
                                bool edge = on && (!In(mask, x + 1, y) || !In(mask, x - 1, y) || !In(mask, x, y + 1) || !In(mask, x, y - 1));
                                bool near = !on && (Inn(mask, x + 1, y) || Inn(mask, x - 1, y) || Inn(mask, x, y + 1) || Inn(mask, x, y - 1));
                                if (on) P(ax, ay, x, y, edge ? V(src[y * T + x], grassy ? 0.74f : 0.86f) : src[y * T + x]);
                                else if (near && w == 1) P(ax, ay, x, y, Color.White * 0.5f);
                                else if (near && grassy) P(ax, ay, x, y, Color.Black * 0.16f);
                            }
                    }
            }
            Atlas = new Texture2D(gd, W, Hh); Atlas.SetData(px);
        }

        static bool In(bool[] m, int x, int y) => x < 0 || y < 0 || x >= T || y >= T || m[y * T + x];
        static bool Inn(bool[] m, int x, int y) => x >= 0 && y >= 0 && x < T && y < T && m[y * T + x];

        static bool Covered(int m, int x, int y, int t)
        {
            float fx = x + 0.5f, fy = y + 0.5f;
            float wob(float a) => 1.4f * (float)Math.Sin(a * 0.85f + t) + 0.8f * (float)Math.Sin(a * 2.1f + 1.3f * t);
            float depth = t >= Tile.Forest ? 5 : 4;
            switch (m)
            {
                case 0: return fy < depth + wob(fx);
                case 1: return fx > T - depth - wob(fy);
                case 2: return fy > T - depth - wob(fx + 7);
                case 3: return fx < depth + wob(fy + 7);
                default:
                    float cx = m == 4 || m == 5 ? T : 0, cy = m == 4 || m == 7 ? 0 : T, r = depth + 1 + wob(fx + fy) * 0.6f;
                    return (fx - cx) * (fx - cx) + (fy - cy) * (fy - cy) < r * r;
            }
        }

        static void Paint(Color[] c, int t, int v)
        {
            int seed = t * 31 + v * 7;
            void Fill(Color b, float var) { for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) c[y * T + x] = V(b, 1 + (H(x + v * 16, y, seed) - 0.5f) * var); }
            void Px(int x, int y, Color col) { x = ((x % T) + T) % T; y = ((y % T) + T) % T; c[y * T + x] = col; }
            switch (t)
            {
                case Tile.Grass:
                case Tile.Lush:
                    {
                        bool lush = t == Tile.Lush;
                        Color b = lush ? new Color(90, 160, 70) : new Color(118, 178, 82), d = lush ? new Color(62, 124, 52) : new Color(86, 146, 62), l = lush ? new Color(140, 200, 100) : new Color(164, 210, 110);
                        Fill(b, 0.09f);
                        int n = lush ? 14 : 9;
                        for (int i = 0; i < n; i++)
                        {
                            int x = (int)(H(i, v, seed + 1) * T), y = (int)(H(v, i, seed + 2) * T), hgt = lush ? 3 : 2;
                            for (int k = 0; k < hgt; k++) Px(x, y - k, d); Px(x, y - hgt, l);
                            if (lush && i % 3 == 0) { Px(x + 1, y - 1, d); Px(x + 1, y - 2, l); }
                        }
                        break;
                    }
                case Tile.Forest:
                    {
                        Fill(new Color(74, 122, 58), 0.12f);
                        for (int i = 0; i < 6; i++) { int x = (int)(H(i, v, seed) * T), y = (int)(H(v, i + 4, seed) * T); Px(x, y, new Color(160, 120, 60)); Px(x + 1, y, new Color(130, 90, 46)); }
                        for (int i = 0; i < 7; i++) { int x = (int)(H(i + 9, v, seed) * T), y = (int)(H(v, i + 13, seed) * T); Px(x, y, new Color(54, 96, 44)); Px(x, y - 1, new Color(96, 146, 70)); }
                        break;
                    }
                case Tile.Dirt:
                    Fill(new Color(176, 132, 86), 0.08f);
                    for (int i = 0; i < 5; i++) { int x = (int)(H(i, v, seed) * T), y = (int)(H(v, i + 9, seed) * T); Px(x, y, new Color(136, 96, 60)); Px(x + 1, y, new Color(206, 166, 116)); }
                    for (int i = 0; i < 2; i++) { int x = (int)(H(i + 4, v, seed) * T), y = (int)(H(v + 2, i, seed) * T); Px(x, y, new Color(156, 146, 136)); Px(x, y + 1, new Color(110, 100, 92)); }
                    break;
                case Tile.Sand:
                    Fill(new Color(230, 210, 156), 0.06f);
                    for (int i = 0; i < 6; i++) Px((int)(H(i, v, seed) * T), (int)(H(v, i, seed) * T), new Color(200, 176, 120));
                    break;
                case Tile.Water:
                case Tile.Deep:
                    {
                        bool deep = t == Tile.Deep; Fill(deep ? new Color(46, 104, 170) : new Color(70, 142, 204), 0.04f); int f = v >= VAR ? v - VAR : 0;
                        for (int i = 0; i < 3; i++) { int x = (int)(H(i, v % VAR, seed) * 12) + f * 2, y = (int)(H(v % VAR, i, seed) * 14); for (int k = 0; k < 3; k++) Px(x + k, y, deep ? new Color(90, 150, 210) : new Color(156, 206, 240)); }
                        break;
                    }
            }
        }
    }
}
