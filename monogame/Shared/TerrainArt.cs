// Lida no Sertão (MonoGame) — chão em ladrilhos desenhados em código (16×16), no estilo dos jogos de fazenda:
// capim com folhinhas, pasto alto, terra batida, chão rachado da seca, lama, areia, água com brilho animado,
// calçamento de pedra, calçada, praça de lajota, assoalho e ponte. Os tipos "macios" se misturam com bordas
// onduladas e um friso escuro (o capim fica por cima da terra, a areia faz a praia na água); os "duros" têm
// borda reta com linha de sombra.
using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    public class TerrainArt
    {
        public const int T = 16, VAR = 4, NT = 13, GRAVEL = 12;
        public Texture2D Atlas;
        // prioridade de mistura (maior fica por cima); -1 = tipo duro (não mistura)
        public static readonly int[] Prio = new int[NT];
        static TerrainArt()
        {
            for (int i = 0; i < NT; i++) Prio[i] = -1;
            Prio[G.WATER] = 0; Prio[G.SAND] = 1; Prio[G.MUD] = 2; Prio[G.DIRT] = 3; Prio[GRAVEL] = 3; Prio[G.FLOOR] = 4; Prio[G.DRY] = 5; Prio[G.GRASS] = 6; Prio[G.PAST] = 7;
        }
        public static bool Soft(int t) => t >= 0 && t < NT && Prio[t] >= 0;

        // colunas do atlas: 0..3 variações, 4..5 água animada (só na linha da água), 6..13 bordas, 14..21 bordas sobre água
        public Rectangle Base(int t, int v) => new Rectangle(v * T, t * T, T, T);
        public Rectangle Water(int f) => new Rectangle((4 + f) * T, G.WATER * T, T, T);
        public Rectangle Edge(int t, int m, bool onWater) => new Rectangle((6 + m + (onWater ? 8 : 0)) * T, t * T, T, T);

        static float H(int x, int y, int s) { unchecked { uint h = (uint)(x * 374761393 + y * 668265263 + s * 2246822519u); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xffff) / 65535f; } }
        static Color V(Color c, float k) => new Color((int)MathHelper.Clamp(c.R * k, 0, 255), (int)MathHelper.Clamp(c.G * k, 0, 255), (int)MathHelper.Clamp(c.B * k, 0, 255));

        public TerrainArt(GraphicsDevice gd, int season)
        {
            int W = 22 * T, Hh = NT * T; var px = new Color[W * Hh];
            void P(int ax, int ay, int x, int y, Color c) { if (x >= 0 && y >= 0 && x < T && y < T) px[(ay + y) * W + ax + x] = c; }
            var tiles = new Color[NT][][];
            for (int t = 0; t < NT; t++)
            {
                tiles[t] = new Color[VAR + 2][];
                for (int v = 0; v < VAR + 2; v++)
                {
                    if (v >= VAR && t != G.WATER) continue;
                    var tile = new Color[T * T]; Paint(tile, t, v, season); tiles[t][v] = tile;
                    for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) P(v * T, t * T, x, y, tile[y * T + x]);
                }
            }
            // bordas: 0 N, 1 L, 2 S, 3 O (lados); 4 NE, 5 SE, 6 SO, 7 NO (cantos)
            for (int t = 0; t < NT; t++)
            {
                if (!Soft(t) || t == G.WATER) continue;
                for (int m = 0; m < 8; m++) for (int w = 0; w < 2; w++)
                    {
                        var mask = new bool[T * T];
                        for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) mask[y * T + x] = Covered(m, x, y, t);
                        var src = tiles[t][(m + w) % VAR]; int ax = (6 + m + w * 8) * T, ay = t * T;
                        for (int y = 0; y < T; y++) for (int x = 0; x < T; x++)
                        {
                            bool on = mask[y * T + x];
                            bool edge = on && (!In(mask, x + 1, y) || !In(mask, x - 1, y) || !In(mask, x, y + 1) || !In(mask, x, y - 1));
                            bool near = !on && (Inn(mask, x + 1, y) || Inn(mask, x - 1, y) || Inn(mask, x, y + 1) || Inn(mask, x, y - 1));
                            if (on) P(ax, ay, x, y, edge ? V(src[y * T + x], t == G.GRASS || t == G.PAST ? 0.72f : 0.85f) : src[y * T + x]);
                            else if (near && w == 1) P(ax, ay, x, y, Color.White * 0.55f); // espuma na beira d'água
                            else if (near && (t == G.GRASS || t == G.PAST)) P(ax, ay, x, y, Color.Black * 0.18f); // sombra do barranco
                        }
                    }
            }
            Atlas = new Texture2D(gd, W, Hh); Atlas.SetData(px);
        }

        static bool In(bool[] m, int x, int y) => x >= 0 && y >= 0 && x < T && y < T ? m[y * T + x] : true;
        static bool Inn(bool[] m, int x, int y) => x >= 0 && y >= 0 && x < T && y < T && m[y * T + x];

        static bool Covered(int m, int x, int y, int t)
        {
            float fx = x + 0.5f, fy = y + 0.5f;
            float wob(float a) => 1.4f * (float)Math.Sin(a * 0.85f + t) + 0.8f * (float)Math.Sin(a * 2.1f + 1.3f * t);
            float depth = t == G.GRASS || t == G.PAST ? 5 : 4;
            switch (m)
            {
                case 0: return fy < depth + wob(fx);
                case 1: return fx > T - depth - wob(fy);
                case 2: return fy > T - depth - wob(fx + 7);
                case 3: return fx < depth + wob(fy + 7);
                default:
                    float cx = m == 4 || m == 5 ? T : 0, cy = m == 4 || m == 7 ? 0 : T; float r = depth + 1 + wob(fx + fy) * 0.6f;
                    return (fx - cx) * (fx - cx) + (fy - cy) * (fy - cy) < r * r;
            }
        }

        /// <summary>Pinta um ladrilho base do tipo t (variação v) para a estação.</summary>
        static void Paint(Color[] c, int t, int v, int s)
        {
            bool dry = s == 1; int seed = t * 31 + v * 7 + (v >= VAR ? 0 : 0);
            void Fill(Color b, float var) { for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) c[y * T + x] = V(b, 1 + (H(x + v * 16, y, seed) - 0.5f) * var); }
            void Px(int x, int y, Color col) { x = ((x % T) + T) % T; y = ((y % T) + T) % T; c[y * T + x] = col; }
            switch (t)
            {
                case G.GRASS:
                case G.PAST:
                    {
                        bool past = t == G.PAST;
                        Color b = dry ? (past ? new Color(178, 156, 86) : new Color(190, 172, 100)) : (past ? new Color(84, 150, 64) : new Color(108, 168, 74));
                        Color d = dry ? new Color(146, 122, 64) : (past ? new Color(58, 116, 48) : new Color(78, 136, 56)), l = dry ? new Color(216, 198, 128) : new Color(150, 200, 96);
                        Fill(b, 0.10f);
                        int n = past ? 14 : 8;
                        for (int i = 0; i < n; i++)
                        {
                            int x = (int)(H(i, v, seed + 1) * T), y = (int)(H(v, i, seed + 2) * T), h = past ? 3 : 2;
                            for (int k = 0; k < h; k++) Px(x, y - k, d); Px(x, y - h, l);
                            if (past && i % 3 == 0) { Px(x + 1, y - 1, d); Px(x + 1, y - 2, l); }
                        }
                        if (!past && v == 3 && !dry) { Px(4, 5, new Color(250, 240, 120)); Px(11, 11, new Color(255, 255, 255)); Px(12, 10, new Color(255, 255, 255)); }
                        break;
                    }
                case G.DIRT:
                    {
                        Fill(dry ? new Color(186, 140, 92) : new Color(170, 122, 78), 0.08f);
                        for (int i = 0; i < 5; i++) { int x = (int)(H(i, v, seed) * T), y = (int)(H(v, i + 9, seed) * T); Px(x, y, new Color(130, 90, 56)); Px(x + 1, y, new Color(206, 162, 112)); }
                        for (int i = 0; i < 3; i++) { int x = (int)(H(i + 4, v, seed) * T), y = (int)(H(v + 2, i, seed) * T); Px(x, y, new Color(150, 140, 130)); Px(x, y + 1, new Color(110, 100, 92)); }
                        break;
                    }
                case G.DRY:
                    {
                        Fill(new Color(200, 164, 112), 0.07f); var cr = new Color(150, 110, 70);
                        int x0 = (int)(H(v, 1, seed) * 8), y0 = (int)(H(v, 2, seed) * 8);
                        for (int k = 0; k < 9; k++) Px(x0 + k, y0 + (k % 3 == 0 ? 1 : 0) + k / 3, cr);
                        for (int k = 0; k < 5; k++) Px(x0 + 4, y0 + 2 + k, cr);
                        Px(x0 + 10, y0 + 8, cr); Px(x0 + 11, y0 + 9, cr);
                        break;
                    }
                case G.MUD:
                    Fill(new Color(116, 80, 52), 0.08f);
                    for (int i = 0; i < 4; i++) { int x = (int)(H(i, v, seed) * T), y = (int)(H(v, i, seed) * T); Px(x, y, new Color(160, 120, 84)); Px(x + 1, y, new Color(90, 60, 40)); }
                    Px(5, 9, new Color(150, 170, 190)); Px(6, 9, new Color(150, 170, 190));
                    break;
                case G.SAND:
                    Fill(new Color(228, 206, 150), 0.06f);
                    for (int i = 0; i < 6; i++) Px((int)(H(i, v, seed) * T), (int)(H(v, i, seed) * T), new Color(196, 172, 116));
                    break;
                case G.WATER:
                    {
                        Fill(new Color(66, 134, 196), 0.05f); int f = v >= VAR ? v - VAR : 0;
                        for (int i = 0; i < 3; i++) { int x = (int)(H(i, v % VAR, seed) * 12) + f * 2, y = (int)(H(v % VAR, i, seed) * 14); for (int k = 0; k < 3; k++) Px(x + k, y, new Color(150, 200, 236)); }
                        break;
                    }
                case G.PAVE:
                    {
                        Fill(new Color(118, 112, 106), 0.04f);
                        int[,] st = { { 1, 1, 6, 6 }, { 8, 1, 7, 6 }, { 1, 8, 8, 7 }, { 10, 8, 5, 7 } };
                        for (int k = 0; k < 4; k++)
                        {
                            float g = 0.9f + H(k, v, seed) * 0.25f; var sc = V(new Color(168, 162, 152), g);
                            for (int y = st[k, 1]; y < st[k, 1] + st[k, 3] - 1; y++) for (int x = st[k, 0]; x < st[k, 0] + st[k, 2] - 1; x++) Px(x, y, y == st[k, 1] ? V(sc, 1.12f) : sc);
                        }
                        break;
                    }
                case G.WALK:
                    Fill(new Color(206, 196, 178), 0.04f);
                    for (int i = 0; i < T; i++) { Px(i, 0, new Color(170, 160, 144)); Px(0, i, new Color(170, 160, 144)); Px(i, 8, new Color(184, 174, 158)); }
                    break;
                case G.PLAZA:
                    for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) { bool a = (x / 8 + y / 8) % 2 == 0; var b = a ? new Color(200, 126, 88) : new Color(226, 200, 160); if (x % 8 == 0 || y % 8 == 0) b = V(b, 0.82f); c[y * T + x] = V(b, 1 + (H(x, y, seed) - 0.5f) * 0.05f); }
                    break;
                case G.FLOOR: // terreiro: terra batida clara, varrida
                    {
                        Fill(dry ? new Color(206, 170, 120) : new Color(196, 156, 108), 0.06f);
                        for (int i = 0; i < 6; i++) Px((int)(H(i, v, seed) * T), (int)(H(v, i + 3, seed) * T), new Color(170, 130, 88));
                        for (int i = 0; i < 3; i++) Px((int)(H(i + 7, v, seed) * T), (int)(H(v + 5, i, seed) * T), new Color(222, 188, 140));
                        break;
                    }
                case GRAVEL: // estrada de cascalho
                    {
                        Fill(new Color(176, 160, 136), 0.06f);
                        for (int i = 0; i < 12; i++) { int x = (int)(H(i, v, seed) * T), y = (int)(H(v, i, seed + 3) * T); Px(x, y, new Color(130, 120, 108)); Px(x + 1, y, new Color(214, 204, 186)); }
                        break;
                    }
                case G.BRIDGE:
                    for (int y = 0; y < T; y++) for (int x = 0; x < T; x++) { var b = new Color(156, 104, 58); if (x % 5 == 4) b = new Color(80, 50, 26); else if (y == 2 || y == 13) b = new Color(110, 70, 36); c[y * T + x] = V(b, 1 + (H(x / 5, y, seed) - 0.5f) * 0.12f); }
                    Px(1, 2, new Color(200, 200, 200)); Px(6, 2, new Color(200, 200, 200)); Px(11, 13, new Color(200, 200, 200));
                    break;
                default:
                    Fill(new Color(108, 168, 74), 0.1f); break;
            }
        }
    }
}
