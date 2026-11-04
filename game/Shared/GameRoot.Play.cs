// Terra de Crinas — o jogo em si: andar a pé, montar e desmontar, andaduras, interações com o cavalo,
// câmera de exploração e desenho do mundo em profundidade (2.5D: ordenado pelo pé, com sombras e luz).
using System;
using System.Collections.Generic;
using Crinas.Core;
using Crinas.Horses;
using Crinas.Player;
using Crinas.Render;
using Crinas.World;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace Crinas
{
    public partial class GameRoot
    {
        const float WalkSpeed = 58, RunSpeed = 96;

        void UpdatePlay(float dt)
        {
            if (inp.Hit(Keys.Escape)) { if (sheetOpen) sheetOpen = false; else pauseOpen = !pauseOpen; }
            if (inp.Hit(Keys.Tab) || inp.Hit(Keys.H)) { sheetOpen = !sheetOpen; sheetHorse = null; }
            if (pauseOpen) { UpdatePause(); return; }
            if (sheetOpen) { if (inp.Tap(rClose) || inp.Tap(new Rectangle(0, 0, 1, 1))) sheetOpen = false; return; }
            if (inp.Tap(rMenuBtn)) { pauseOpen = true; return; }
            if (inp.Tap(rSheetBtn)) { sheetOpen = true; sheetHorse = null; return; }

            minutes += dt; if (minutes >= 24 * 60) { minutes -= 24 * 60; day++; Toast("Dia " + day + ". Bom dia!"); }
            Lighting.Ambient(Hour, out float dark); wq.NightValue = dark;
            petCd -= dt;

            // entrada de movimento: teclado + joystick
            var mv = Vector2.Zero;
            if (inp.Key(Keys.A) || inp.Key(Keys.Left)) mv.X -= 1; if (inp.Key(Keys.D) || inp.Key(Keys.Right)) mv.X += 1;
            if (inp.Key(Keys.W) || inp.Key(Keys.Up)) mv.Y -= 1; if (inp.Key(Keys.S) || inp.Key(Keys.Down)) mv.Y += 1;
            bool kbMove = mv != Vector2.Zero; if (kbMove) mv.Normalize();
            bool bRun = inp.Hold(rRun), bSprint = ride != null && inp.Hold(rSprint), bBack = ride != null && inp.Hold(rBack);
            bool act = inp.Hit(Keys.E) || inp.Hit(Keys.Enter) || inp.Tap(rAct);
            bool pet = inp.Hit(Keys.F) || (ride == null && NearOwned(30) != null && inp.Tap(rPet));
            bool call = inp.Hit(Keys.Q) || (ride == null && inp.Tap(rCall));
            var joy = inp.Joystick(GraphicsDevice.Viewport.Width); if (!kbMove) mv = joy;

            if (act) Interact();
            if (pet) Pet();
            if (call) Call();

            if (ride != null) UpdateRide(dt, mv, kbMove, inp.Key(Keys.LeftShift) || inp.Key(Keys.RightShift) || bRun, inp.Key(Keys.Space) || bSprint, inp.Key(Keys.R) || bBack, inp.Key(Keys.LeftControl) || inp.Key(Keys.RightControl), dark);
            else UpdateFoot(dt, mv, inp.Key(Keys.LeftShift) || inp.Key(Keys.RightShift) || bRun);

            foreach (var m in horses.Update(wq, pos.X, pos.Y, ride?.Id, dt)) Toast(m);
            for (int i = hearts.Count - 1; i >= 0; i--) { var hp = hearts[i]; hp.t -= dt; hp.p.Y -= dt * 14; hearts[i] = hp; if (hp.t <= 0) hearts.RemoveAt(i); }

            // câmera: segue com folga para a frente quando a cavalo
            var aim = pos; if (ride != null) { aim += new Vector2((float)Math.Cos(rideCtl.Heading), (float)Math.Sin(rideCtl.Heading)) * rideCtl.Speed * 0.35f; }
            cam = Vector2.Lerp(cam, aim, Math.Min(1, dt * 4)); if (shotFrames >= 0) cam = aim;
            world.Update(cam.X, cam.Y);
            if ((saveT += dt) > 60) { saveT = 0; Save(); }
        }

        void UpdateFoot(float dt, Vector2 mv, bool run)
        {
            moving = mv.LengthSquared() > 0.02f; running = run && moving;
            if (!moving) return;
            if (mv.Length() > 1) mv.Normalize();
            if (Math.Abs(mv.X) > Math.Abs(mv.Y)) pdir = mv.X < 0 ? 2 : 3; else pdir = mv.Y < 0 ? 1 : 0;
            var d = mv * (running ? RunSpeed : WalkSpeed) * dt;
            if (!FootBlocked(pos.X + d.X, pos.Y)) pos.X += d.X;
            if (!FootBlocked(pos.X, pos.Y + d.Y)) pos.Y += d.Y;
            walkDist += d.Length();
        }
        bool FootBlocked(float x, float y) => world.Blocked(x - 4, y, true) || world.Blocked(x + 4, y, true) || world.Blocked(x, y - 3, true);
        bool HorseBlocked(float x, float y) => world.Blocked(x, y, false) || world.Blocked(x - 7, y, false) || world.Blocked(x + 7, y, false);

        void UpdateRide(float dt, Vector2 mv, bool kb, bool gallop, bool sprint, bool back, bool walkKey, float dark)
        {
            var h = ride; var v = horses.Vis[h.Id];
            if (shotGallop) { mv = new Vector2(1, 0.15f); gallop = true; }
            float mag = mv.Length(); Gait want;
            if (back) want = Gait.Back;
            else if (mag < 0.12f) want = Gait.Stop;
            else if (sprint) want = Gait.Sprint;
            else if (gallop) want = Gait.Gallop;
            else if (walkKey || (!kb && mag < 0.55f)) want = Gait.Walk;
            else want = Gait.Trot;
            float dir = mag >= 0.12f ? (float)Math.Atan2(mv.Y, mv.X) : float.NaN;
            // ambiente: noite, mata e beira d'água assustam mais
            byte t = world.TileAt((int)(h.X / 16), (int)(h.Y / 16)); float env = 1 + 0.8f * dark + (t == Tile.Forest ? 0.5f : 0) + (t == Tile.Water ? 0.3f : 0);
            var ev = rideCtl.Step(h, want, dir, dt, env);
            if (ev != RideEvent.None) { var m = RideController.Message(ev, h); if (m != null) Toast(m, 2.5f); }
            bool backing = rideCtl.Current == Gait.Back;
            float sp = rideCtl.Speed * (t == Tile.Water ? 0.6f : 1f) * (backing ? -1 : 1);
            var d = new Vector2((float)Math.Cos(rideCtl.Heading), (float)Math.Sin(rideCtl.Heading)) * sp * dt;
            if (!HorseBlocked(h.X + d.X, h.Y)) h.X += d.X; else rideCtl.Speed *= 0.5f;
            if (!HorseBlocked(h.X, h.Y + d.Y)) h.Y += d.Y; else rideCtl.Speed *= 0.5f;
            pos = new Vector2(h.X, h.Y);
            v.FX = (float)Math.Cos(rideCtl.Heading); v.FY = (float)Math.Sin(rideCtl.Heading); v.Dist += Math.Abs(sp) * dt; v.Back = backing;
            string anim = rideCtl.Lock > 0 && rideCtl.LockKind == RideEvent.Reared ? "rear" : rideCtl.Lock > 0 && rideCtl.LockKind == RideEvent.Spooked ? "scared"
                : rideCtl.Current == Gait.Stop ? "idle" : rideCtl.Current == Gait.Walk || backing ? "walk" : rideCtl.Current == Gait.Trot ? "trot" : "gallop";
            HorseManager.SetAnim(v, anim, dt);
            // vínculo cresce devagar nos passeios (mais rápido nos carinhosos)
            if (rideCtl.Speed > 5) h.Bond = Math.Min(100, h.Bond + dt * 0.03f * (0.6f + h.Behavior.Affection));
        }

        Horse NearOwned(float r) { foreach (var h in horses.Horses) if (h.Owned && h != ride && Vector2.Distance(new Vector2(h.X, h.Y), pos) < r) return h; return null; }
        Horse NearAny(float r) { Horse best = null; float bd = r; foreach (var h in horses.Horses) { if (h == ride) continue; float d = Vector2.Distance(new Vector2(h.X, h.Y), pos); if (d < bd) { bd = d; best = h; } } return best; }

        void Mount(Horse h)
        {
            ride = h; rideCtl = new RideController(new Rng(rng.NextU64())); var v = horses.Vis[h.Id];
            rideCtl.Heading = (float)Math.Atan2(v.FY, v.FX == 0 && v.FY == 0 ? 1 : v.FX); pos = new Vector2(h.X, h.Y);
            var ai = horses.AI[h.Id]; ai.State = AIState.Idle; ai.T = 2;
            if (!h.Saddled) { h.Saddled = true; }
            Toast("Montou em " + h.Name + ". Joystick: passo/trote · Galope · Disparada · Ré.", 4);
        }
        void Dismount()
        {
            var h = ride; ride = null; var v = horses.Vis[h.Id]; HorseManager.SetAnim(v, "idle", 0);
            // desce pelo lado esquerdo (ou direito, se bloqueado)
            var side = new Vector2(-v.FY, v.FX) * 16; var p = pos + side; if (FootBlocked(p.X, p.Y)) p = pos - side; if (FootBlocked(p.X, p.Y)) p = pos + new Vector2(0, 14);
            pos = p; var ai = horses.AI[h.Id]; ai.State = AIState.Idle; ai.T = 3; ai.HomeX = h.X; ai.HomeY = h.Y; ai.HomeR = 60;
            Toast("Desceu de " + h.Name + ".", 2);
        }

        void Interact()
        {
            if (ride != null) { if (rideCtl.Speed < 40) Dismount(); else Toast("Diminua o ritmo para descer.", 2); return; }
            var own = NearOwned(30); if (own != null) { Mount(own); return; }
            var any = NearAny(40); if (any != null && !any.Tamed) { Toast(any.Name + " é selvagem e desconfiado. A aproximação e a domesticação chegam na Fase 2.", 4); return; }
            Toast("Não há nada para fazer aqui.", 1.5f);
        }

        void Pet()
        {
            var h = NearOwned(30); if (h == null || petCd > 0) return; petCd = 2.5f;
            var b = h.Behavior; float gain = 1.5f * (0.6f + b.Affection); h.Bond = Math.Min(100, h.Bond + gain); h.Trust = Math.Min(100, h.Trust + gain * 0.6f);
            var ai = horses.AI[h.Id]; ai.State = AIState.Neigh; ai.T = 1.2f; hearts.Add((new Vector2(h.X, h.Y - 40), 1.4f));
            Toast(h.Name + (h.Traits.Contains(Trait.Carinhoso) ? " encostou a cabeça em você. " : " gostou do carinho. ") + "Vínculo " + (int)h.Bond + ".", 2.5f);
        }

        void Call()
        {
            var h = Owned; if (h == null) return; if (ride == h) return;
            float d = Vector2.Distance(new Vector2(h.X, h.Y), pos); if (d > 900) { Toast(h.Name + " está longe demais para ouvir o assobio.", 2.5f); return; }
            horses.AI[h.Id].Called = true; Toast("Você assobiou para " + h.Name + ".", 1.5f);
        }

        /// <summary>Texto da ação de contexto (balão sobre o botão).</summary>
        string Hint()
        {
            if (ride != null) return rideCtl.Speed < 40 ? "Descer" : null;
            var own = NearOwned(30); if (own != null) return "Montar " + own.Name;
            var any = NearAny(40); if (any != null && !any.Tamed) return "Selvagem";
            return null;
        }

        // ---------------- desenho do mundo ----------------
        void DrawWorld(Viewport vp, float hour)
        {
            float vw = vp.Width / (float)zoom, vh = vp.Height / (float)zoom, wpx = WorldGen.W * WorldGen.TS, hpx = WorldGen.H * WorldGen.TS;
            float cx = MathHelper.Clamp(cam.X - vw / 2, 0, wpx - vw), cy = MathHelper.Clamp(cam.Y - vh / 2, 0, hpx - vh);
            cx = (float)Math.Round(cx * zoom) / zoom; cy = (float)Math.Round(cy * zoom) / zoom;
            var view = new RectangleF(cx, cy, vw, vh); var M = Matrix.CreateTranslation(-cx, -cy, 0) * Matrix.CreateScale(zoom);
            var amb = Lighting.Ambient(hour, out float dark);
            light.Update(1 / 60f, view, dark);
            // luzes: lampião do vaqueiro, janelas e lampião do estábulo
            var lights = new List<(Vector2, float, Color)>();
            lights.Add((pos + new Vector2(0, -10), 70, new Color(255, 196, 120)));
            var st = new Vector2((gen.RanchX0 + 4) * WorldGen.TS + 8, (gen.RanchY0 + 7) * WorldGen.TS + 15);
            lights.Add((st + new Vector2(-25, -20), 40, new Color(255, 180, 90))); lights.Add((st + new Vector2(25, -20), 40, new Color(255, 180, 90))); lights.Add((st + new Vector2(22, -36), 46, new Color(255, 210, 130)));
            light.BuildLightmap(sb, M, vp, amb, dark, lights);
            GraphicsDevice.Clear(new Color(30, 60, 90));

            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp, null, null, null, M);
            DrawGround(view);
            // flores e capim (rasteiros)
            foreach (var c in world.Chunks) foreach (var p in c.Props)
                {
                    if (p.Kind != PropKind.Flowers && p.Kind != PropKind.Tuft) continue; if (!view.Near(p.X, p.Y, 20)) continue;
                    var s = props.Get(p.Kind, p.Var); float sway = (float)Math.Sin(light.T * 2 + p.X * 0.05f) * 0.06f;
                    sb.Draw(s.Tex, new Vector2(p.X, p.Y), null, Color.White, sway, s.Anchor, 1, SpriteEffects.None, 0);
                }
            sb.End();

            // objetos em profundidade (ordenados pelo pé)
            var L = new List<(float y, Action draw)>();
            foreach (var c in world.Chunks) foreach (var p in c.Props)
                {
                    if (p.Kind == PropKind.Flowers || p.Kind == PropKind.Tuft) continue; if (!view.Near(p.X, p.Y, p.Kind == PropKind.Stable ? 120 : 70)) continue;
                    var pp = p; L.Add((p.Y, () => DrawProp(pp)));
                }
            foreach (var h in horses.Horses) { if (h == ride || !view.Near(h.X, h.Y, 60)) continue; var hh = h; L.Add((h.Y, () => DrawHorse(hh, false))); }
            if (ride != null) L.Add((ride.Y, () => DrawHorse(ride, true)));
            else if (screen == Screen.Play) L.Add((pos.Y, DrawPlayerFoot));
            L.Sort((a, b) => a.y.CompareTo(b.y));
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp, null, null, null, M);
            foreach (var d in L) d.draw();
            foreach (var (p, t) in hearts) { var i = ui.Icon["cor"]; sb.Draw(i, new Rectangle((int)p.X - 4, (int)p.Y - 4, 9, 9), Color.White * Math.Min(1, t)); }
            light.WorldOverlay(sb, view, dark, (x, y) => WorldGen.IsWater(world.TileAt(x, y)));
            sb.End();
            light.Composite(sb, vp, M, dark);
        }

        void DrawProp(Prop p)
        {
            var s = props.Get(p.Kind, p.Var);
            if (s.ShadowR > 0) at.Shadow(sb, p.X + (p.Kind <= PropKind.Pine ? 4 : 0), p.Y - 1, s.ShadowR, s.ShadowR * 0.32f + 1, 0.3f);
            bool tree = p.Kind == PropKind.Oak || p.Kind == PropKind.Pine;
            float a = 1; if (tree && pos.Y < p.Y - 2 && pos.Y > p.Y - 56 && Math.Abs(pos.X - p.X) < 20) a = 0.45f;
            float rot = tree ? (float)Math.Sin(light.T * 1.3f + p.X * 0.031f + p.Y * 0.017f) * 0.02f : 0;
            sb.Draw(s.Tex, new Vector2(p.X, p.Y), null, Color.White * a, rot, s.Anchor, 1, SpriteEffects.None, 0);
        }

        void DrawHorse(Horse h, bool ridden)
        {
            var v = horses.Vis[h.Id]; var (view, flip) = HorseManager.View(v.FX, v.FY);
            string anim = v.Anim; bool sad = h.Saddled && (anim == "idle" || anim == "walk" || anim == "trot" || anim == "gallop" || (view == "side" && (anim == "scared" || anim == "rear")));
            if (view != "side" && (anim == "drink" || anim == "doze" || anim == "lie" || anim == "rear" || anim == "neigh")) { view = "side"; flip = v.FX < 0; }
            int n = at.Frames.TryGetValue(anim, out var nn) ? nn : 4;
            float cyc = at.Cycle.TryGetValue(h.Breed, out var cd) && cd.TryGetValue(anim, out var cv) ? cv : 30;
            int f = HorseManager.FrameIndex(v, n, cyc);
            string coat = h.Coat; if (!at.Coats.TryGetValue(h.Breed, out var coats) || Array.IndexOf(coats, coat) < 0) coat = coats != null ? coats[0] : coat;
            string key = "h:" + h.Breed + "|" + coat + "|" + view + "|" + anim + "|" + f + "|" + (sad ? 1 : 0);
            var fb = at.Get(key + ":b"); var ff = at.Get(key + ":f");
            if (!fb.Ok) { key = "h:" + h.Breed + "|" + coat + "|side|idle|0|0"; fb = at.Get(key + ":b"); ff = at.Get(key + ":f"); }
            at.Shadow(sb, h.X, h.Y, view == "side" ? 17 : 9, 4, 0.32f);
            at.Draw(sb, fb, h.X, h.Y, Color.White, flip);
            if (ridden)
            {
                // cavaleiro sentado no assento do quadro (o assento acompanha o balanço do cavalo)
                var src = fb.Ok ? fb : ff; float sx = flip ? src.Src.Width - src.Seat.X : src.Seat.X;
                float rx = h.X - (flip ? src.Src.Width - src.Anchor.X : src.Anchor.X) + sx, ry = h.Y - src.Anchor.Y + src.Seat.Y;
                int col = view == "side" ? 0 : view == "front" ? 1 : 2;
                sb.Draw(charArt.Sheet, new Vector2((float)Math.Round(rx), (float)Math.Round(ry)), charArt.Src(3, col), Color.White, 0, CharacterArt.Seat, 1, flip ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0);
            }
            if (ff.Ok) at.Draw(sb, ff, h.X, h.Y, Color.White, flip);
        }

        void DrawPlayerFoot()
        {
            int row = pdir == 0 ? 0 : pdir == 1 ? 1 : 2; int fr = !moving ? 0 : 1 + (int)(walkDist / (running ? 7f : 5.5f)) % 4;
            at.Shadow(sb, pos.X, pos.Y, 7, 2.5f, 0.35f);
            sb.Draw(charArt.Sheet, new Vector2((float)Math.Round(pos.X), (float)Math.Round(pos.Y)), charArt.Src(row, fr), Color.White, 0, CharacterArt.Foot, 1, pdir == 2 ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0);
        }

        int Gnd(int x, int y, int self) { if (x < 0 || y < 0 || x >= WorldGen.W || y >= WorldGen.H) return self; return world.TileAt(x, y); }

        /// <summary>Chão em ladrilhos com bordas misturadas (o tipo de maior prioridade invade o vizinho).</summary>
        void DrawGround(RectangleF view)
        {
            int T = WorldGen.TS;
            int x0 = Math.Max(0, (int)(view.X / T) - 1), y0 = Math.Max(0, (int)(view.Y / T) - 1), x1 = Math.Min(WorldGen.W - 1, (int)((view.X + view.W) / T) + 1), y1 = Math.Min(WorldGen.H - 1, (int)((view.Y + view.H) / T) + 1);
            int wf = (int)(light.T * 1.6f);
            Span<int> nb = stackalloc int[8];
            for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++)
                {
                    int t = world.TileAt(tx, ty); var p = new Vector2(tx * T, ty * T);
                    unchecked { int hv = (int)(((uint)(tx * 73856093) ^ (uint)(ty * 19349663)) % 4); sb.Draw(terr.Atlas, p, WorldGen.IsWater((byte)t) ? terr.WaterF(t, (wf + tx + ty * 2) % 2) : terr.Base(t, hv), Color.White); }
                    nb[0] = Gnd(tx, ty - 1, t); nb[1] = Gnd(tx + 1, ty, t); nb[2] = Gnd(tx, ty + 1, t); nb[3] = Gnd(tx - 1, ty, t);
                    nb[4] = Gnd(tx + 1, ty - 1, t); nb[5] = Gnd(tx + 1, ty + 1, t); nb[6] = Gnd(tx - 1, ty + 1, t); nb[7] = Gnd(tx - 1, ty - 1, t);
                    int last = TerrainArt.Prio[t]; bool onW = WorldGen.IsWater((byte)t);
                    while (true)
                    {
                        int next = -1, np = 99;
                        for (int k = 0; k < 8; k++) { int q = TerrainArt.Prio[nb[k]]; if (q > last && q < np) { np = q; next = nb[k]; } }
                        if (next < 0) break; last = np; bool foam = onW && !WorldGen.IsWater((byte)next);
                        for (int k = 0; k < 4; k++) if (nb[k] == next) sb.Draw(terr.Atlas, p, terr.Edge(next, k, foam), Color.White);
                        for (int k = 4; k < 8; k++) if (nb[k] == next && nb[k - 4] != next && nb[(k - 3) % 4] != next) sb.Draw(terr.Atlas, p, terr.Edge(next, k, foam), Color.White);
                    }
                }
        }
    }
}
