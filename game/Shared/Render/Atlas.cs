// Terra de Crinas — atlas de sprites gerados (cavalos e fonte) e utilidades de desenho de texto.
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Render
{
    /// <summary>Um quadro no atlas: retângulo, âncora (pé no chão) e assento do cavaleiro.</summary>
    public struct Frame { public int Atlas; public Rectangle Src; public Vector2 Anchor, Seat; public bool Ok; }

    public sealed class Atlas
    {
        public Texture2D[] Tex;
        readonly Dictionary<string, Frame> map = new Dictionary<string, Frame>();
        public readonly Dictionary<string, string[]> Coats = new Dictionary<string, string[]>();
        public readonly Dictionary<string, int> Frames = new Dictionary<string, int>();
        public readonly Dictionary<string, Dictionary<string, float>> Cycle = new Dictionary<string, Dictionary<string, float>>();
        readonly Dictionary<int, (int h, Dictionary<int, int> adv)> font = new Dictionary<int, (int, Dictionary<int, int>)>();
        public Texture2D Pixel, Soft, Glow;

        public static Stream Res(string name)
        {
            var s = typeof(Atlas).GetTypeInfo().Assembly.GetManifestResourceStream("Assets/" + name);
            if (s == null) throw new FileNotFoundException("Recurso embutido ausente: Assets/" + name + " (rode tools/asset-pipeline/export_assets.js)");
            return s;
        }

        public Atlas(GraphicsDevice gd)
        {
            JsonElement root; using (var s = Res("atlas.json")) root = JsonDocument.Parse(s).RootElement.Clone();
            int n = root.GetProperty("atlases").GetInt32(); Tex = new Texture2D[n];
            for (int i = 0; i < n; i++) using (var s = Res("atlas_" + i + ".png")) Tex[i] = Texture2D.FromStream(gd, s);
            foreach (var p in root.GetProperty("s").EnumerateObject())
            {
                var a = p.Value; map[p.Name] = new Frame { Atlas = a[0].GetInt32(), Src = new Rectangle(a[1].GetInt32(), a[2].GetInt32(), a[3].GetInt32(), a[4].GetInt32()), Anchor = new Vector2(a[5].GetSingle(), a[6].GetSingle()), Seat = new Vector2(a[7].GetSingle(), a[8].GetSingle()), Ok = true };
            }
            var hr = root.GetProperty("horses");
            foreach (var b in hr.GetProperty("breeds").EnumerateObject()) { var l = new List<string>(); foreach (var c in b.Value.EnumerateArray()) l.Add(c.GetString()); Coats[b.Name] = l.ToArray(); }
            foreach (var f in hr.GetProperty("frames").EnumerateObject()) Frames[f.Name] = f.Value.GetInt32();
            foreach (var b in hr.GetProperty("cyc").EnumerateObject()) { var d = new Dictionary<string, float>(); foreach (var c in b.Value.EnumerateObject()) d[c.Name] = c.Value.GetSingle(); Cycle[b.Name] = d; }
            foreach (var f in root.GetProperty("font").EnumerateObject())
            {
                var adv = new Dictionary<int, int>(); foreach (var g in f.Value.GetProperty("g").EnumerateObject()) adv[int.Parse(g.Name)] = g.Value.GetInt32();
                font[int.Parse(f.Name)] = (f.Value.GetProperty("h").GetInt32(), adv);
            }
            Pixel = new Texture2D(gd, 1, 1); Pixel.SetData(new[] { Color.White });
            Soft = Radial(gd, 64, 32, false); Glow = Radial(gd, 64, 64, true);
        }

        static Texture2D Radial(GraphicsDevice gd, int W, int H, bool white)
        {
            var px = new Color[W * H];
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
                {
                    float dx = (x + 0.5f - W / 2f) / (W / 2f), dy = (y + 0.5f - H / 2f) / (H / 2f); float a = MathHelper.Clamp(1 - (float)Math.Sqrt(dx * dx + dy * dy), 0, 1);
                    a = white ? a * a * (3 - 2 * a) : a * a; px[y * W + x] = (white ? Color.White : Color.Black) * a;
                }
            var t = new Texture2D(gd, W, H); t.SetData(px); return t;
        }

        public Frame Get(string key) => key != null && map.TryGetValue(key, out var f) ? f : default;
        public bool Has(string key) => key != null && map.ContainsKey(key);

        /// <summary>Desenha o quadro com a âncora no ponto (x, y). flip espelha no eixo vertical que passa pela âncora.</summary>
        public void Draw(SpriteBatch sb, Frame f, float x, float y, Color c, bool flip = false, float scale = 1)
        {
            if (!f.Ok) return; float ox = flip ? f.Src.Width - f.Anchor.X : f.Anchor.X;
            sb.Draw(Tex[f.Atlas], new Vector2((float)Math.Round(x - ox * scale), (float)Math.Round(y - f.Anchor.Y * scale)), f.Src, c, 0, Vector2.Zero, scale, flip ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0);
        }

        public void Shadow(SpriteBatch sb, float x, float y, float rx, float ry, float a) => sb.Draw(Soft, new Rectangle((int)(x - rx), (int)(y - ry), (int)(rx * 2), (int)(ry * 2)), Color.White * a);

        // ---------------- texto ----------------
        public int LineH(int size) => font.TryGetValue(size, out var f) ? f.h : size;
        public float TextW(string s, int size, float scale)
        {
            if (!font.TryGetValue(size, out var f)) return s.Length * size * 0.5f * scale; float w = 0;
            foreach (char ch in s) w += (f.adv.TryGetValue(ch, out var a) ? a : size / 3) * scale; return w;
        }
        /// <summary>Texto com a fonte pixelada (tamanhos 16 ou 24), com sombra opcional.</summary>
        public void Text(SpriteBatch sb, string s, float x, float y, Color c, int size, float scale, Color? shadow = null)
        {
            if (!font.TryGetValue(size, out var f)) return; float px = x; var sh = shadow ?? Color.Black * 0.55f;
            foreach (char ch in s)
            {
                int adv = f.adv.TryGetValue(ch, out var a) ? a : size / 3;
                var g = Get("t" + size + ":" + (int)ch);
                if (g.Ok)
                {
                    if (sh.A > 0) sb.Draw(Tex[g.Atlas], new Vector2((float)Math.Round(px + scale), (float)Math.Round(y + scale)), g.Src, sh, 0, Vector2.Zero, scale, SpriteEffects.None, 0);
                    sb.Draw(Tex[g.Atlas], new Vector2((float)Math.Round(px), (float)Math.Round(y)), g.Src, c, 0, Vector2.Zero, scale, SpriteEffects.None, 0);
                }
                px += adv * scale;
            }
        }
        /// <summary>Quebra o texto em linhas que caibam na largura.</summary>
        public List<string> Wrap(string s, int size, float scale, float maxW)
        {
            var lines = new List<string>(); var cur = "";
            foreach (var w in s.Split(' ')) { var t = cur.Length == 0 ? w : cur + " " + w; if (TextW(t, size, scale) > maxW && cur.Length > 0) { lines.Add(cur); cur = w; } else cur = t; }
            if (cur.Length > 0) lines.Add(cur); return lines;
        }
    }
}
