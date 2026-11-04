// Terra de Crinas — gerador do mundo. Função pura da semente: o mesmo ladrilho sempre sai igual, então nada
// precisa ser guardado para o terreno. Fase 1: o vale inicial (campos, campos floridos, matas, rios, lagos,
// praias de areia e trilhas) em um mapa contínuo de 1024×1024 ladrilhos, com o rancho do jogador no centro.
// Biomas novos (deserto, montanha, neve, litoral) entram trocando Biome() sem mexer no resto.
using System;
using System.Collections.Generic;
using Crinas.Core;

namespace Crinas.World
{
    /// <summary>Tipos de chão. A ordem não importa para a mistura (ver TerrainArt.Prio).</summary>
    public static class Tile { public const byte Deep = 0, Water = 1, Sand = 2, Dirt = 3, Forest = 4, Grass = 5, Lush = 6, Count = 7; }

    public enum PropKind : byte { Oak, Pine, Bush, Rock, Stump, Log, Flowers, Tuft, FenceH, FenceV, Post, Stable, Trough, Hay, Sign }

    /// <summary>Objeto do mapa: posição é o pé (ponto no chão) em pixels do mundo.</summary>
    public struct Prop { public PropKind Kind; public byte Var; public float X, Y; }

    public sealed class WorldGen
    {
        public const int TS = 16, W = 1024, H = 1024;
        public readonly int Seed;
        public readonly int SpawnTX = W / 2, SpawnTY = H / 2;
        /// <summary>Rancho do jogador (em ladrilhos): cercado + estábulo.</summary>
        public readonly int RanchX0, RanchY0, RanchX1, RanchY1;

        public WorldGen(int seed)
        {
            Seed = seed; RanchX0 = SpawnTX - 10; RanchY0 = SpawnTY - 6; RanchX1 = SpawnTX + 12; RanchY1 = SpawnTY + 9;
        }

        float Elev(int x, int y)
        {
            float e = Noise.Fbm(x * 0.006f, y * 0.006f, Seed, 5);
            float dx = x - SpawnTX, dy = y - SpawnTY, d = (float)Math.Sqrt(dx * dx + dy * dy);
            if (d < 40) e = Math.Max(e, 0.44f - d / 400f); // o rancho fica em terra firme
            return e;
        }
        float River(int x, int y)
        {
            float r = Math.Abs(Noise.Fbm(x * 0.0042f, y * 0.0042f, Seed + 7, 3) - 0.5f);
            float dx = x - SpawnTX, dy = y - SpawnTY; if (dx * dx + dy * dy < 30 * 30) r = Math.Max(r, 0.06f);
            return r;
        }

        /// <summary>Tipo de chão do ladrilho.</summary>
        public byte TileAt(int x, int y)
        {
            if (x < 0 || y < 0 || x >= W || y >= H) return Tile.Deep;
            // borda do mundo vira um grande lago (o mapa não termina "no nada")
            int edge = Math.Min(Math.Min(x, y), Math.Min(W - 1 - x, H - 1 - y)); if (edge < 6) return Tile.Deep;
            if (x >= RanchX0 - 2 && x <= RanchX1 + 2 && y >= RanchY0 - 2 && y <= RanchY1 + 3)
                return y >= RanchY1 + 1 || (x >= RanchX0 + 1 && x <= RanchX0 + 7 && y >= RanchY0 + 1 && y <= RanchY0 + 8) ? Tile.Dirt : Tile.Grass;
            float e = Elev(x, y), r = River(x, y);
            if (edge < 14) e = Math.Min(e, 0.2f + edge * 0.01f);
            if (e < 0.30f || r < 0.007f) return Tile.Deep;
            if (e < 0.335f || r < 0.016f) return Tile.Water;
            if (e < 0.36f || r < 0.024f) return Tile.Sand;
            // trilhas: linhas finas de um segundo ruído
            float tr = Math.Abs(Noise.Fbm(x * 0.009f, y * 0.009f, Seed + 23, 2) - 0.5f); if (tr < 0.0085f) return Tile.Dirt;
            // estrada do rancho para o leste
            if (y >= SpawnTY + 10 && y <= SpawnTY + 11 && x > SpawnTX && x < SpawnTX + 90) return Tile.Dirt;
            float f = Noise.Fbm(x * 0.011f, y * 0.011f, Seed + 11, 4); if (f > 0.6f) return Tile.Forest;
            float m = Noise.Fbm(x * 0.008f, y * 0.008f, Seed + 3, 3); if (m > 0.6f) return Tile.Lush;
            return Tile.Grass;
        }
        public static bool IsWater(byte t) => t == Tile.Deep || t == Tile.Water;

        /// <summary>Densidade de flores (campos floridos) no ladrilho.</summary>
        public float Flowers(int x, int y) => Noise.Fbm(x * 0.02f, y * 0.02f, Seed + 31, 2);

        bool LocalMin(int x, int y, int salt, int rad)
        {
            float h = Noise.Hash(x, y, Seed + salt);
            for (int j = -rad; j <= rad; j++) for (int i = -rad; i <= rad; i++) if ((i != 0 || j != 0) && Noise.Hash(x + i, y + j, Seed + salt) < h) return false;
            return true;
        }

