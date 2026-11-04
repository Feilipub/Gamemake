// Lida no Sertão — versão MonoGame (a mesma base do Stardew Valley).
// Fase 1 da migração: mapa completo do jogo web (exportado), terreno das duas estações, construções, plantas, cercas,
// porteiras que abrem, cochos, animais com pasto e fuga, cachorro que segue, vaqueiro com animação, relógio com dia e
// noite, HUD com a fonte do jogo, joystick e botões de toque, teclado, salvamento automático e modo de captura (--shot).
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Input.Touch;

namespace Lida
{
    public partial class LidaGame : Game
    {
        readonly GraphicsDeviceManager gdm;
        SpriteBatch sb; Sprites spr; World world; Player pl; readonly List<Animal> animals = new List<Animal>();
        readonly Dictionary<int, (string key, int w)>[] font = { new Dictionary<int, (string, int)>(), new Dictionary<int, (string, int)>() };
        Vector2 cam; float zoom = 3;
        // relógio: 1 minuto do jogo por segundo real (dia de 24 min, como no jogo web)
        double minutes = 600; int day = 1; float cash = 1500, acct = 2500; int season = 0;
        string toast = ""; float toastT;
        float saveT; readonly string[] args; int shotFrames = -1; string shotPath;
        readonly string savePath;

