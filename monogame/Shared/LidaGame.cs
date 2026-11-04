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
    public class LidaGame : Game
    {
        readonly GraphicsDeviceManager gdm;
        SpriteBatch sb; Sprites spr; World world; Player pl; readonly List<Animal> animals = new List<Animal>();
        readonly Dictionary<int, (string key, int w)>[] font = { new Dictionary<int, (string, int)>(), new Dictionary<int, (string, int)>() };
        Vector2 cam; float zoom = 3;
        // relógio: 1 minuto do jogo por segundo real (dia de 24 min, como no jogo web)
        double minutes = 600; int day = 1; float cash = 1500, acct = 2500; int season = 0;
        string toast = ""; float toastT;
        // toque: joystick à esquerda, botões à direita
        Vector2 joyC, joyV; int joyId = -1; bool runBtn, actBtn, actPrev; Rectangle bRun, bAct;
        float saveT; readonly string[] args; int shotFrames = -1; string shotPath;
        readonly string savePath;

        public LidaGame(string[] a = null)
        {
            args = a ?? new string[0];
            gdm = new GraphicsDeviceManager(this) { PreferredBackBufferWidth = 960, PreferredBackBufferHeight = 540, SupportedOrientations = DisplayOrientation.Portrait | DisplayOrientation.LandscapeLeft | DisplayOrientation.LandscapeRight };
            IsMouseVisible = true; Window.AllowUserResizing = true; Window.Title = "Lida no Sertão";
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LidaNoSertao"); Directory.CreateDirectory(dir); savePath = Path.Combine(dir, "save.json");
            for (int i = 0; i < args.Length; i++) if (args[i] == "--shot" && i + 1 < args.Length) { shotPath = args[i + 1]; shotFrames = 40; }
        }

        protected override void LoadContent()
        {
            sb = new SpriteBatch(GraphicsDevice); spr = new Sprites(GraphicsDevice);
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
            }
            spr.LoadTerrain(GraphicsDevice, season);
            cam = pl.Pos;
        }

        // ---------------- atualização ----------------
        protected override void Update(GameTime gt)
        {
            float dt = Math.Min(0.05f, (float)gt.ElapsedGameTime.TotalSeconds);
            var kb = Keyboard.GetState(); if (kb.IsKeyDown(Keys.Escape) && shotPath == null) { Save(); Exit(); }
            Layout();
            // entrada: teclado + joystick e botões de toque
            var mv = Vector2.Zero; if (kb.IsKeyDown(Keys.A) || kb.IsKeyDown(Keys.Left)) mv.X -= 1; if (kb.IsKeyDown(Keys.D) || kb.IsKeyDown(Keys.Right)) mv.X += 1; if (kb.IsKeyDown(Keys.W) || kb.IsKeyDown(Keys.Up)) mv.Y -= 1; if (kb.IsKeyDown(Keys.S) || kb.IsKeyDown(Keys.Down)) mv.Y += 1;
            bool run = kb.IsKeyDown(Keys.LeftShift) || kb.IsKeyDown(Keys.RightShift), act = kb.IsKeyDown(Keys.E) || kb.IsKeyDown(Keys.Space);
            runBtn = false; actBtn = false; bool joyAlive = false;
            foreach (var t in TouchPanel.GetState())
            {
                var p = t.Position; if (t.State == TouchLocationState.Released) { if (t.Id == joyId) joyId = -1; continue; }
                if (bRun.Contains(p)) { runBtn = true; continue; }
                if (bAct.Contains(p)) { actBtn = true; continue; }
                if (t.Id == joyId || (joyId < 0 && p.X < GraphicsDevice.Viewport.Width * 0.5f && p.Y > GraphicsDevice.Viewport.Height * 0.45f)) { if (joyId < 0) { joyId = t.Id; joyC = p; } joyAlive = true; var d = (p - joyC) / 60f; if (d.Length() > 1) d.Normalize(); joyV = d; }
            }
            if (!joyAlive) { joyId = -1; joyV = Vector2.Zero; }
            mv += joyV; run |= runBtn; act |= actBtn;
            if (act && !actPrev) Interact(); actPrev = act;

            pl.Update(world, mv, run, dt); if (!pl.Running) pl.Energy = Math.Min(100, pl.Energy + dt * 0.4f);
            foreach (var a in animals) a.Update(world, pl, dt);
            // relógio
            minutes += dt; if (minutes >= 24 * 60) { minutes -= 24 * 60; day++; Toast("Dia " + day + " — bom dia, vaqueiro!"); }
            if (toastT > 0) toastT -= dt;
            // câmera segue o vaqueiro com suavidade e para na borda do mapa
            cam = Vector2.Lerp(cam, pl.Pos, Math.Min(1, dt * 6)); if (shotFrames >= 0) cam = pl.Pos;
            if ((saveT += dt) > 30) { saveT = 0; Save(); }
            base.Update(gt);
        }

        void Interact()
        {
            // porteira mais perto (até 1,5 ladrilho): abre ou fecha
            Gate best = null; float bd = 26;
            foreach (var g in world.Gates) foreach (var t in g.Tiles) { var c = new Vector2((t.x + 0.5f) * world.TS, (t.y + 0.5f) * world.TS); float d = Vector2.Distance(c, pl.Pos); if (d < bd) { bd = d; best = g; } }
            if (best != null) { if (best.Locked) Toast("Porteira trancada: essa terra ainda não é sua."); else { best.Open = !best.Open; Toast(best.Open ? "Abriu a porteira." : "Fechou a porteira."); } return; }
            foreach (var b in world.Buildings) { var door = new Vector2((b.Door + 0.5f) * world.TS, (b.R3 + 1.4f) * world.TS); if (Vector2.Distance(door, pl.Pos) < 24) { Toast(b.Name + ": interiores chegam na próxima etapa da migração."); return; } }
            foreach (var a in animals) if (Vector2.Distance(a.Pos, pl.Pos) < 22 && a.Own == "player") { Toast("Carinho em " + a.Name + "."); return; }
        }

        void Toast(string t) { toast = t; toastT = 3; }

        // ---------------- desenho ----------------
        void Layout()
        {
            var vp = GraphicsDevice.Viewport; zoom = Math.Max(2, (float)Math.Round(Math.Min(vp.Width, vp.Height) / 230f));
            int bs = (int)(64 * zoom / 3f); bAct = new Rectangle(vp.Width - bs - 24, vp.Height - bs - 40, bs, bs); bRun = new Rectangle(vp.Width - bs * 2 - 40, vp.Height - bs - 28, bs, (int)(bs * 0.8f));
        }

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
            var tint = DayTint(out float dark); bool night = dark > 0.6f;

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
                    float a = pp.Tree && pl.Pos.Y < pp.Y && pl.Pos.Y > pp.Y - 58 && Math.Abs(pl.Pos.X - pp.X) < 22 ? 0.45f : 1f; spr.Draw(sb, key, pp.X, pp.Y, tint * a); }));
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

            // luz quente do lampião em volta do vaqueiro à noite
            if (dark > 0.2f)
            {
                sb.Begin(SpriteSortMode.Deferred, BlendState.Additive, SamplerState.LinearClamp, null, null, null, M);
                sb.Draw(spr.Soft, new Rectangle((int)pl.Pos.X - 46, (int)pl.Pos.Y - 46, 92, 76), new Color(255, 190, 110) * (0.55f * dark));
                sb.End();
            }
            DrawHud(vp);
            base.Draw(gt);
            if (shotFrames >= 0 && --shotFrames == 0) Shot();
        }

        // ---------------- HUD ----------------
        void Text(string s, float x, float y, Color c, int size = 0, float scale = 1)
        {
            float px = x;
            foreach (char ch in s) { if (!font[size].TryGetValue(ch, out var g)) { px += 4 * scale; continue; } var sp = spr.Get(g.key); if (sp.Ok) { sb.Draw(spr.Atlas[sp.Atlas], new Vector2((float)Math.Round(px + scale), (float)Math.Round(y + scale)), sp.Src, Color.Black * 0.6f, 0, Vector2.Zero, scale, SpriteEffects.None, 0); sb.Draw(spr.Atlas[sp.Atlas], new Vector2((float)Math.Round(px), (float)Math.Round(y)), sp.Src, c, 0, Vector2.Zero, scale, SpriteEffects.None, 0); } px += g.w * scale; }
        }
        float TextW(string s, int size, float scale) { float w = 0; foreach (char ch in s) w += (font[size].TryGetValue(ch, out var g) ? g.w : 4) * scale; return w; }
        void Panel(Rectangle r, Color fill)
        {
            sb.Draw(spr.Pixel, r, new Color(43, 22, 8)); sb.Draw(spr.Pixel, new Rectangle(r.X + 3, r.Y + 3, r.Width - 6, r.Height - 6), fill);
            sb.Draw(spr.Pixel, new Rectangle(r.X + 3, r.Y + 3, r.Width - 6, 2), Color.White * 0.25f); sb.Draw(spr.Pixel, new Rectangle(r.X + 3, r.Bottom - 5, r.Width - 6, 2), Color.Black * 0.3f);
        }
        void DrawHud(Viewport vp)
        {
            float u = Math.Max(1, zoom / 2f); sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp);
            var top = new Rectangle(8, 8, vp.Width - 16, (int)(34 * u)); Panel(top, new Color(92, 54, 26));
            int h = (int)(minutes / 60) % 24, m = (int)(minutes % 60);
            string[] wk = { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
            Text(wk[day % 7] + " · dia " + day + "   " + h.ToString("00") + ":" + m.ToString("00"), 20, 14 * u, new Color(255, 240, 200), 1, u * 0.9f);
            string money = "R$ " + cash.ToString("N0") + "  ·  Banco R$ " + acct.ToString("N0"); Text(money, vp.Width - 20 - TextW(money, 1, u * 0.9f), 14 * u, new Color(255, 224, 140), 1, u * 0.9f);
            // energia
            var eb = new Rectangle(20, (int)(46 * u), (int)(120 * u), (int)(8 * u)); sb.Draw(spr.Pixel, eb, new Color(43, 22, 8)); sb.Draw(spr.Pixel, new Rectangle(eb.X + 2, eb.Y + 2, (int)((eb.Width - 4) * pl.Energy / 100f), eb.Height - 4), new Color(240, 200, 60));
            Text("Energia", eb.Right + 8, eb.Y - 4 * u, Color.White, 0, u);
            var ar = world.AreaAt(pl.Pos.X, pl.Pos.Y); if (ar != null) Text(ar.Name, 20, 60 * u, new Color(255, 240, 200), 0, u);
            // aviso
            if (toastT > 0) { float tw = TextW(toast, 0, u) + 24; var tr = new Rectangle((int)((vp.Width - tw) / 2), (int)(80 * u), (int)tw, (int)(22 * u)); Panel(tr, new Color(60, 34, 14) * 0.95f); Text(toast, tr.X + 12, tr.Y + 5 * u, Color.White, 0, u); }
            // controles de toque
            Panel(bAct, new Color(140, 84, 36)); Text("Ação", bAct.X + (bAct.Width - TextW("Ação", 1, u)) / 2, bAct.Y + bAct.Height / 2 - 9 * u, Color.White, 1, u);
            Panel(bRun, runBtn || pl.Running ? new Color(200, 150, 60) : new Color(110, 66, 30)); Text("Correr", bRun.X + (bRun.Width - TextW("Correr", 0, u)) / 2, bRun.Y + bRun.Height / 2 - 7 * u, Color.White, 0, u);
            if (joyId >= 0) { sb.Draw(spr.Soft, new Rectangle((int)joyC.X - 70, (int)joyC.Y - 70, 140, 140), Color.White * 0.4f); sb.Draw(spr.Soft, new Rectangle((int)(joyC.X + joyV.X * 60) - 28, (int)(joyC.Y + joyV.Y * 60) - 28, 56, 56), new Color(255, 220, 140) * 0.9f); }
            Text("MonoGame · fase 1 da migração", 20, vp.Height - 22 * u, Color.White * 0.55f, 0, u * 0.85f);
            sb.End();
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
