// Terra de Crinas — interface: menu inicial, criação do personagem, escolha do primeiro cavalo, HUD com joystick e
// botões redondos, balão de ação, avisos, pausa e a ficha detalhada do cavalo (identidade, 12 atributos com
// potencial, personalidade com efeitos e condição).
using System;
using System.Collections.Generic;
using Crinas.Core;
using Crinas.Horses;
using Crinas.Player;
using Crinas.Render;
using Crinas.UI;
using Crinas.World;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace Crinas
{
    public partial class GameRoot
    {
        Rectangle rMenuBtn, rSheetBtn, rAct, rRun, rSprint, rBack, rPet, rCall, rClose, rClock, rPlace, rWin;
        static readonly Color Dark = new Color(70, 36, 14), Cream = new Color(255, 244, 214), Mid = new Color(120, 70, 34);
        float TS0 => U / 2f;

        void Layout()
        {
            var vp = GraphicsDevice.Viewport; int W = vp.Width, H = vp.Height;
            zoom = Math.Max(2, (int)Math.Round(Math.Min(W, H) / 200f)); U = Math.Max(2, Math.Min(W, H) / 270); int m = 6 * U;
            rMenuBtn = new Rectangle(m, m, 26 * U, 26 * U); rSheetBtn = new Rectangle(rMenuBtn.Right + 4 * U, m, 26 * U, 26 * U);
            rPlace = new Rectangle(rSheetBtn.Right + 4 * U, m + 3 * U, 0, 20 * U);
            rClock = new Rectangle(W - m - 78 * U, m, 78 * U, 40 * U);
            int ab = 40 * U; rAct = new Rectangle(W - m - ab, H - m - ab - 2 * U, ab, ab);
            int rb = 28 * U; rRun = new Rectangle(rAct.X - rb - 5 * U, rAct.Bottom - rb, rb, rb);
            rSprint = new Rectangle(rRun.X - rb - 4 * U, rAct.Bottom - rb, rb, rb);
            rBack = new Rectangle(rAct.X + (ab - rb) / 2, rAct.Y - rb - 5 * U, rb, rb);
            rPet = rSprint; rCall = rBack;
            inp.JoyR = 32 * U; inp.JoyHome = new Vector2(m + inp.JoyR + 4 * U, H - m - inp.JoyR - 4 * U);
            int ww = Math.Min(W - 2 * m, 300 * U), wh = Math.Min(H - 2 * m, 210 * U);
            rWin = new Rectangle((W - ww) / 2, (H - wh) / 2, ww, wh); rClose = new Rectangle(rWin.Right - 13 * U, rWin.Y - 5 * U, 18 * U, 18 * U);
        }

        // ---------------- widgets ----------------
        void Draw9(Texture2D t, Rectangle r, Color? col = null)
        {
            int s = Math.Max(1, Math.Min(U, Math.Min(r.Width, r.Height) / 16)), c = 8, d = c * s; var cl = col ?? Color.White;
            int[] sx = { 0, c, 24 - c }, sw = { c, 24 - 2 * c, c }, dx = { r.X, r.X + d, r.Right - d }, dw = { d, r.Width - 2 * d, d }, dy = { r.Y, r.Y + d, r.Bottom - d }, dh = { d, r.Height - 2 * d, d };
            for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++) if (dw[i] > 0 && dh[j] > 0) sb.Draw(t, new Rectangle(dx[i], dy[j], dw[i], dh[j]), new Rectangle(sx[i], sx[j], sw[i], sw[j]), cl);
        }
        void IconAt(string id, Rectangle r, float alpha = 1)
        {
            if (id == null || !ui.Icon.TryGetValue(id, out var t)) return; int k = Math.Max(1, Math.Min(r.Width, r.Height) / 18), w = 18 * k;
            sb.Draw(t, new Rectangle(r.X + (r.Width - w) / 2, r.Y + (r.Height - w) / 2, w, w), Color.White * alpha);
        }
        void Txt(string s, float x, float y, Color c, int size = 16, float k = 0, Color? sh = null) => at.Text(sb, s, x, y, c, size, k <= 0 ? TS0 : k, sh);
        float TW(string s, int size = 16, float k = 0) => at.TextW(s, size, k <= 0 ? TS0 : k);
        void TxtC(string s, Rectangle r, Color c, int size = 16, Color? sh = null, float k = 0) { k = k <= 0 ? TS0 : k; Txt(s, r.X + (r.Width - TW(s, size, k)) / 2, r.Y + (r.Height - at.LineH(size) * k) / 2 + k, c, size, k, sh); }
        bool Button(Rectangle r, string label, string icon = null, bool hot = false)
        {
            Draw9(hot ? ui.TabOn : ui.Plank, r); var c = hot ? Dark : Cream; var sh = hot ? (Color?)Color.Transparent : null;
            if (icon != null) { IconAt(icon, new Rectangle(r.X + 6 * U, r.Y, 20 * U, r.Height)); Txt(label, r.X + 30 * U, r.Y + (r.Height - at.LineH(16) * TS0) / 2 + TS0, c, 16, 0, sh); }
            else TxtC(label, r, c, 16, sh);
            return inp.Tap(r);
        }
        void RoundBtn(Rectangle r, string icon, bool down, string label = null)
        {
            sb.Draw(down ? ui.BtnDown : ui.Btn, r, Color.White); IconAt(icon, new Rectangle(r.X + r.Width / 6, r.Y + r.Height / 8, r.Width * 2 / 3, r.Height * 2 / 3));
            if (label != null) { float k = TS0 * 0.75f; Txt(label, r.Center.X - TW(label, 16, k) / 2, r.Bottom - 2 * U, Cream, 16, k); }
        }
        void Bar(Rectangle r, float v, Color c, float pot = -1)
        {
            sb.Draw(at.Pixel, r, new Color(60, 34, 14)); var inner = new Rectangle(r.X + 1, r.Y + 1, r.Width - 2, r.Height - 2);
            sb.Draw(at.Pixel, inner, new Color(206, 170, 116)); int w = (int)(inner.Width * MathHelper.Clamp(v, 0, 1));
            sb.Draw(at.Pixel, new Rectangle(inner.X, inner.Y, w, inner.Height), c); sb.Draw(at.Pixel, new Rectangle(inner.X, inner.Y, w, Math.Max(1, inner.Height / 3)), Color.White * 0.25f);
            if (pot >= 0) { int px = inner.X + (int)(inner.Width * MathHelper.Clamp(pot, 0, 1)); sb.Draw(at.Pixel, new Rectangle(px - 1, r.Y - U, 2, r.Height + 2 * U), Dark); }
        }

        // ---------------- menu inicial ----------------
        void MenuInit()
        {
            screen = Screen.Menu; world.Async = shotPath == null;
            if (horses.Horses.Count == 0) { var hh = HerdHome; world.Update(hh.X, hh.Y); horses.SpawnWildHerd(world, hh.X, hh.Y); }
            cam = HerdHome + new Vector2(-40, 10);
        }
        float menuT;
        void UpdateMenu(float dt)
        {
            if (horses.Horses.Count == 0) MenuInit();
            menuT += dt; var hh = HerdHome; cam = hh + new Vector2(-60 + (float)Math.Sin(menuT * 0.05f) * 120, 10 + (float)Math.Cos(menuT * 0.04f) * 30);
            world.Update(cam.X, cam.Y); wq.NightValue = 0; horses.Update(wq, -9999, -9999, null, dt);
            var vp = GraphicsDevice.Viewport; int bw = 150 * U, bh = 26 * U, x = (vp.Width - bw) / 2, y = vp.Height / 2 + 6 * U;
            menuBtns.Clear(); menuBtns.Add(("novo", new Rectangle(x, y, bw, bh)));
            if (SaveManager.Exists()) menuBtns.Add(("cont", new Rectangle(x, y + (bh + 6 * U), bw, bh)));
            if (!OperatingSystem.IsAndroid()) menuBtns.Add(("sair", new Rectangle(x, y + (bh + 6 * U) * menuBtns.Count, bw, bh)));
            foreach (var (id, r) in menuBtns) if (inp.Tap(r)) MenuPick(id);
            if (inp.Hit(Keys.Enter)) MenuPick(menuBtns[0].id);
        }
        readonly List<(string id, Rectangle r)> menuBtns = new List<(string, Rectangle)>();
        void MenuPick(string id)
        {
            if (id == "novo") { screen = Screen.Create; createRow = 0; }
            else if (id == "cont") { if (!LoadGame()) Toast("Não foi possível carregar o jogo salvo."); }
            else if (id == "sair") Exit();
        }
        void DrawMenu(Viewport vp)
        {
            sb.Draw(at.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), new Color(30, 14, 4) * 0.25f);
            var tr = new Rectangle((vp.Width - 230 * U) / 2, vp.Height / 2 - 66 * U, 230 * U, 58 * U); Draw9(ui.Frame, tr);
            TxtC("Terra de Crinas", new Rectangle(tr.X, tr.Y + 6 * U, tr.Width, 30 * U), Dark, 24, new Color(230, 190, 130), U);
            TxtC("Uma aventura a cavalo em mundo aberto", new Rectangle(tr.X, tr.Y + 34 * U, tr.Width, 16 * U), Mid, 16, Color.Transparent);
            foreach (var (id, r) in menuBtns) Button(r, id == "novo" ? "Novo jogo" : id == "cont" ? "Continuar" : "Sair", id == "novo" ? "ferradura" : id == "cont" ? "salvar" : "porta");
            Txt("Fase 1 · fundação", 8 * U, vp.Height - 14 * U, Cream * 0.7f, 16, TS0 * 0.75f);
        }

        // ---------------- criação do personagem ----------------
        int createRow;
        static readonly string[] Presets = { "Ana", "Bento", "Clara", "Davi", "Elisa", "Tomás", "Luna", "Caio" };
        readonly List<(Rectangle l, Rectangle r, Rectangle row)> createRows = new List<(Rectangle, Rectangle, Rectangle)>();
        Rectangle rNext, rName;
        void UpdateCreate(float dt)
        {
            world.Update(cam.X, cam.Y); horses.Update(wq, -9999, -9999, null, dt);
            bool changed = false;
            for (int i = 0; i < createRows.Count; i++)
            {
                if (inp.Tap(createRows[i].l)) { Cycle(i, -1); changed = true; createRow = i; }
                if (inp.Tap(createRows[i].r)) { Cycle(i, 1); changed = true; createRow = i; }
            }
            if (inp.Hit(Keys.Down)) createRow = Math.Min(createRows.Count - 1, createRow + 1); if (inp.Hit(Keys.Up)) createRow = Math.Max(0, createRow - 1);
            if (inp.Hit(Keys.Left) && createRow > 0) { Cycle(createRow, -1); changed = true; }
            if (inp.Hit(Keys.Right) && createRow > 0) { Cycle(createRow, 1); changed = true; }
#if ANDROID
            if (inp.Tap(rName)) { var t = Microsoft.Xna.Framework.Input.KeyboardInput.Show("Nome", "Como você se chama?", look.Name); t.ContinueWith(r => { if (!string.IsNullOrWhiteSpace(r.Result)) look.Name = r.Result.Trim().Substring(0, Math.Min(14, r.Result.Trim().Length)); }); }
#endif
            if (changed) charArt = new CharacterArt(GraphicsDevice, look);
            if (inp.Tap(rNext) || inp.Hit(Keys.Enter)) { if (look.Name.Trim().Length == 0) look.Name = "Ana"; RollChoices(new Rng((ulong)Environment.TickCount)); screen = Screen.Choose; }
            if (inp.Hit(Keys.Escape)) { screen = Screen.Menu; }
        }
        void Cycle(int row, int d)
        {
            int Wrap(int v, int n) => ((v % n) + n) % n;
            switch (row)
            {
                case 0: { int i = Array.IndexOf(Presets, look.Name); look.Name = Presets[Wrap((i < 0 ? 0 : i) + d, Presets.Length)]; break; }
                case 1: look.Skin = Wrap(look.Skin + d, CharacterArt.Skins.Length); break;
                case 2: look.Hair = Wrap(look.Hair + d, CharacterArt.HairNames.Length); break;
                case 3: look.HairColor = Wrap(look.HairColor + d, CharacterArt.Hairs.Length); break;
                case 4: look.Outfit = Wrap(look.Outfit + d, CharacterArt.Outfits.Length); break;
                case 5: look.Hat = Wrap(look.Hat + d, CharacterArt.HatNames.Length); break;
            }
        }
        void DrawCreate(Viewport vp)
        {
            sb.Draw(at.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), Color.Black * 0.45f);
            Draw9(ui.Frame, rWin); float k = TS0;
            Txt("Crie seu personagem", rWin.X + 14 * U, rWin.Y + 10 * U, Dark, 24, k, new Color(230, 190, 130));
            // retrato grande
            var pr = new Rectangle(rWin.X + 14 * U, rWin.Y + 36 * U, 90 * U, rWin.Height - 76 * U); sb.Draw(at.Pixel, pr, new Color(232, 196, 136)); sb.Draw(at.Pixel, new Rectangle(pr.X, pr.Bottom - 22 * U, pr.Width, 22 * U), new Color(120, 170, 80));
            int sc = Math.Max(2, Math.Min(pr.Width / 22, pr.Height / 38)); int f = (int)(menuT * 6) % 4 + 1; menuT += 1 / 60f;
            sb.Draw(charArt.Sheet, new Vector2(pr.Center.X, pr.Bottom - 8 * U), charArt.Src(0, 0), Color.White, 0, CharacterArt.Foot, sc, SpriteEffects.None, 0);
            // linhas de escolha
            createRows.Clear(); string[] labels = { "Nome", "Pele", "Cabelo", "Cor do cabelo", "Roupa", "Chapéu" };
            string[] vals = { look.Name + (createRow == 0 && !OperatingSystem.IsAndroid() && (int)(menuT * 2) % 2 == 0 ? "_" : ""), CharacterArt.SkinNames[look.Skin], CharacterArt.HairNames[look.Hair], CharacterArt.HairColorNames[look.HairColor], CharacterArt.OutfitNames[look.Outfit], CharacterArt.HatNames[look.Hat] };
            int x0 = pr.Right + 12 * U, rowH = Math.Min(24 * U, (rWin.Height - 80 * U) / 6), y0 = rWin.Y + 38 * U, w = rWin.Right - 14 * U - x0;
            for (int i = 0; i < 6; i++)
            {
                var row = new Rectangle(x0, y0 + i * rowH, w, rowH - 3 * U); if (i == createRow) sb.Draw(at.Pixel, row, new Color(240, 210, 150));
                Txt(labels[i], row.X + 4 * U, row.Y + (row.Height - at.LineH(16) * k) / 2 + k, Mid, 16, k, Color.Transparent);
                var lb = new Rectangle(row.X + w / 2 - 4 * U, row.Y, 16 * U, row.Height); var rb2 = new Rectangle(row.Right - 16 * U, row.Y, 16 * U, row.Height);
                TxtC("<", lb, Dark, 16, Color.Transparent); TxtC(">", rb2, Dark, 16, Color.Transparent);
                TxtC(vals[i], new Rectangle(lb.Right, row.Y, rb2.X - lb.Right, row.Height), Dark, 16, Color.Transparent);
                createRows.Add((lb, rb2, row)); if (i == 0) rName = new Rectangle(lb.Right, row.Y, rb2.X - lb.Right, row.Height);
            }
            string tip = OperatingSystem.IsAndroid() ? "Toque no nome para digitar." : "Digite o nome; setas mudam as opções.";
            Txt(tip, x0 + 4 * U, rWin.Bottom - 34 * U, Mid, 16, k * 0.8f, Color.Transparent);
            rNext = new Rectangle(rWin.Right - 110 * U, rWin.Bottom - 32 * U, 96 * U, 22 * U); Button(rNext, "Próximo", "ferradura");
        }

        // ---------------- escolha do primeiro cavalo ----------------
        readonly Rectangle[] rCards = new Rectangle[3]; Rectangle rStart, rReroll;
        void RollChoices(Rng r)
        {
            choices = new List<Horse>(); var pool = new List<string>(); foreach (var b in HorseBreeds.All) pool.Add(b.Key);
            for (int i = 0; i < 3; i++) { int k = r.Int(0, pool.Count); choices.Add(Horse.Create(r, pool[k])); pool.RemoveAt(k); }
            choiceSel = 1; foreach (var h in choices) { horses.Vis.Remove(h.Id); horses.Vis[h.Id] = new HorseVisual(); }
        }
        void UpdateChoose(float dt)
        {
            world.Update(cam.X, cam.Y); horses.Update(wq, -9999, -9999, null, dt); menuT += dt;
            foreach (var h in choices) { var v = horses.Vis[h.Id]; HorseManager.SetAnim(v, "idle", dt); }
            for (int i = 0; i < 3; i++) if (inp.Tap(rCards[i])) choiceSel = i;
            if (inp.Hit(Keys.Left)) choiceSel = Math.Max(0, choiceSel - 1); if (inp.Hit(Keys.Right)) choiceSel = Math.Min(2, choiceSel + 1);
            if (inp.Tap(rReroll) || inp.Hit(Keys.R)) RollChoices(new Rng((ulong)Environment.TickCount));
            if (inp.Tap(rStart) || inp.Hit(Keys.Enter)) StartNewGame(choices[choiceSel]);
            if (inp.Hit(Keys.Escape)) screen = Screen.Create;
        }
        void DrawChoose(Viewport vp)
        {
            sb.Draw(at.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), Color.Black * 0.45f);
            Draw9(ui.Frame, rWin); float k = TS0;
            Txt("Escolha seu primeiro cavalo", rWin.X + 14 * U, rWin.Y + 10 * U, Dark, 24, k, new Color(230, 190, 130));
            int gap = 6 * U, cw = (rWin.Width - 28 * U - 2 * gap) / 3, ch = rWin.Height - 74 * U;
            for (int i = 0; i < 3; i++)
            {
                var h = choices[i]; var r = new Rectangle(rWin.X + 14 * U + i * (cw + gap), rWin.Y + 36 * U, cw, ch); rCards[i] = r;
                Draw9(i == choiceSel ? ui.TabOn : ui.Frame, r, i == choiceSel ? Color.White : new Color(230, 220, 200));
                if (i == choiceSel) { sb.Draw(at.Pixel, new Rectangle(r.X + 2 * U, r.Y + 2 * U, r.Width - 4 * U, 2 * U), new Color(214, 56, 40)); }
                var b = h.BreedDef; var portrait = new Rectangle(r.X + 6 * U, r.Y + 6 * U, r.Width - 12 * U, 42 * U); sb.Draw(at.Pixel, portrait, new Color(150, 196, 110)); sb.Draw(at.Pixel, new Rectangle(portrait.X, portrait.Bottom - 10 * U, portrait.Width, 10 * U), new Color(120, 170, 80));
                DrawHorseIcon(h, new Vector2(portrait.Center.X, portrait.Bottom - 4 * U), Math.Max(1, Math.Min(U, portrait.Width / 45)));
                int y = portrait.Bottom + 4 * U;
                TxtC(h.Name + (h.Sex == 'F' ? " (égua)" : " (macho)"), new Rectangle(r.X, y, r.Width, 12 * U), Dark, 16, Color.Transparent); y += 12 * U;
                string bl = b.Name + " · " + HorseBreeds.CoatName(b, h.Coat); float bk = Math.Min(k * 0.8f, (r.Width - 10 * U) / Math.Max(1, TW(bl, 16, 1)));
                TxtC(bl, new Rectangle(r.X, y, r.Width, 10 * U), Mid, 16, Color.Transparent, bk); y += 12 * U;
                // 3 melhores atributos
                var idx = new List<int>(); for (int a = 0; a < Attrs.Count; a++) if (a != (int)Attr.Temperamento) idx.Add(a); idx.Sort((p, q) => h.Attr[q].CompareTo(h.Attr[p]));
                for (int j = 0; j < 3 && y + 9 * U < r.Bottom - 20 * U; j++) { int a = idx[j]; Txt(Attrs.Name[a], r.X + 7 * U, y, Mid, 16, k * 0.7f, Color.Transparent); Bar(new Rectangle(r.X + r.Width / 2, y + 2 * U, r.Width / 2 - 8 * U, 5 * U), h.Attr[a] / 100f, new Color(110, 180, 80)); y += 9 * U; }
                y += 2 * U; string tr = ""; foreach (var t in h.Traits) tr += (tr.Length > 0 ? ", " : "") + HorsePersonality.Def(t).Name;
                foreach (var line in at.Wrap(tr, 16, k * 0.75f, r.Width - 12 * U)) { if (y > r.Bottom - 10 * U) break; TxtC(line, new Rectangle(r.X, y, r.Width, 10 * U), new Color(150, 60, 40), 16, Color.Transparent, k * 0.75f); y += 10 * U; }
            }
            rReroll = new Rectangle(rWin.X + 14 * U, rWin.Bottom - 32 * U, 110 * U, 22 * U); Button(rReroll, "Outros cavalos", "apito");
            rStart = new Rectangle(rWin.Right - 130 * U, rWin.Bottom - 32 * U, 116 * U, 22 * U); Button(rStart, "Começar", "ferradura");
        }

        /// <summary>Cavalo parado de lado, ampliado (retratos da escolha e da ficha).</summary>
        void DrawHorseIcon(Horse h, Vector2 foot, int scale)
        {
            var v = horses.Vis.TryGetValue(h.Id, out var vv) ? vv : null; int f = v != null ? HorseManager.FrameIndex(v, 4, 1) : 0; if (v != null && v.Anim != "idle") f = 0;
            string coat = h.Coat; if (at.Coats.TryGetValue(h.Breed, out var cs) && Array.IndexOf(cs, coat) < 0) coat = cs[0];
            string key = "h:" + h.Breed + "|" + coat + "|side|idle|" + f + "|0";
            var fb = at.Get(key + ":b"); var ff = at.Get(key + ":f");
            sb.Draw(at.Soft, new Rectangle((int)(foot.X - 18 * scale), (int)(foot.Y - 4 * scale), 36 * scale, 8 * scale), Color.White * 0.35f);
            at.Draw(sb, fb, foot.X, foot.Y, Color.White, false, scale); if (ff.Ok) at.Draw(sb, ff, foot.X, foot.Y, Color.White, false, scale);
        }

        // ---------------- HUD ----------------
        static string PlaceName(byte t, bool ranch) => ranch ? "Rancho" : t == Tile.Forest ? "Mata" : t == Tile.Lush ? "Campo viçoso" : t == Tile.Sand ? "Beira d'água" : WorldGen.IsWater(t) ? "Rio" : t == Tile.Dirt ? "Trilha" : "Campos do Vale";
        void DrawHud(Viewport vp)
        {
            float k = TS0;
            // relógio
            Draw9(ui.Frame, rClock); int h = (int)(Hour), mi = (int)(minutes % 60) / 10 * 10;
            TxtC("Dia " + day, new Rectangle(rClock.X, rClock.Y + 5 * U, rClock.Width, 14 * U), Dark, 16, new Color(214, 160, 96));
            IconAt(Hour < 5.5f || Hour >= 18.5f ? "lua" : "sol", new Rectangle(rClock.X + 7 * U, rClock.Y + 20 * U, 18 * U, 18 * U));
            TxtC(h.ToString("00") + ":" + mi.ToString("00"), new Rectangle(rClock.X + 12 * U, rClock.Y + 21 * U, rClock.Width - 12 * U, 16 * U), Dark, 16, new Color(214, 160, 96));
            // botões de menu e ficha, nome do lugar
            Draw9(ui.Plank, rMenuBtn); IconAt("engr", rMenuBtn); Draw9(ui.Plank, rSheetBtn); IconAt("cavalo", rSheetBtn);
            int tx = (int)(pos.X / 16), ty = (int)(pos.Y / 16); string place = PlaceName(world.TileAt(tx, ty), gen.InRanch(tx, ty));
            var rp = new Rectangle(rPlace.X, rPlace.Y, (int)TW(place) + 18 * U, rPlace.Height); Draw9(ui.Frame, rp); TxtC(place, rp, Dark, 16, Color.Transparent);
            // painel do cavalo montado (ou do seu cavalo por perto)
            var hh = ride ?? NearOwned(60);
            if (hh != null)
            {
                int pw = 150 * U, ph = 36 * U; var pr = new Rectangle((vp.Width - pw) / 2, vp.Height - ph - 6 * U, pw, ph);
                if (pr.X < inp.JoyHome.X + inp.JoyR || pr.Right > rSprint.X) pr.Y = rSprint.Y - ph - 34 * U;
                Draw9(ui.Plank, pr);
                string g = ride != null ? GaitModel.Name[(int)rideCtl.Current] : "Solto";
                Txt(hh.Name, pr.X + 8 * U, pr.Y + 5 * U, Cream, 16, k); Txt(g, pr.Right - 8 * U - TW(g), pr.Y + 5 * U, new Color(255, 214, 120), 16, k);
                Txt("Fôlego", pr.X + 8 * U, pr.Y + 20 * U, Cream, 16, k * 0.75f);
                var sc = hh.Stamina > 50 ? new Color(110, 200, 70) : hh.Stamina > 20 ? new Color(240, 200, 60) : new Color(220, 60, 40);
                Bar(new Rectangle(pr.X + 40 * U, pr.Y + 21 * U, pr.Width - 90 * U, 7 * U), hh.Stamina / 100f, sc);
                for (int i = 0; i < 5; i++) IconAt(hh.Bond >= (i + 1) * 20 - 10 ? "cor" : "cor0", new Rectangle(pr.Right - 46 * U + i * 8 * U, pr.Y + 19 * U, 9 * U, 9 * U));
            }
            // joystick e botões
            var jc = inp.JoyId >= 0 ? inp.JoyC : inp.JoyHome; int jr = (int)inp.JoyR;
            sb.Draw(ui.JoyBase, new Rectangle((int)jc.X - jr, (int)jc.Y - jr, jr * 2, jr * 2), Color.White * (inp.JoyId >= 0 ? 0.95f : 0.6f));
            int kn = 22 * U; var kp = jc + inp.JoyV * jr * 0.62f; sb.Draw(ui.JoyKnob, new Rectangle((int)kp.X - kn / 2, (int)kp.Y - kn / 2, kn, kn), Color.White);
            bool rideNow = ride != null; string actIcon = rideNow ? "descer" : NearOwned(30) != null ? "ferradura" : "mao";
            RoundBtn(rAct, actIcon, false);
            RoundBtn(rRun, rideNow ? "galope" : "bota", inp.Hold(rRun), rideNow ? "Galope" : "Correr");
            if (rideNow) { RoundBtn(rSprint, "espora", false, "Disparada"); RoundBtn(rBack, "re", false, "Ré"); }
            else { if (NearOwned(30) != null) RoundBtn(rPet, "escova", false, "Carinho"); RoundBtn(rCall, "apito", false, "Chamar"); }
            var hint = Hint();
            if (hint != null) { float tw = TW(hint); var rh = new Rectangle(rBack.X - (int)tw - 28 * U, rBack.Y + (rBack.Height - 18 * U) / 2, (int)tw + 20 * U, 18 * U); Draw9(ui.Frame, rh); TxtC(hint, rh, Dark, 16, Color.Transparent); }
        }

        void DrawToast(Viewport vp)
        {
            if (toastT <= 0 || string.IsNullOrEmpty(toast)) return; float k = TS0;
            var lines = at.Wrap(toast, 16, k, Math.Min(vp.Width - 2 * (rClock.Width + 70 * U), 300 * U)); float tw = 0; foreach (var l in lines) tw = Math.Max(tw, TW(l));
            int lh = (int)(at.LineH(16) * k) + U, th = lines.Count * lh + 14 * U; var r = new Rectangle((int)((vp.Width - tw) / 2 - 12 * U), 6 * U, (int)tw + 24 * U, th);
            float a = Math.Min(1, toastT * 3); Draw9(ui.Frame, r, Color.White * a);
            for (int i = 0; i < lines.Count; i++) Txt(lines[i], r.X + 12 * U, r.Y + 7 * U + i * lh, Dark * a, 16, k, Color.Transparent);
        }

        // ---------------- pausa ----------------
        readonly List<(string id, Rectangle r)> pauseBtns = new List<(string, Rectangle)>();
        void UpdatePause()
        {
            foreach (var (id, r) in pauseBtns) if (inp.Tap(r))
                {
                    if (id == "cont") pauseOpen = false;
                    else if (id == "ficha") { pauseOpen = false; sheetOpen = true; sheetHorse = null; }
                    else if (id == "salvar") { Save(); Toast("Jogo salvo."); pauseOpen = false; }
                    else if (id == "menu") { Save(); pauseOpen = false; BuildWorld(2026); MenuInit(); }
                    else if (id == "sair") { Save(); Exit(); }
                }
        }
        void DrawPause(Viewport vp)
        {
            sb.Draw(at.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), Color.Black * 0.5f);
            int bw = 150 * U, bh = 24 * U; var items = new List<(string, string, string)> { ("cont", "Continuar", "ferradura"), ("ficha", "Ficha do cavalo", "cavalo"), ("salvar", "Salvar o jogo", "salvar"), ("menu", "Menu principal", "mapa") };
            if (!OperatingSystem.IsAndroid()) items.Add(("sair", "Sair do jogo", "porta"));
            int h = items.Count * (bh + 6 * U) + 36 * U; var r = new Rectangle((vp.Width - bw - 30 * U) / 2, (vp.Height - h) / 2, bw + 30 * U, h);
            Draw9(ui.Frame, r); TxtC("Pausa", new Rectangle(r.X, r.Y + 6 * U, r.Width, 22 * U), Dark, 24, new Color(230, 190, 130), TS0);
            pauseBtns.Clear(); int y = r.Y + 32 * U;
            foreach (var (id, label, icon) in items) { var br = new Rectangle(r.X + 15 * U, y, bw, bh); Button(br, label, icon); pauseBtns.Add((id, br)); y += bh + 6 * U; }
        }

        // ---------------- ficha do cavalo ----------------
        void DrawSheet(Viewport vp, Horse h)
        {
            sb.Draw(at.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), Color.Black * 0.55f);
            if (h == null) { Draw9(ui.Frame, rWin); TxtC("Você ainda não tem cavalo.", rWin, Dark, 16, Color.Transparent); return; }
            var r = rWin; Draw9(ui.Frame, r); float k = TS0; var b = h.BreedDef;
            sb.Draw(ui.Close, rClose, Color.White); TxtC("x", rClose, Color.White, 16);
            Txt("Ficha de " + h.Name, r.X + 14 * U, r.Y + 10 * U, Dark, 24, k, new Color(230, 190, 130));
            // coluna da esquerda: retrato e identidade
            int lw = (int)(r.Width * 0.36f); var pr = new Rectangle(r.X + 14 * U, r.Y + 36 * U, lw, 62 * U);
            sb.Draw(at.Pixel, pr, new Color(150, 196, 110)); sb.Draw(at.Pixel, new Rectangle(pr.X, pr.Bottom - 12 * U, pr.Width, 12 * U), new Color(120, 170, 80));
            DrawHorseIcon(h, new Vector2(pr.Center.X, pr.Bottom - 7 * U), Math.Max(1, (int)Math.Min(pr.Width / 70f, pr.Height / 52f)));
            int y = pr.Bottom + 5 * U; float sk = k * 0.8f; int lh = (int)(at.LineH(16) * sk) + U;
            void Line(string label, string val) { if (y > r.Bottom - 14 * U) return; Txt(label, pr.X, y, Mid, 16, sk, Color.Transparent); float vk = Math.Min(sk, (lw - 54 * U) / Math.Max(1, TW(val, 16, 1))); Txt(val, pr.X + 52 * U, y + (sk - vk) * 6, Dark, 16, vk, Color.Transparent); y += lh; }
            Line("Raça", b.Name); Line("Pelagem", HorseBreeds.CoatName(b, h.Coat)); Line("Sexo e idade", (h.Sex == 'F' ? "Égua" : "Macho") + ", " + h.AgeYears + " anos");
            Line("Origem", b.Origin); Line("Aptidão", b.Aptitude); Line("Porte", b.Hands.ToString("0.#") + " palmos");
            y += U; Txt("Condição", pr.X, y, Dark, 16, k * 0.9f, Color.Transparent); y += lh + U;
            void Cond(string label, float v, Color c) { if (y > r.Bottom - 12 * U) return; Txt(label, pr.X, y, Mid, 16, sk, Color.Transparent); Bar(new Rectangle(pr.X + 52 * U, y + 2 * U, lw - 56 * U, 6 * U), v / 100f, c); Txt(((int)v).ToString(), pr.Right - 2 * U, y, Dark, 16, sk * 0.9f, Color.Transparent); y += lh; }
            Cond("Fôlego", h.Stamina, new Color(110, 200, 70)); Cond("Vínculo", h.Bond, new Color(226, 70, 90)); Cond("Confiança", h.Trust, new Color(90, 150, 220));
            // coluna da direita: atributos (barra = atual, risquinho = potencial de treino)
            int x0 = pr.Right + 12 * U, cw = (r.Right - 14 * U - x0 - 8 * U) / 2, ay = r.Y + 36 * U, arow = 14 * U;
            Txt("Atributos  (traço = potencial)", x0, ay - 2 * U, Dark, 16, k * 0.85f, Color.Transparent); ay += 14 * U;
            for (int i = 0; i < Attrs.Count; i++)
            {
                int col = i / 6, row = i % 6; int ax = x0 + col * (cw + 8 * U), yy = ay + row * arow;
                Txt(Attrs.Name[i], ax, yy, Mid, 16, sk, Color.Transparent); string val = ((int)h.Attr[i]).ToString(); Txt(val, ax + cw - TW(val, 16, sk), yy, Dark, 16, sk, Color.Transparent);
                var c = h.Attr[i] >= 80 ? new Color(90, 180, 70) : h.Attr[i] >= 60 ? new Color(160, 190, 70) : h.Attr[i] >= 40 ? new Color(230, 180, 60) : new Color(220, 100, 60);
                if (i == (int)Attr.Temperamento) c = new Color(220, 120, 60);
                Bar(new Rectangle(ax, yy + 8 * U, cw, 5 * U), h.Attr[i] / 100f, c, h.Potential[i] / 100f);
            }
            // personalidade: traços com efeito real
            int py = ay + 6 * arow + 6 * U; Txt("Personalidade", x0, py, Dark, 16, k * 0.9f, Color.Transparent); py += lh + U;
            foreach (var t in h.Traits)
            {
                var d = HorsePersonality.Def(t); if (py > r.Bottom - 12 * U) break;
                float nw = TW(d.Name, 16, sk) + 8 * U; var chip = new Rectangle(x0, py, (int)nw, (int)(lh)); sb.Draw(at.Pixel, chip, new Color(196, 128, 62)); Txt(d.Name, chip.X + 4 * U, chip.Y + U / 2, Cream, 16, sk);
                var lines = at.Wrap(d.Desc, 16, sk * 0.9f, r.Right - 14 * U - chip.Right - 6 * U); foreach (var l in lines) { Txt(l, chip.Right + 5 * U, py, Mid, 16, sk * 0.9f, Color.Transparent); py += lh; }
                py += U;
            }
            var bh = h.Behavior; string fx = "Obedece " + (int)(bh.Obedience * 100) + "% · sustos " + bh.SpookPerMin.ToString("0.0") + "/min · aprende " + (int)(bh.LearnRate * 100) + "%";
            if (py < r.Bottom - 12 * U) Txt(fx, x0, r.Bottom - 14 * U, new Color(130, 80, 40), 16, sk * 0.85f, Color.Transparent);
        }
    }
}
