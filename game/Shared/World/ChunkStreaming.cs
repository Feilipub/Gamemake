// Terra de Crinas — mundo contínuo em pedaços (chunks) de 32×32 ladrilhos, gerados em segundo plano conforme o
// jogador anda e descartados quando ficam longe. O jogador nunca vê tela de carregamento: o anel de pedaços em volta
// da câmera é maior que a tela, e uma consulta de colisão num pedaço ainda não carregado gera ele na hora.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Crinas.World
{
    public sealed class Chunk
    {
        public const int CS = 32;
        public readonly int CX, CY;
        public readonly byte[] Tiles = new byte[CS * CS];
        public readonly bool[] Solid = new bool[CS * CS];
        public readonly List<Prop> Props = new List<Prop>();
        public Chunk(int cx, int cy) { CX = cx; CY = cy; }

        public static Chunk Build(WorldGen g, int cx, int cy, List<Prop> fixedProps)
        {
            var c = new Chunk(cx, cy); int bx = cx * CS, by = cy * CS;
            for (int y = 0; y < CS; y++) for (int x = 0; x < CS; x++)
                {
                    byte t = g.TileAt(bx + x, by + y); c.Tiles[y * CS + x] = t;
                    if (t == Tile.Deep) c.Solid[y * CS + x] = true; // água funda: ninguém atravessa; rasa: cavalo passa
                    g.PropsAt(bx + x, by + y, c.Props);
                }
            // objetos fixos (rancho) que caem neste pedaço
            float x0 = bx * WorldGen.TS, y0 = by * WorldGen.TS, x1 = x0 + CS * WorldGen.TS, y1 = y0 + CS * WorldGen.TS;
            foreach (var p in fixedProps) if (p.X >= x0 && p.X < x1 && p.Y >= y0 && p.Y < y1) c.Props.Add(p);
            c.Props.Sort((a, b) => a.Y.CompareTo(b.Y));
            return c;
        }
    }

    /// <summary>Carrega e descarrega pedaços em volta da câmera, sem travar o jogo.</summary>
    public sealed class ChunkStreamingManager
    {
        public readonly WorldGen Gen;
        readonly Dictionary<long, Chunk> loaded = new Dictionary<long, Chunk>();
        readonly ConcurrentQueue<Chunk> ready = new ConcurrentQueue<Chunk>();
        readonly HashSet<long> pending = new HashSet<long>();
        readonly List<Prop> fixedProps;
        readonly List<(float x0, float y0, float x1, float y1)> fixedBoxes = new List<(float, float, float, float)>();
        public int Radius = 2;     // pedaços em volta do pedaço da câmera
        public bool Async = true;  // nos testes e na captura de tela gera tudo na hora
        public int Loaded => loaded.Count;
        public IEnumerable<Chunk> Chunks => loaded.Values;

        public ChunkStreamingManager(WorldGen g)
        {
            Gen = g; fixedProps = g.RanchProps();
            foreach (var p in fixedProps) { var (hw, hh) = WorldGen.Footprint(p.Kind); if (hw > 0) fixedBoxes.Add((p.X - hw, p.Y - hh * 2, p.X + hw, p.Y)); }
        }

        static long Key(int cx, int cy) => ((long)cx << 32) | (uint)cy;

        /// <summary>Pede os pedaços em volta do ponto (px, py) e descarta os distantes.</summary>
        public void Update(float px, float py)
        {
            while (ready.TryDequeue(out var c)) { long k = Key(c.CX, c.CY); pending.Remove(k); loaded[k] = c; }
            int ccx = (int)Math.Floor(px / (Chunk.CS * WorldGen.TS)), ccy = (int)Math.Floor(py / (Chunk.CS * WorldGen.TS));
            for (int dy = -Radius; dy <= Radius; dy++) for (int dx = -Radius; dx <= Radius; dx++)
                {
                    int cx = ccx + dx, cy = ccy + dy; if (cx < 0 || cy < 0 || cx * Chunk.CS >= WorldGen.W || cy * Chunk.CS >= WorldGen.H) continue;
                    long k = Key(cx, cy); if (loaded.ContainsKey(k) || pending.Contains(k)) continue;
                    if (!Async) { loaded[k] = Chunk.Build(Gen, cx, cy, fixedProps); continue; }
                    pending.Add(k); int a = cx, b = cy; Task.Run(() => ready.Enqueue(Chunk.Build(Gen, a, b, fixedProps)));
                }
            if (loaded.Count > (2 * Radius + 3) * (2 * Radius + 3))
            {
                var drop = new List<long>();
                foreach (var kv in loaded) if (Math.Abs(kv.Value.CX - ccx) > Radius + 1 || Math.Abs(kv.Value.CY - ccy) > Radius + 1) drop.Add(kv.Key);
                foreach (var k in drop) loaded.Remove(k);
            }
        }

        Chunk Get(int tx, int ty)
        {
            int cx = tx >= 0 ? tx / Chunk.CS : -1, cy = ty >= 0 ? ty / Chunk.CS : -1; if (cx < 0 || cy < 0) return null;
            long k = Key(cx, cy); if (loaded.TryGetValue(k, out var c)) return c;
            c = Chunk.Build(Gen, cx, cy, fixedProps); loaded[k] = c; return c; // pedido urgente: gera agora
        }

        public byte TileAt(int tx, int ty) { if (tx < 0 || ty < 0 || tx >= WorldGen.W || ty >= WorldGen.H) return Tile.Deep; var c = Get(tx, ty); return c.Tiles[(ty % Chunk.CS) * Chunk.CS + tx % Chunk.CS]; }

        /// <summary>O ponto (pixels) está bloqueado? Água funda (e rasa para quem anda a pé), troncos, pedras, cercas e construções.</summary>
        public bool Blocked(float x, float y, bool onFoot)
        {
            int tx = (int)Math.Floor(x / WorldGen.TS), ty = (int)Math.Floor(y / WorldGen.TS);
            if (tx < 0 || ty < 0 || tx >= WorldGen.W || ty >= WorldGen.H) return true;
            var c = Get(tx, ty); int i = (ty % Chunk.CS) * Chunk.CS + tx % Chunk.CS;
            if (c.Solid[i] || (onFoot && c.Tiles[i] == Tile.Water)) return true;
            foreach (var b in fixedBoxes) if (x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) return true;
            // objetos naturais do ladrilho e dos vizinhos
            for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++)
                {
                    int nx = tx + k, ny = ty + j; if (nx < 0 || ny < 0 || nx >= WorldGen.W || ny >= WorldGen.H) continue;
                    var cc = (nx / Chunk.CS == c.CX && ny / Chunk.CS == c.CY) ? c : Get(nx, ny);
                    foreach (var p in cc.Props)
                    {
                        if (p.Kind >= PropKind.FenceH) continue; // cercas e construções já estão nas caixas fixas
                        var (hw, hh) = WorldGen.Footprint(p.Kind); if (hw == 0) continue;
                        if (Math.Abs(p.X - x) < hw && y <= p.Y + 1 && y >= p.Y - hh * 2) return true;
                    }
                }
            return false;
        }

        /// <summary>Procura a beira d'água mais próxima (ponto andável ao lado de água rasa).</summary>
        public bool FindShore(float x, float y, float radius, out float sx, out float sy)
        {
            int tx = (int)(x / WorldGen.TS), ty = (int)(y / WorldGen.TS), R = (int)(radius / WorldGen.TS); float best = float.MaxValue; sx = sy = 0;
            for (int j = -R; j <= R; j += 2) for (int i = -R; i <= R; i += 2)
                {
                    byte t = TileAt(tx + i, ty + j); if (!WorldGen.IsWater(t)) continue;
                    for (int k = 0; k < 4; k++)
                    {
                        int nx = tx + i + (k == 0 ? 1 : k == 1 ? -1 : 0), ny = ty + j + (k == 2 ? 1 : k == 3 ? -1 : 0);
                        if (WorldGen.IsWater(TileAt(nx, ny))) continue; float wx = nx * WorldGen.TS + 8, wy = ny * WorldGen.TS + 8;
                        if (Blocked(wx, wy, true)) continue; float d = (wx - x) * (wx - x) + (wy - y) * (wy - y); if (d < best) { best = d; sx = wx; sy = wy; }
                    }
                }
            return best < float.MaxValue;
        }
    }
}
