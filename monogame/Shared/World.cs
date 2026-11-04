// Lida no Sertão (MonoGame) — o mundo: grade de ladrilhos, colisão, áreas, porteiras, cochos, construções e objetos.
// Os dados vêm de Assets/world.json, exportado do jogo web por tools/asset-pipeline/export_monogame.js.
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace Lida
{
    /// <summary>Tipos de chão (mesmos números do jogo web).</summary>
    public static class G { public const int GRASS = 0, DIRT = 1, WATER = 2, SAND = 3, PAVE = 4, WALK = 5, PLAZA = 6, DRY = 7, MUD = 8, FLOOR = 9, BRIDGE = 10, PAST = 11; }

    public class Area { public string Key, Name, Kind, Own; public int X0, Y0, X1, Y1; }
    public class Gate { public int Index; public string Sprite, Area; public float X, Y, SortY; public bool Horizontal, Open, Locked; public List<(int x, int y)> Tiles = new List<(int, int)>(); }
    public class Trough { public string Sprite, Kind, Area; public float X, Y; public int W; public float Cap, Level; }
    public class Building { public string Sprite, Id, Name, Act; public float X, Y, SortY; public int R0, R1, R2, R3; public float Door; }
    public class Prop { public string Sprite, Type; public float X, Y; public bool Tree; public float Shadow; }

    /// <summary>O mapa do jogo e as regras de colisão.</summary>
    public class World
    {
        public int TS, MW, MH;
        public byte[] Ground, Obj, AreaId;
        public List<Area> Areas = new List<Area>();
        public List<Gate> Gates = new List<Gate>();
        public List<Trough> Troughs = new List<Trough>();
        public List<Building> Buildings = new List<Building>();
        public List<Prop> Props = new List<Prop>();
        public List<(int x, int y, string k)> Fences = new List<(int, int, string)>();
        public JsonElement Root;
        readonly Dictionary<int, Gate> gateAt = new Dictionary<int, Gate>();

        public static World Load(Stream s)
        {
            var w = new World(); var doc = JsonDocument.Parse(s); var r = doc.RootElement; w.Root = r;
            w.TS = r.GetProperty("TS").GetInt32(); w.MW = r.GetProperty("MW").GetInt32(); w.MH = r.GetProperty("MH").GetInt32();
            w.Ground = Convert.FromBase64String(r.GetProperty("ground").GetString());
            w.Obj = Convert.FromBase64String(r.GetProperty("obj").GetString());
            w.AreaId = Convert.FromBase64String(r.GetProperty("area").GetString());
            foreach (var a in r.GetProperty("areas").EnumerateArray())
            {
                var rr = a.GetProperty("r");
                w.Areas.Add(new Area { Key = a.GetProperty("k").GetString(), Name = a.GetProperty("n").GetString(), Kind = a.GetProperty("kind").GetString(), Own = a.GetProperty("own").GetString(), X0 = rr[0].GetInt32(), Y0 = rr[1].GetInt32(), X1 = rr[2].GetInt32(), Y1 = rr[3].GetInt32() });
            }
            foreach (var g in r.GetProperty("gates").EnumerateArray())
            {
                var gt = new Gate { Index = g.GetProperty("i").GetInt32(), Sprite = g.GetProperty("k").GetString(), X = g.GetProperty("x").GetSingle(), Y = g.GetProperty("y").GetSingle(), SortY = g.GetProperty("sy").GetSingle(), Horizontal = g.GetProperty("h").GetInt32() == 1, Area = g.GetProperty("a").GetString(), Locked = g.GetProperty("lock").GetInt32() == 1 };
                foreach (var t in g.GetProperty("t").EnumerateArray()) { var tile = (t[0].GetInt32(), t[1].GetInt32()); gt.Tiles.Add(tile); w.gateAt[tile.Item2 * w.MW + tile.Item1] = gt; }
                w.Gates.Add(gt);
            }
            foreach (var t in r.GetProperty("troughs").EnumerateArray())
                w.Troughs.Add(new Trough { Sprite = t.GetProperty("k").GetString(), X = t.GetProperty("x").GetSingle(), Y = t.GetProperty("y").GetSingle(), W = t.GetProperty("w").GetInt32(), Kind = t.GetProperty("kind").GetString(), Area = t.GetProperty("a").GetString(), Cap = t.GetProperty("cap").GetSingle(), Level = t.GetProperty("cap").GetSingle() });
            foreach (var b in r.GetProperty("buildings").EnumerateArray())
            {
                var rr = b.GetProperty("r");
                w.Buildings.Add(new Building { Sprite = b.GetProperty("k").GetString(), Id = b.GetProperty("id").GetString(), Name = b.GetProperty("n").GetString(), Act = b.GetProperty("act").GetString(), X = b.GetProperty("x").GetSingle(), Y = b.GetProperty("y").GetSingle(), SortY = b.GetProperty("sy").GetSingle(), R0 = rr[0].GetInt32(), R1 = rr[1].GetInt32(), R2 = rr[2].GetInt32(), R3 = rr[3].GetInt32(), Door = b.GetProperty("door").GetSingle() });
            }
            foreach (var p in r.GetProperty("props").EnumerateArray())
                w.Props.Add(new Prop { Sprite = p.GetProperty("k").GetString(), Type = p.GetProperty("t").GetString(), X = p.GetProperty("x").GetSingle(), Y = p.GetProperty("y").GetSingle(), Tree = p.GetProperty("tree").GetInt32() == 1, Shadow = p.GetProperty("sh").GetSingle() });
            foreach (var f in r.GetProperty("fences").EnumerateArray()) w.Fences.Add((f[0].GetInt32(), f[1].GetInt32(), f[2].GetString()));
            return w;
        }

        public int Gi(int x, int y) => y * MW + x;
        public int GroundAt(int tx, int ty) => tx < 0 || ty < 0 || tx >= MW || ty >= MH ? -1 : Ground[Gi(tx, ty)];
        public Gate GateAt(int tx, int ty) => gateAt.TryGetValue(ty * MW + tx, out var g) ? g : null;
        public Area AreaAt(float x, float y) { int tx = (int)(x / TS), ty = (int)(y / TS); if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return null; int a = AreaId[Gi(tx, ty)]; return a == 255 || a >= Areas.Count ? null : Areas[a]; }

        /// <summary>Ladrilho bloqueia passagem? Cercas (1), objetos sólidos (3), água funda e porteiras fechadas.</summary>
        public bool Solid(int tx, int ty, bool animal)
        {
            if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
            int i = Gi(tx, ty), o = Obj[i];
            if (o == 2) { var g = GateAt(tx, ty); return g == null || !g.Open; }
            if (o == 1 || o == 3) return true;
            return Ground[i] == G.WATER && !animal;
        }

        /// <summary>Caixa (x0,y0,x1,y1) em pixels do mundo encosta em algo sólido?</summary>
        public bool BoxHit(float x0, float y0, float x1, float y1, bool animal)
        {
            int a = (int)Math.Floor(x0 / TS), b = (int)Math.Floor(x1 / TS), c = (int)Math.Floor(y0 / TS), d = (int)Math.Floor(y1 / TS);
            for (int ty = c; ty <= d; ty++) for (int tx = a; tx <= b; tx++) if (Solid(tx, ty, animal)) return true;
            return false;
        }
    }
}
