// Lida no Sertão (MonoGame) — desenho do chão em ladrilhos com bordas misturadas e do vaqueiro novo.
using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    public partial class LidaGame
    {
        readonly TerrainArt[] terrain = new TerrainArt[2]; HeroArt hero;

        byte[] gsm; // chão suavizado só para o desenho (manchas de 1 ladrilho somem no tipo de volta)

        void GroundInit()
        {
            hero = new HeroArt(GraphicsDevice); terrain[season] = new TerrainArt(GraphicsDevice, season);
            int W = world.MW, H = world.MH; gsm = new byte[W * H];
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) { int g = world.Ground[y * W + x]; if (g == G.DIRT && x >= 112) g = TerrainArt.GRAVEL; gsm[y * W + x] = (byte)(g >= TerrainArt.NT ? G.GRASS : g); }
            Span<int> cnt = stackalloc int[TerrainArt.NT];
            for (int pass = 0; pass < 2; pass++)
            {
                var src = (byte[])gsm.Clone();
                for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++)
                {
                    int t = src[y * W + x]; if (!TerrainArt.Soft(t)) continue; cnt.Clear();
                    cnt[src[(y - 1) * W + x]]++; cnt[src[(y + 1) * W + x]]++; cnt[src[y * W + x - 1]]++; cnt[src[y * W + x + 1]]++;
                    for (int k = 0; k < TerrainArt.NT; k++) if (k != t && cnt[k] >= 3 && TerrainArt.Soft(k) && (k != G.WATER || cnt[k] == 4)) { gsm[y * W + x] = (byte)k; break; }
                }
            }
        }

        int Gnd(int x, int y, int self) => x < 0 || y < 0 || x >= world.MW || y >= world.MH ? self : gsm[y * world.MW + x];

        void DrawGround(RectangleF view)
        {
            if (terrain[season] == null) terrain[season] = new TerrainArt(GraphicsDevice, season);
            var ta = terrain[season]; int T = world.TS;
            int x0 = Math.Max(0, (int)(view.X / T) - 1), y0 = Math.Max(0, (int)(view.Y / T) - 1), x1 = Math.Min(world.MW - 1, (int)((view.X + view.W) / T) + 1), y1 = Math.Min(world.MH - 1, (int)((view.Y + view.H) / T) + 1);
            int wf = (int)(fxT * 1.6f);
            Span<int> nb = stackalloc int[8]; // N L S O NE SE SO NO
            for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++)
                {
                    int t = Gnd(tx, ty, G.GRASS); var pos = new Vector2(tx * T, ty * T);
                    unchecked { int hv = (int)(((uint)(tx * 73856093) ^ (uint)(ty * 19349663)) % 4); sb.Draw(ta.Atlas, pos, t == G.WATER ? ta.Water((wf + tx + ty * 2) % 2) : ta.Base(t, hv), Color.White); }
                    nb[0] = Gnd(tx, ty - 1, t); nb[1] = Gnd(tx + 1, ty, t); nb[2] = Gnd(tx, ty + 1, t); nb[3] = Gnd(tx - 1, ty, t);
                    nb[4] = Gnd(tx + 1, ty - 1, t); nb[5] = Gnd(tx + 1, ty + 1, t); nb[6] = Gnd(tx - 1, ty + 1, t); nb[7] = Gnd(tx - 1, ty - 1, t);
                    if (!TerrainArt.Soft(t))
                    {
                        // borda reta com sombra nos tipos duros (calçamento, calçada, praça, assoalho, ponte)
                        if (nb[0] != t) sb.Draw(spr.Pixel, new Rectangle(tx * T, ty * T, T, 1), Color.Black * 0.28f);
                        if (nb[2] != t) sb.Draw(spr.Pixel, new Rectangle(tx * T, ty * T + T - 1, T, 1), Color.Black * 0.35f);
                        if (nb[3] != t) sb.Draw(spr.Pixel, new Rectangle(tx * T, ty * T, 1, T), Color.Black * 0.22f);
                        if (nb[1] != t) sb.Draw(spr.Pixel, new Rectangle(tx * T + T - 1, ty * T, 1, T), Color.Black * 0.22f);
                        continue;
                    }
                    int p = TerrainArt.Prio[t], last = p;
                    // bordas dos vizinhos "por cima", da menor para a maior prioridade
                    while (true)
                    {
                        int next = -1, np = 99;
                        for (int k = 0; k < 8; k++) { int n = nb[k]; if (!TerrainArt.Soft(n) || n == G.WATER) continue; int q = TerrainArt.Prio[n]; if (q > last && q < np) { np = q; next = n; } }
                        if (next < 0) break; last = np; bool onW = t == G.WATER;
                        for (int k = 0; k < 4; k++) if (nb[k] == next) sb.Draw(ta.Atlas, pos, ta.Edge(next, k, onW), Color.White);
                        for (int k = 4; k < 8; k++) if (nb[k] == next && nb[k - 4] != next && nb[(k - 3) % 4] != next) sb.Draw(ta.Atlas, pos, ta.Edge(next, k, onW), Color.White);
                    }
                }
        }

        void DrawHero(Color tint)
        {
            int row = pl.Dir == 0 ? 0 : pl.Dir == 1 ? 1 : 2; int fr = !pl.Moving ? 0 : 1 + (int)(pl.Dist / (pl.Running ? 7f : 5.5f)) % 4;
            spr.Shadow(sb, pl.Pos.X, pl.Pos.Y, 7, 2.5f, 0.35f);
            sb.Draw(hero.Sheet, new Vector2((float)Math.Round(pl.Pos.X), (float)Math.Round(pl.Pos.Y)), hero.Src(row, fr), tint, 0, HeroArt.Anchor, 1, pl.Dir == 2 ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0);
        }
    }
}