        public LidaGame(string[] a = null)
        {
            args = a ?? new string[0];
            gdm = new GraphicsDeviceManager(this) { PreferredBackBufferWidth = 960, PreferredBackBufferHeight = 540, SupportedOrientations = DisplayOrientation.Portrait | DisplayOrientation.LandscapeLeft | DisplayOrientation.LandscapeRight };
            IsMouseVisible = true; Window.AllowUserResizing = true; Window.Title = "Lida no Sertão";
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LidaNoSertao"); Directory.CreateDirectory(dir); savePath = Path.Combine(dir, "save.json");
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "--shot" && i + 1 < args.Length) { shotPath = args[i + 1]; shotFrames = 40; }
                if (args[i] == "--size" && i + 1 < args.Length) { var wh = args[i + 1].Split('x'); gdm.PreferredBackBufferWidth = int.Parse(wh[0]); gdm.PreferredBackBufferHeight = int.Parse(wh[1]); }
            }
        }

        protected override void LoadContent()
        {
            sb = new SpriteBatch(GraphicsDevice); spr = new Sprites(GraphicsDevice); ui = new UiArt(GraphicsDevice);
            using (var s = Sprites.Res("world.json")) world = World.Load(s);
            var r = world.Root; var st = r.GetProperty("start"); minutes = st.GetProperty("min").GetDouble(); cash = st.GetProperty("cash").GetSingle(); acct = st.GetProperty("acct").GetSingle();
            var p = r.GetProperty("player"); pl = new Player { Pos = new Vector2(p.GetProperty("x").GetSingle(), p.GetProperty("y").GetSingle()) };
            foreach (var f in p.GetProperty("frames").EnumerateObject()) { var l = new List<string>(); foreach (var k in f.Value.EnumerateArray()) l.Add(k.GetString()); pl.Frames[f.Name] = l.ToArray(); }
            foreach (var a in r.GetProperty("animals").EnumerateArray()) animals.Add(Animal.From(a));
            int fi = 0; foreach (var sz in new[] { "12", "18" }) { foreach (var g in r.GetProperty("font").GetProperty(sz).EnumerateArray()) font[fi][g[0].GetInt32()] = (g[1].GetString(), g[2].GetInt32()); fi++; }
            Load();
            // modo de captura: --shot arquivo.png [--at x,y] [--hour h]
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "--at" && i + 1 < args.Length) { var xy = args[i + 1].Split(','); pl.Pos = new Vector2(float.Parse(xy[0]) * world.TS, float.Parse(xy[1]) * world.TS); }
                if (args[i] == "--hour" && i + 1 < args.Length) minutes = float.Parse(args[i + 1]) * 60;
                if (args[i] == "--season" && i + 1 < args.Length) season = int.Parse(args[i + 1]);
                if (args[i] == "--menu" && i + 1 < args.Length) OpenMenu(int.Parse(args[i + 1]));
                if (args[i] == "--toast" && i + 1 < args.Length) Toast(args[i + 1]);
            }
            spr.LoadTerrain(GraphicsDevice, season); FxInit();
            for (int i = 0; i < args.Length; i++) if (args[i] == "--rain" && i + 1 < args.Length) { raining = args[i + 1] == "1"; rainK = raining ? 1 : 0; rainCheck = 9999; }
            cam = pl.Pos;
        }

        // ---------------- atualização ----------------
        protected override void Update(GameTime gt)
        {
            float dt = Math.Min(0.05f, (float)gt.ElapsedGameTime.TotalSeconds);
            var kb = Keyboard.GetState();
            Layout();
            UiInput(kb, out var mv, out bool run, out bool act);
            if (act && !actPrev) Interact(); actPrev = act;
            hint = menuOpen ? null : Target().hint;
            if (menuOpen && shotPath == null) { base.Update(gt); return; } // menu aberto pausa o tempo

            { var vpp = GraphicsDevice.Viewport; float vw = vpp.Width / zoom, vh = vpp.Height / zoom; FxUpdate(dt, new RectangleF(cam.X - vw / 2, cam.Y - vh / 2, vw, vh)); }
            pl.Update(world, mv, run, dt); if (!pl.Running) pl.Energy = Math.Min(100, pl.Energy + dt * 0.4f);
            foreach (var a in animals) a.Update(world, pl, dt);
            // relógio
            minutes += dt; if (minutes >= 24 * 60) { minutes -= 24 * 60; day++; Toast("Dia " + day + " — bom dia, vaqueiro!"); }
            if (toastT > 0) toastT -= dt;
            // cochos e bebedouros esvaziam devagar (cerca de um dia e meio)
            foreach (var t in world.Troughs) t.Level = Math.Max(0, t.Level - dt * t.Cap / (24 * 60 * 1.5f));
            // câmera segue o vaqueiro com suavidade e para na borda do mapa
            cam = Vector2.Lerp(cam, pl.Pos, Math.Min(1, dt * 6)); if (shotFrames >= 0) cam = pl.Pos;
            if ((saveT += dt) > 30) { saveT = 0; Save(); }
            base.Update(gt);
        }

        /// <summary>O que está ao alcance da mão: porteira, porta, cocho ou animal, e o texto da dica.</summary>
        (string kind, object obj, string hint) Target()
        {
            Gate best = null; float bd = 26;
            foreach (var g in world.Gates) foreach (var t in g.Tiles) { var c = new Vector2((t.x + 0.5f) * world.TS, (t.y + 0.5f) * world.TS); float d = Vector2.Distance(c, pl.Pos); if (d < bd) { bd = d; best = g; } }
            if (best != null) return ("gate", best, best.Locked ? "Trancada" : best.Open ? "Fechar porteira" : "Abrir porteira");
            foreach (var b in world.Buildings) { var door = new Vector2((b.Door + 0.5f) * world.TS, (b.R3 + 1.4f) * world.TS); if (Vector2.Distance(door, pl.Pos) < 24) return ("door", b, "Entrar: " + b.Name); }
            foreach (var t in world.Troughs)
            {
                var c = new Vector2(t.X + t.W * world.TS / 2f, t.Y + 8); if (Vector2.Distance(c, pl.Pos) > 24) continue;
                string pct = " (" + (int)(100 * t.Level / Math.Max(1, t.Cap)) + "%)";
                if (t.Kind == "agua") return ("trough", t, (inv.CurId == "balde" ? "Encher bebedouro" : "Bebedouro") + pct);
                return ("trough", t, (inv.CurId == "racao" ? "Pôr ração" : inv.CurId == "sal" ? "Pôr sal" : inv.CurId == "milho" ? "Pôr milho" : "Cocho") + pct);
            }
            foreach (var a in animals) if (Vector2.Distance(a.Pos, pl.Pos) < 22 && a.Own == "player" && a.Sp != "cao" || (a.Sp == "cao" && a.Own == "player" && Vector2.Distance(a.Pos, pl.Pos) < 16))
                    return ("animal", a, inv.CurId == "milho" && a.Sp != "cao" ? "Dar milho a " + a.Name : "Carinho em " + a.Name);
            return (null, null, null);
        }

        void Interact()
        {
            var (kind, obj, _) = Target();
            if (kind == "gate") { var g = (Gate)obj; if (g.Locked) Toast("Porteira trancada: essa terra ainda não é sua."); else { g.Open = !g.Open; Toast(g.Open ? "Abriu a porteira." : "Fechou a porteira."); } }
            else if (kind == "door") Toast(((Building)obj).Name + ": os interiores chegam na próxima etapa da migração.");
            else if (kind == "trough")
            {
                var t = (Trough)obj;
                if (t.Kind == "agua") { if (inv.CurId == "balde") { t.Level = t.Cap; Toast("Bebedouro cheio de água limpa."); } else Toast("Escolha o balde na barra de itens para encher o bebedouro."); }
                else if (inv.CurId == "racao" || inv.CurId == "sal" || inv.CurId == "milho") { var n = Inventory.Defs[inv.CurId].Name; inv.UseOne(); t.Level = t.Cap; Toast(n + " no cocho. O gado agradece."); }
                else Toast("Escolha ração, sal ou milho na barra de itens para encher o cocho.");
            }
            else if (kind == "animal")
            {
                var a = (Animal)obj;
                if (inv.CurId == "milho" && a.Sp != "cao") { inv.UseOne(); Toast(a.Name + " comeu o milho todinho."); }
                else Toast("Carinho em " + a.Name + ".");
            }
        }

        void Toast(string t) { toast = t; toastT = 3; }

        // ---------------- desenho ----------------
        /// <summary>Cor do mundo pela hora: amanhecer rosado, dia claro, tarde dourada, noite azul.</summary>
        Color DayTint(out float dark)
        {
            float h = (float)(minutes / 60.0) % 24; dark = 0; Color c = Color.White;
            if (h < 5 || h >= 20.5f) { dark = 1; c = new Color(70, 84, 140); }
            else if (h < 6.5f) { float k = (h - 5) / 1.5f; c = Color.Lerp(new Color(70, 84, 140), new Color(255, 196, 176), k); dark = 1 - k; }
            else if (h < 8) c = Color.Lerp(new Color(255, 196, 176), Color.White, (h - 6.5f) / 1.5f);
            else if (h < 16.5f) c = Color.White;
            else if (h < 18.5f) c = Color.Lerp(Color.White, new Color(255, 200, 140), (h - 16.5f) / 2f);
            else { float k = (h - 18.5f) / 2f; c = Color.Lerp(new Color(255, 200, 140), new Color(70, 84, 140), k); dark = k; }
            return c;
        }

        protected override void Draw(GameTime gt)
        {
            var vp = GraphicsDevice.Viewport; GraphicsDevice.Clear(new Color(20, 12, 6));
            float vw = vp.Width / zoom, vh = vp.Height / zoom, wpx = world.MW * world.TS, hpx = world.MH * world.TS;
            float cx = MathHelper.Clamp(cam.X - vw / 2, 0, Math.Max(0, wpx - vw)), cy = MathHelper.Clamp(cam.Y - vh / 2, 0, Math.Max(0, hpx - vh));
            cx = (float)Math.Round(cx * zoom) / zoom; cy = (float)Math.Round(cy * zoom) / zoom;
            var view = new RectangleF(cx, cy, vw, vh); var M = Matrix.CreateTranslation(-cx, -cy, 0) * Matrix.CreateScale(zoom);
            FxLight(M, view, vp); GraphicsDevice.Clear(new Color(20, 12, 6)); // mapa de luz primeiro (trocar de alvo apaga a tela)
            Ambient(out float dark); bool night = dark > 0.6f; var tint = Color.White;

            // chão
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp, null, null, null, M);
            sb.Draw(spr.Terrain[season], new Vector2(cx, cy), new Rectangle((int)cx, (int)cy, (int)vw + 2, (int)vh + 2), tint);
            sb.End();

            // objetos ordenados pela altura do pé (profundidade)
            var L = new List<(float y, Action draw)>();
            foreach (var p in world.Props)
            {
                if (!view.Near(p.X, p.Y, 80)) continue; var pp = p; string key = season == 1 && spr.Has(p.Sprite + "|s") ? p.Sprite + "|s" : p.Sprite;
                L.Add((p.Y, () => { if (pp.Tree) spr.Shadow(sb, pp.X + 4, pp.Y - 1, 16, 6, 0.28f); else if (pp.Shadow > 0) spr.Shadow(sb, pp.X, pp.Y, pp.Shadow, 3, 0.3f);
                    float a = pp.Tree && pl.Pos.Y < pp.Y && pl.Pos.Y > pp.Y - 58 && Math.Abs(pl.Pos.X - pp.X) < 22 ? 0.45f : 1f; if (pp.Tree) spr.DrawRot(sb, key, pp.X, pp.Y, tint * a, Sway(pp.X, pp.Y)); else spr.Draw(sb, key, pp.X, pp.Y, tint * a); }));
            }
            foreach (var b in world.Buildings)
            {
                if (!view.Near(b.X + 60, b.SortY - 60, 200)) continue; var bb = b; string key = night && spr.Has(b.Sprite + "|n") ? b.Sprite + "|n" : b.Sprite;
                L.Add((b.SortY, () => { var s = spr.Get(key); if (!s.Ok) return; sb.Draw(spr.Pixel, new Rectangle((int)(bb.R0 * world.TS - 2), (int)(bb.SortY), s.Src.Width - 4, 4), Color.Black * 0.25f); sb.Draw(spr.Atlas[s.Atlas], new Vector2(bb.X, bb.Y), s.Src, night ? Color.White : tint); }));
            }
            foreach (var f in world.Fences) { float fx = f.x * world.TS, fy = f.y * world.TS; if (!view.Near(fx, fy, 40)) continue; var k = f.k; L.Add((fy + 15, () => spr.Draw(sb, k, fx, fy, tint))); }
            foreach (var g in world.Gates) { if (!view.Near(g.X, g.Y, 60)) continue; var gg = g; L.Add((g.SortY, () => spr.Draw(sb, gg.Sprite + "|" + (gg.Open ? 1 : 0), gg.X, gg.Y, tint))); }
            foreach (var t in world.Troughs) { if (!view.Near(t.X, t.Y, 40)) continue; var tt = t; L.Add((t.Y + 15, () => spr.Draw(sb, tt.Sprite + "|" + (tt.Level > tt.Cap * 0.1f ? 1 : 0), tt.X, tt.Y, tint))); }
            foreach (var a in animals) { if (!view.Near(a.Pos.X, a.Pos.Y, 60)) continue; var aa = a; L.Add((a.Pos.Y, () => { var f = aa.Frame(); spr.Shadow(sb, aa.Pos.X, aa.Pos.Y, aa.Sp == "galinha" ? 5 : aa.Sp == "cao" ? 8 : 14, 3.5f, 0.3f); spr.Draw(sb, f.key, aa.Pos.X, aa.Pos.Y, tint, f.flip); })); }
            L.Add((pl.Pos.Y, () => { var f = pl.Frame(); spr.Shadow(sb, pl.Pos.X, pl.Pos.Y, 7, 2.5f, 0.32f); spr.Draw(sb, f.key, pl.Pos.X, pl.Pos.Y, tint, f.flip); }));
            L.Sort((p, q) => p.y.CompareTo(q.y));
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp, null, null, null, M);
            foreach (var d in L) d.draw();
            sb.End();

            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp, null, null, null, M);
            FxWorld(view, dark);
            sb.End();
            FxComposite(vp, dark);
            if (dark > 0.5f) // vaga-lumes: pontinhos que acendem e apagam por cima da noite
            {
                sb.Begin(SpriteSortMode.Deferred, BlendState.Additive, SamplerState.PointClamp, null, null, null, M);
                foreach (var m in motes) { float b = 0.5f + 0.5f * (float)Math.Sin(m.Z * 3 + m.X); sb.Draw(spr.Pixel, new Rectangle((int)m.X, (int)m.Y, 1, 1), new Color(230, 255, 140) * b); }
                sb.End();
            }
            DrawHud(vp);
            base.Draw(gt);
            if (shotFrames >= 0 && --shotFrames == 0) Shot();
        }

        // ---------------- salvar / carregar ----------------
        void Save()
        {
            if (shotPath != null) return;
            try
            {
                var o = new Dictionary<string, object> { ["v"] = 1, ["x"] = pl.Pos.X, ["y"] = pl.Pos.Y, ["min"] = minutes, ["day"] = day, ["cash"] = cash, ["acct"] = acct, ["en"] = pl.Energy };
                var gates = new List<int>(); foreach (var g in world.Gates) if (g.Open) gates.Add(g.Index); o["gates"] = gates;
                var an = new List<float[]>(); foreach (var a in animals) an.Add(new[] { a.Id, a.Pos.X, a.Pos.Y }); o["animals"] = an;
                var iv = new List<object[]>(); foreach (var sl in inv.S) iv.Add(new object[] { sl.Empty ? "" : sl.Id, sl.N }); o["inv"] = iv; o["sel"] = inv.Sel;
                File.WriteAllText(savePath, JsonSerializer.Serialize(o));
            }
            catch (Exception) { }
        }
        void Load()
        {
            if (shotPath != null || !File.Exists(savePath)) return;
            try
            {
                var r = JsonDocument.Parse(File.ReadAllText(savePath)).RootElement;
                pl.Pos = new Vector2(r.GetProperty("x").GetSingle(), r.GetProperty("y").GetSingle()); minutes = r.GetProperty("min").GetDouble(); day = r.GetProperty("day").GetInt32(); cash = r.GetProperty("cash").GetSingle(); acct = r.GetProperty("acct").GetSingle(); pl.Energy = r.GetProperty("en").GetSingle();
                var open = new HashSet<int>(); foreach (var g in r.GetProperty("gates").EnumerateArray()) open.Add(g.GetInt32()); foreach (var g in world.Gates) g.Open = open.Contains(g.Index);
                var pos = new Dictionary<int, Vector2>(); foreach (var a in r.GetProperty("animals").EnumerateArray()) pos[(int)a[0].GetSingle()] = new Vector2(a[1].GetSingle(), a[2].GetSingle()); foreach (var a in animals) if (pos.TryGetValue(a.Id, out var p)) { a.Pos = p; a.Target = p; }
                if (r.TryGetProperty("inv", out var iv)) { int i = 0; foreach (var e in iv.EnumerateArray()) { if (i >= Inventory.Size) break; var id = e[0].GetString(); inv.S[i].Id = string.IsNullOrEmpty(id) || !Inventory.Defs.ContainsKey(id) ? null : id; inv.S[i].N = inv.S[i].Id == null ? 0 : e[1].GetInt32(); i++; } inv.Sel = r.GetProperty("sel").GetInt32(); }
                Toast("Jogo carregado: dia " + day + ".");
            }
            catch (Exception) { }
        }
        protected override void OnExiting(object sender, ExitingEventArgs e) { Save(); base.OnExiting(sender, e); }

        void Shot()
        {
            var vp = GraphicsDevice.Viewport; var data = new Color[vp.Width * vp.Height]; GraphicsDevice.GetBackBufferData(data);
            using (var t = new Texture2D(GraphicsDevice, vp.Width, vp.Height)) { t.SetData(data); using (var f = File.Create(shotPath)) t.SaveAsPng(f, vp.Width, vp.Height); }
            Exit();
        }
    }

    /// <summary>Retângulo com floats (área visível do mundo).</summary>
    public struct RectangleF { public float X, Y, W, H; public RectangleF(float x, float y, float w, float h) { X = x; Y = y; W = w; H = h; } public bool Near(float px, float py, float m) => px > X - m && px < X + W + m && py > Y - m && py < Y + H + m * 1.5f; }
}