        /// <summary>Objetos naturais de um ladrilho (árvores, arbustos, pedras, flores, capim). Determinístico.</summary>
        public void PropsAt(int x, int y, List<Prop> outList)
        {
            byte t = TileAt(x, y); if (IsWater(t)) return;
            if (t == Tile.Sand) { if (Noise.Hash(x, y, Seed + 90) < 0.02f) outList.Add(P(PropKind.Rock, x, y, 0.5f)); return; }
            if (InRanch(x, y)) return;
            float h = Noise.Hash(x, y, Seed + 50), h2 = Noise.Hash(x, y, Seed + 51), h3 = Noise.Hash(x, y, Seed + 52);
            float jx = Noise.Hash(x, y, Seed + 53) * 8 - 4, jy = Noise.Hash(x, y, Seed + 54) * 6 - 3;
            if (t == Tile.Dirt) { if (h < 0.01f) outList.Add(P(PropKind.Rock, x, y, h2, jx, jy)); return; }
            if (t == Tile.Forest)
            {
                if (h < 0.34f && LocalMin(x, y, 50, 1)) { bool pine = Noise.Fbm(x * 0.03f, y * 0.03f, Seed + 61, 2) > 0.52f; outList.Add(P(pine ? PropKind.Pine : PropKind.Oak, x, y, h2, jx, jy)); return; }
                if (h2 < 0.05f) { outList.Add(P(h3 < 0.5f ? PropKind.Stump : PropKind.Log, x, y, h3, jx, jy)); return; }
                if (h2 < 0.18f) outList.Add(P(PropKind.Bush, x, y, h3, jx, jy));
                else if (h2 < 0.4f) outList.Add(P(PropKind.Tuft, x, y, h3, jx, jy));
                return;
            }
            float fl = Flowers(x, y);
            if (h < (t == Tile.Lush ? 0.035f : 0.02f) && LocalMin(x, y, 50, 2)) { outList.Add(P(h2 < 0.85f ? PropKind.Oak : PropKind.Pine, x, y, h2, jx, jy)); return; }
            if (h2 < 0.012f) { outList.Add(P(PropKind.Rock, x, y, h3, jx, jy)); return; }
            if (h2 < 0.04f) { outList.Add(P(PropKind.Bush, x, y, h3, jx, jy)); return; }
            float fp = fl > 0.6f ? 0.45f : fl > 0.52f ? 0.15f : 0.04f;
            if (h3 < fp) { outList.Add(P(PropKind.Flowers, x, y, h, jx, jy)); return; }
            if (h3 < fp + (t == Tile.Lush ? 0.22f : 0.1f)) outList.Add(P(PropKind.Tuft, x, y, h, jx, jy));
        }
        static Prop P(PropKind k, int x, int y, float v, float jx = 0, float jy = 0) => new Prop { Kind = k, Var = (byte)(v * 251), X = x * TS + 8 + jx, Y = y * TS + 12 + jy };

        public bool InRanch(int x, int y) => x >= RanchX0 - 2 && x <= RanchX1 + 2 && y >= RanchY0 - 2 && y <= RanchY1 + 3;

        /// <summary>Construções e cercas do rancho inicial (objetos importantes, posição fixa).</summary>
        public List<Prop> RanchProps()
        {
            var L = new List<Prop>(); int x0 = RanchX0, y0 = RanchY0, x1 = RanchX1, y1 = RanchY1;
            // cercado (piquete) com porteira aberta embaixo
            int px0 = x0 + 9, py0 = y0, px1 = x1, py1 = y1, gate = (px0 + px1) / 2;
            for (int x = px0; x <= px1; x++) { L.Add(new Prop { Kind = PropKind.FenceH, X = x * TS + 8, Y = py0 * TS + 14 }); if (x < gate - 1 || x > gate + 1) L.Add(new Prop { Kind = PropKind.FenceH, X = x * TS + 8, Y = py1 * TS + 14 }); }
            for (int y = py0 + 1; y < py1; y++) { L.Add(new Prop { Kind = PropKind.FenceV, X = px0 * TS + 8, Y = y * TS + 14 }); L.Add(new Prop { Kind = PropKind.FenceV, X = px1 * TS + 8, Y = y * TS + 14 }); }
            L.Add(new Prop { Kind = PropKind.Post, X = (gate - 2) * TS + 8, Y = py1 * TS + 14 }); L.Add(new Prop { Kind = PropKind.Post, X = (gate + 2) * TS + 8, Y = py1 * TS + 14 });
            // estábulo no canto de cima à esquerda, bebedouro e fardos de feno
            L.Add(new Prop { Kind = PropKind.Stable, X = (x0 + 4) * TS + 8, Y = (y0 + 7) * TS + 15 });
            L.Add(new Prop { Kind = PropKind.Trough, X = (px0 + 3) * TS, Y = (py0 + 3) * TS + 8 });
            L.Add(new Prop { Kind = PropKind.Hay, X = (x0 + 8) * TS, Y = (y0 + 9) * TS + 6 });
            L.Add(new Prop { Kind = PropKind.Hay, X = (x0 + 1) * TS + 4, Y = (y0 + 9) * TS + 10, Var = 1 });
            L.Add(new Prop { Kind = PropKind.Sign, X = (x1 + 2) * TS, Y = (y1 + 1) * TS + 12 });
            return L;
        }

        /// <summary>Tamanho do bloqueio de cada tipo (meia largura, meia altura) a partir do pé; 0 = não bloqueia.</summary>
        public static (float hw, float hh) Footprint(PropKind k)
        {
            switch (k)
            {
                case PropKind.Oak: return (5, 3);
                case PropKind.Pine: return (4, 3);
                case PropKind.Rock: return (6, 3);
                case PropKind.Stump: return (5, 3);
                case PropKind.Log: return (10, 3);
                case PropKind.FenceH: return (8, 2);
                case PropKind.FenceV: return (2, 8);
                case PropKind.Post: return (2, 2);
                case PropKind.Stable: return (44, 22);
                case PropKind.Trough: return (14, 4);
                case PropKind.Hay: return (9, 5);
                case PropKind.Sign: return (3, 2);
                default: return (0, 0);
            }
        }
    }
}
