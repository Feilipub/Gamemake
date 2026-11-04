// Lida no Sertão (MonoGame) — interface no estilo dos jogos de fazenda em pixel art:
// relógio de madeira, plaquinha do dinheiro, barra de energia, barra rápida de itens, joystick e botões redondos
// sempre visíveis, balão de dica da ação, avisos em pergaminho e menu com abas (Mochila, Animais, Mapa, Opções).
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Input.Touch;

namespace Lida
{
    public partial class LidaGame
    {
        UiArt ui; Inventory inv = Inventory.Start();
        int U = 2; // escala da interface (pixels de tela por pixel da arte)
        bool menuOpen; int tab, pick = -1; float scroll;
        Rectangle rClock, rMoney, rEnergy, rBar, rMenuBtn, rAct, rRun, rWin, rClose, rArea;
        readonly Rectangle[] rSlot = new Rectangle[Inventory.Bar], rGrid = new Rectangle[Inventory.Size], rTabs = new Rectangle[4];
        readonly List<(Rectangle r, string id, string label)> rOpt = new List<(Rectangle, string, string)>();
        Vector2 joyHome; int joyR; Vector2 joyC, joyV; int joyId = -1; bool runBtn, actBtn, actPrev;
        string hint; KeyboardState kbPrev; MouseState mPrev; float dragY = -1;
        static readonly string[] TabName = { "Mochila", "Animais", "Mapa", "Opções" }, TabIcon = { "bolsa", "pata", "mapa", "engr" };

        struct Ptr { public int Id; public Vector2 P; public bool Down, Pressed; }
        readonly List<Ptr> ptrs = new List<Ptr>();

        // ---------------- posições ----------------
        void Layout()
        {
            var vp = GraphicsDevice.Viewport; int W = vp.Width, H = vp.Height;
            zoom = Math.Max(2, (float)Math.Round(Math.Min(W, H) / 230f));
            U = Math.Max(2, Math.Min(W, H) / 270); int m = 6 * U;
            rClock = new Rectangle(W - m - 80 * U, m, 80 * U, 42 * U);
            rMoney = new Rectangle(rClock.X, rClock.Bottom + 2 * U, rClock.Width, 20 * U);
            rMenuBtn = new Rectangle(m, m, 28 * U, 28 * U);
            rArea = new Rectangle(rMenuBtn.Right + 4 * U, m + 4 * U, 0, 20 * U);
            int ab = 40 * U; rAct = new Rectangle(W - m - ab, H - m - ab - 4 * U, ab, ab);
            int rb = 28 * U; rRun = new Rectangle(rAct.X - rb - 6 * U, rAct.Bottom - rb + 2 * U, rb, rb);
            joyR = 32 * U; joyHome = new Vector2(m + joyR + 4 * U, H - m - joyR - 4 * U);
            int ss = 20 * U, bw = Inventory.Bar * (ss + U) - U + 10 * U, bx = (W - bw) / 2, by = H - ss - 14 * U;
            if (H > W || bx < joyHome.X + joyR + 4 * U || bx + bw > rRun.X - 4 * U) by = rAct.Y - ss - 44 * U;
            rBar = new Rectangle(bx, by, bw, ss + 10 * U);
            for (int i = 0; i < Inventory.Bar; i++) rSlot[i] = new Rectangle(bx + 5 * U + i * (ss + U), by + 5 * U, ss, ss);
            int eh = Math.Min(64 * U, rRun.Y - rMoney.Bottom - 24 * U); rEnergy = new Rectangle(W - m - 14 * U, rMoney.Bottom + 14 * U, 14 * U, Math.Max(24 * U, eh));
            // menu
            int ww = Math.Min(W - 2 * m, 280 * U), wh = Math.Min(H - 2 * m - 16 * U, 196 * U);
            rWin = new Rectangle((W - ww) / 2, (H - wh) / 2 + 8 * U, ww, wh);
            for (int i = 0; i < 4; i++) rTabs[i] = new Rectangle(rWin.X + 14 * U + i * 30 * U, rWin.Y - 20 * U, 28 * U, 26 * U);
            rClose = new Rectangle(rWin.Right - 14 * U, rWin.Y - 8 * U, 18 * U, 18 * U);
            int gx = rWin.X + (ww - 10 * (ss + U)) / 2, gy = rWin.Y + 30 * U;
            for (int i = 0; i < Inventory.Size; i++) rGrid[i] = new Rectangle(gx + (i % 10) * (ss + U), gy + (i / 10) * (ss + U) + (i >= 10 ? 4 * U : 0), ss, ss);
            rOpt.Clear(); int ow = Math.Min(ww - 40 * U, 160 * U), oy = rWin.Y + 52 * U;
            foreach (var (id, label) in new[] { ("salvar", "Salvar o jogo"), ("tela", "Tela cheia"), ("porta", "Sair do jogo") })
            {
                if (id == "tela" && OperatingSystem.IsAndroid()) continue;
                rOpt.Add((new Rectangle(rWin.X + (ww - ow) / 2, oy, ow, 28 * U), id, label)); oy += 34 * U;
            }
        }

        // ---------------- entrada (toque, mouse e teclado) ----------------
        void ReadPointers()
        {
            ptrs.Clear();
            foreach (var t in TouchPanel.GetState())
                if (t.State != TouchLocationState.Released && t.State != TouchLocationState.Invalid) ptrs.Add(new Ptr { Id = t.Id, P = t.Position, Down = true, Pressed = t.State == TouchLocationState.Pressed });
            if (!OperatingSystem.IsAndroid())
            {
                var ms = Mouse.GetState(); bool d = ms.LeftButton == ButtonState.Pressed;
                if (d) ptrs.Add(new Ptr { Id = -100, P = new Vector2(ms.X, ms.Y), Down = true, Pressed = mPrev.LeftButton != ButtonState.Pressed });
                int wheel = ms.ScrollWheelValue - mPrev.ScrollWheelValue;
                if (wheel != 0) { if (menuOpen) scroll = Math.Max(0, scroll - wheel / 4f); else inv.Sel = (inv.Sel + (wheel < 0 ? 1 : Inventory.Bar - 1)) % Inventory.Bar; }
                mPrev = ms;
            }
        }

        bool KeyHit(KeyboardState kb, Keys k) => kb.IsKeyDown(k) && !kbPrev.IsKeyDown(k);

        /// <summary>Lê toda a entrada do quadro. Devolve o movimento e os botões do vaqueiro.</summary>
        void UiInput(KeyboardState kb, out Vector2 mv, out bool run, out bool act)
        {
            ReadPointers(); mv = Vector2.Zero; run = false; act = false;
            if (KeyHit(kb, Keys.Escape) || KeyHit(kb, Keys.I) || KeyHit(kb, Keys.Tab)) { if (menuOpen) CloseMenu(); else OpenMenu(0); }
            if (KeyHit(kb, Keys.M)) { if (menuOpen && tab == 2) CloseMenu(); else OpenMenu(2); }
            for (int i = 0; i < 10; i++) if (KeyHit(kb, Keys.D1 + i) || (i == 9 && KeyHit(kb, Keys.D0))) inv.Sel = i == 9 && KeyHit(kb, Keys.D0) ? 9 : i;
            if (menuOpen) { MenuInput(kb); kbPrev = kb; joyId = -1; joyV = Vector2.Zero; runBtn = actBtn = false; return; }

            if (kb.IsKeyDown(Keys.A) || kb.IsKeyDown(Keys.Left)) mv.X -= 1; if (kb.IsKeyDown(Keys.D) || kb.IsKeyDown(Keys.Right)) mv.X += 1;
            if (kb.IsKeyDown(Keys.W) || kb.IsKeyDown(Keys.Up)) mv.Y -= 1; if (kb.IsKeyDown(Keys.S) || kb.IsKeyDown(Keys.Down)) mv.Y += 1;
            run = kb.IsKeyDown(Keys.LeftShift) || kb.IsKeyDown(Keys.RightShift); act = kb.IsKeyDown(Keys.E) || kb.IsKeyDown(Keys.Space) || kb.IsKeyDown(Keys.Enter);

            runBtn = actBtn = false; bool joyAlive = false; var vp = GraphicsDevice.Viewport;
            foreach (var p in ptrs)
            {
                if (p.Id == joyId) { joyAlive = true; var d = (p.P - joyC) / (joyR * 0.8f); if (d.Length() > 1) d.Normalize(); joyV = d; continue; }
                if (rRun.Contains(p.P)) { runBtn = true; continue; }
                if (rAct.Contains(p.P)) { actBtn = true; continue; }
                if (!p.Pressed) continue;
                if (rMenuBtn.Contains(p.P) || rMoney.Contains(p.P) || rClock.Contains(p.P)) { OpenMenu(rClock.Contains(p.P) ? 2 : 0); return; }
                bool onBar = false; for (int i = 0; i < Inventory.Bar; i++) if (rSlot[i].Contains(p.P)) { inv.Sel = i; onBar = true; }
                if (onBar) continue;
                // joystick: começa onde o dedo encostar na metade esquerda (ou perto da base)
                if (joyId < 0 && (p.P.X < vp.Width * 0.45f || Vector2.Distance(p.P, joyHome) < joyR * 1.4f)) { joyId = p.Id; joyC = Vector2.Distance(p.P, joyHome) < joyR * 1.4f ? joyHome : p.P; joyAlive = true; var d = (p.P - joyC) / (joyR * 0.8f); if (d.Length() > 1) d.Normalize(); joyV = d; }
            }
            if (!joyAlive) { joyId = -1; joyV = Vector2.Zero; }
            mv += joyV; run |= runBtn; act |= actBtn; kbPrev = kb;
        }

        void OpenMenu(int t) { menuOpen = true; tab = t; pick = -1; scroll = 0; }
        void CloseMenu() { menuOpen = false; pick = -1; }

        void MenuInput(KeyboardState kb)
        {
            if (KeyHit(kb, Keys.Q)) tab = (tab + 3) % 4; if (KeyHit(kb, Keys.R)) tab = (tab + 1) % 4;
            bool down = false;
            foreach (var p in ptrs)
            {
                down = true;
                if (tab == 1 && !p.Pressed && dragY >= 0) { scroll = Math.Max(0, scroll - (p.P.Y - dragY)); dragY = p.P.Y; }
                if (!p.Pressed) continue; dragY = p.P.Y;
                if (rClose.Contains(p.P)) { CloseMenu(); return; }
                for (int i = 0; i < 4; i++) if (rTabs[i].Contains(p.P)) { tab = i; pick = -1; scroll = 0; return; }
                if (!rWin.Contains(p.P)) { CloseMenu(); return; }
                if (tab == 0) for (int i = 0; i < Inventory.Size; i++) if (rGrid[i].Contains(p.P))
                        {
                            if (pick >= 0 && pick != i) { inv.Swap(pick, i); if (i < Inventory.Bar) inv.Sel = i; pick = -1; }
                            else if (pick == i) pick = -1;
                            else { if (!inv.S[i].Empty) pick = i; if (i < Inventory.Bar) inv.Sel = i; }
                        }
                if (tab == 3) foreach (var o in rOpt) if (o.r.Contains(p.P)) OptionPressed(o.id);
            }
            if (!down) dragY = -1;
        }

        void OptionPressed(string id)
        {
            if (id == "salvar") { Save(); Toast("Jogo salvo."); CloseMenu(); }
            else if (id == "tela") { gdm.IsFullScreen = !gdm.IsFullScreen; gdm.ApplyChanges(); }
            else if (id == "porta") { Save(); Exit(); }
        }

        // ---------------- desenho ----------------
        /// <summary>Desenha uma textura 24×24 fatiada em 9 partes (cantos de 8 px) esticada no retângulo.</summary>
        void Draw9(Texture2D t, Rectangle r, Color? col = null)
        {
            int s = Math.Max(1, Math.Min(U, Math.Min(r.Width, r.Height) / 16)), c = 8, d = c * s; var cl = col ?? Color.White;
            int[] sx = { 0, c, 24 - c }, sw = { c, 24 - 2 * c, c }, dx = { r.X, r.X + d, r.Right - d }, dw = { d, r.Width - 2 * d, d }, dy = { r.Y, r.Y + d, r.Bottom - d }, dh = { d, r.Height - 2 * d, d };
            for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++) if (dw[i] > 0 && dh[j] > 0) sb.Draw(t, new Rectangle(dx[i], dy[j], dw[i], dh[j]), new Rectangle(sx[i], sx[j], sw[i], sw[j]), cl);
        }

        void IconAt(string id, Rectangle r, float alpha = 1)
        {
            if (id == null || !ui.Icon.TryGetValue(id, out var t)) return;
            int k = Math.Max(1, Math.Min(r.Width, r.Height) / 18); int w = 18 * k;
            sb.Draw(t, new Rectangle(r.X + (r.Width - w) / 2, r.Y + (r.Height - w) / 2, w, w), Color.White * alpha);
        }

        /// <summary>Texto com a fonte do jogo. size 0 = 12 px, 1 = 18 px; sombra opcional.</summary>
        void Text(string s, float x, float y, Color c, int size = 0, float scale = 1, Color? shadow = null)
        {
            float px = x; var sh = shadow ?? Color.Black * 0.6f;
            foreach (char ch in s)
            {
                if (!font[size].TryGetValue(ch, out var g)) { px += 4 * scale; continue; }
                var sp = spr.Get(g.key);
                if (sp.Ok)
                {
                    if (sh.A > 0) sb.Draw(spr.Atlas[sp.Atlas], new Vector2((float)Math.Round(px + scale), (float)Math.Round(y + scale)), sp.Src, sh, 0, Vector2.Zero, scale, SpriteEffects.None, 0);
                    sb.Draw(spr.Atlas[sp.Atlas], new Vector2((float)Math.Round(px), (float)Math.Round(y)), sp.Src, c, 0, Vector2.Zero, scale, SpriteEffects.None, 0);
                }
                px += g.w * scale;
            }
        }
        float TextW(string s, int size, float scale) { float w = 0; foreach (char ch in s) w += (font[size].TryGetValue(ch, out var g) ? g.w : 4) * scale; return w; }
        float TS0 => U / 2f; // escala do texto
        void TextC(string s, Rectangle r, Color c, int size, Color? sh = null) { float k = TS0; Text(s, r.X + (r.Width - TextW(s, size, k)) / 2, r.Y + (r.Height - (size == 1 ? 18 : 12) * k) / 2, c, size, k, sh); }

        /// <summary>Quebra o texto em linhas que caibam na largura.</summary>
        List<string> Wrap(string s, int size, float maxW)
        {
            var lines = new List<string>(); var cur = "";
            foreach (var w in s.Split(' ')) { var t = cur.Length == 0 ? w : cur + " " + w; if (TextW(t, size, TS0) > maxW && cur.Length > 0) { lines.Add(cur); cur = w; } else cur = t; }
            if (cur.Length > 0) lines.Add(cur); return lines;
        }

        static readonly Color Dark = new Color(70, 36, 14), Cream = new Color(255, 244, 214);

        void DrawHud(Viewport vp)
        {
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp);
            float k = TS0; var sh = new Color(214, 160, 96);
            // relógio
            Draw9(ui.Frame, rClock);
            int h = (int)(minutes / 60) % 24, m = (int)(minutes % 60) / 10 * 10;
            string[] wk = { "Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb." };
            TextC(wk[day % 7] + " " + day, new Rectangle(rClock.X, rClock.Y + 6 * U, rClock.Width, 14 * U), Dark, 1, sh);
            float hr = (float)(minutes / 60.0) % 24; bool nightNow = hr < 5.5f || hr >= 18.5f;
            IconAt(nightNow ? "lua" : "sol", new Rectangle(rClock.X + 8 * U, rClock.Y + 21 * U, 18 * U, 18 * U));
            IconAt(raining ? "chuva" : season == 1 ? "sol" : "nuvem", new Rectangle(rClock.Right - 26 * U, rClock.Y + 21 * U, 18 * U, 18 * U));
            TextC(h.ToString("00") + ":" + m.ToString("00"), new Rectangle(rClock.X, rClock.Y + 22 * U, rClock.Width, 16 * U), Dark, 1, sh);
            // dinheiro
            Draw9(ui.Plank, rMoney); IconAt("moeda", new Rectangle(rMoney.X + 5 * U, rMoney.Y + 1 * U, 18 * U, 18 * U));
            string money = cash.ToString("N0"); Text(money, rMoney.Right - 9 * U - TextW(money, 1, k), rMoney.Y + (rMoney.Height - 18 * k) / 2, Cream, 1, k);
            // energia (barra em pé)
            Draw9(ui.Plank, rEnergy); var inner = new Rectangle(rEnergy.X + 4 * U, rEnergy.Y + 4 * U, rEnergy.Width - 8 * U, rEnergy.Height - 8 * U);
            sb.Draw(spr.Pixel, inner, new Color(40, 20, 8)); int fh = (int)(inner.Height * pl.Energy / 100f);
            var ec = pl.Energy > 50 ? Color.Lerp(new Color(250, 210, 60), new Color(110, 200, 70), (pl.Energy - 50) / 50f) : Color.Lerp(new Color(220, 60, 40), new Color(250, 210, 60), pl.Energy / 50f);
            sb.Draw(spr.Pixel, new Rectangle(inner.X, inner.Bottom - fh, inner.Width, fh), ec); sb.Draw(spr.Pixel, new Rectangle(inner.X, inner.Bottom - fh, Math.Max(1, inner.Width / 3), fh), Color.White * 0.25f);
            TextC("E", new Rectangle(rEnergy.X - 2 * U, rEnergy.Y - 14 * U, rEnergy.Width + 4 * U, 12 * U), Cream, 0);
            // botão do menu e placa do lugar
            Draw9(ui.Plank, rMenuBtn); IconAt("bolsa", rMenuBtn);
            var ar = world.AreaAt(pl.Pos.X, pl.Pos.Y); string place = ar != null ? ar.Name : "Fazenda Lida";
            var rp = new Rectangle(rArea.X, rArea.Y, (int)(TextW(place, 0, k) + 20 * U), rArea.Height); Draw9(ui.Frame, rp); TextC(place, rp, Dark, 0, Color.Transparent);
            // barra rápida
            Draw9(ui.Plank, rBar);
            for (int i = 0; i < Inventory.Bar; i++) SlotDraw(i, rSlot[i], i == inv.Sel, i);
            var cur = inv.CurId; if (cur != null && !menuOpen) { var nm = Inventory.Defs[cur].Name; var rn = new Rectangle(rBar.X + (rBar.Width - (int)TextW(nm, 0, k) - 16 * U) / 2, rBar.Y - 15 * U, (int)TextW(nm, 0, k) + 16 * U, 14 * U); Text(nm, rn.X + 8 * U, rn.Y + 1 * U, Cream, 0, k); }
            // controles de toque (sempre visíveis)
            var jc = joyId >= 0 ? joyC : joyHome; sb.Draw(ui.JoyBase, new Rectangle((int)jc.X - joyR, (int)jc.Y - joyR, joyR * 2, joyR * 2), Color.White * (joyId >= 0 ? 0.95f : 0.7f));
            int kn = 22 * U; var kp = jc + joyV * joyR * 0.62f; sb.Draw(ui.JoyKnob, new Rectangle((int)kp.X - kn / 2, (int)kp.Y - kn / 2, kn, kn), Color.White);
            sb.Draw(actBtn ? ui.BtnDown : ui.Btn, rAct, Color.White); IconAt("mao", new Rectangle(rAct.X + 4 * U, rAct.Y + 2 * U, rAct.Width - 8 * U, rAct.Height - 10 * U));
            sb.Draw(runBtn || pl.Running ? ui.BtnDown : ui.Btn, rRun, Color.White); IconAt("bota", new Rectangle(rRun.X, rRun.Y - 1 * U, rRun.Width, rRun.Height));
            // balão de dica em cima do botão de ação
            if (!string.IsNullOrEmpty(hint) && !menuOpen)
            {
                float tw = TextW(hint, 0, k); var rh = new Rectangle((int)Math.Min(rAct.Center.X - tw / 2 - 10 * U, vp.Width - tw - 26 * U), rAct.Y - 22 * U, (int)tw + 20 * U, 18 * U);
                Draw9(ui.Frame, rh); TextC(hint, rh, Dark, 0, Color.Transparent);
            }
            // aviso
            if (toastT > 0 && !menuOpen)
            {
                var lines = Wrap(toast, 0, Math.Min(vp.Width - 60 * U, 240 * U)); float tw = 0; foreach (var l in lines) tw = Math.Max(tw, TextW(l, 0, k));
                int th = (int)(lines.Count * 13 * k) + 16 * U; var rt = new Rectangle((int)((vp.Width - tw) / 2 - 12 * U), rBar.Y - 20 * U - th, (int)tw + 24 * U, th);
                float a = Math.Min(1, toastT * 3); Draw9(ui.Frame, rt, Color.White * a);
                for (int i = 0; i < lines.Count; i++) Text(lines[i], rt.X + 12 * U, rt.Y + 8 * U + i * 13 * k, Dark * a, 0, k, Color.Transparent);
            }
            if (menuOpen) DrawMenu(vp);
            sb.End();
        }

        void SlotDraw(int i, Rectangle r, bool sel, int num = -1)
        {
            sb.Draw(sel ? ui.SlotSel : ui.Slot, r, Color.White); var s = inv.S[i];
            if (pick == i) sb.Draw(spr.Pixel, r, UiArt.Gold * 0.35f);
            if (!s.Empty)
            {
                IconAt(s.Id, new Rectangle(r.X + U, r.Y + U, r.Width - 2 * U, r.Height - 2 * U));
                if (!Inventory.Defs[s.Id].Tool) { string n = s.N.ToString(); float k = TS0; Text(n, r.Right - 2 * U - TextW(n, 0, k), r.Bottom - 13 * k, Color.White, 0, k, UiArt.Ink); }
            }
            if (num >= 0 && !menuOpen) Text(((num + 1) % 10).ToString(), r.X + 3 * U, r.Y + 2 * U, Dark * 0.7f, 0, TS0 * 0.75f, Color.Transparent);
        }

        void DrawMenu(Viewport vp)
        {
            sb.Draw(spr.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), Color.Black * 0.55f);
            for (int i = 0; i < 4; i++) if (i != tab) { Draw9(ui.Tab, rTabs[i]); IconAt(TabIcon[i], new Rectangle(rTabs[i].X, rTabs[i].Y + 1 * U, rTabs[i].Width, rTabs[i].Height - 6 * U)); }
            Draw9(ui.Frame, rWin);
            var ta = new Rectangle(rTabs[tab].X, rTabs[tab].Y - 3 * U, rTabs[tab].Width, rTabs[tab].Height + 3 * U); Draw9(ui.TabOn, ta);
            sb.Draw(spr.Pixel, new Rectangle(ta.X + 7 * U, rWin.Y + 1 * U, ta.Width - 14 * U, 6 * U), UiArt.Paper); IconAt(TabIcon[tab], new Rectangle(ta.X, ta.Y + 1 * U, ta.Width, ta.Height - 8 * U));
            sb.Draw(ui.Close, rClose, Color.White); TextC("x", new Rectangle(rClose.X, rClose.Y - 1 * U, rClose.Width, rClose.Height), Color.White, 1);
            float k = TS0; var sh = new Color(230, 190, 130);
            Text(TabName[tab], rWin.X + 14 * U, rWin.Y + 11 * U, Dark, 1, k, sh);
            if (tab == 0) MenuBag(k);
            else if (tab == 1) MenuAnimals(k);
            else if (tab == 2) MenuMap(k);
            else MenuOptions(k);
        }

        void MenuBag(float k)
        {
            for (int i = 0; i < Inventory.Size; i++) SlotDraw(i, rGrid[i], i == inv.Sel);
            int y = rGrid[Inventory.Size - 1].Bottom + 8 * U; int x = rGrid[0].X;
            var sid = pick >= 0 && !inv.S[pick].Empty ? inv.S[pick].Id : inv.CurId;
            if (sid != null && y + 30 * U < rWin.Bottom)
            {
                var d = Inventory.Defs[sid]; IconAt(sid, new Rectangle(x, y, 18 * U, 18 * U)); Text(d.Name, x + 22 * U, y, Dark, 1, k, Color.Transparent);
                Text(d.Desc, x + 22 * U, y + 12 * U, new Color(110, 64, 30), 0, k, Color.Transparent);
            }
            string tip = pick >= 0 ? "Toque em outra casa para trocar de lugar." : "A primeira fila é a barra rápida.";
            if (rWin.Bottom - 16 * U > y + 28 * U) Text(tip, x, rWin.Bottom - 16 * U, new Color(130, 80, 40), 0, k, Color.Transparent);
            string bank = "R$ " + cash.ToString("N0") + "  ·  Banco R$ " + acct.ToString("N0"); Text(bank, rWin.Right - 14 * U - TextW(bank, 0, k), rWin.Y + 14 * U, Dark, 0, k, Color.Transparent);
        }

        void MenuAnimals(float k)
        {
            var list = animals.FindAll(a => a.Own == "player"); int rh = 34 * U, top = rWin.Y + 30 * U, bottom = rWin.Bottom - 12 * U;
            float maxS = Math.Max(0, list.Count * (rh + 3 * U) - (bottom - top)); scroll = Math.Min(scroll, maxS);
            for (int i = 0; i < list.Count; i++)
            {
                var a = list[i]; int y = top + i * (rh + 3 * U) - (int)scroll; if (y < top - 1 || y + rh > bottom + 1) continue;
                var r = new Rectangle(rWin.X + 14 * U, y, rWin.Width - 28 * U, rh);
                sb.Draw(spr.Pixel, r, new Color(120, 70, 30)); sb.Draw(spr.Pixel, new Rectangle(r.X + U, r.Y + U, r.Width - 2 * U, r.Height - 2 * U), new Color(238, 202, 140));
                // retratinho: quadro de pé do animal
                if (a.Look.TryGetValue("idle", out var fr) && fr.Length > 0)
                {
                    var s = spr.Get(fr[0]); if (s.Ok) { float sc = Math.Min((rh - 4 * U) / (float)s.Src.Height, 56f * U / s.Src.Width); sc = Math.Max(1, (float)Math.Floor(sc)); sb.Draw(spr.Atlas[s.Atlas], new Vector2(r.X + 6 * U + (52 * U - s.Src.Width * sc) / 2, r.Bottom - 2 * U - s.Src.Height * sc), s.Src, Color.White, 0, Vector2.Zero, sc, SpriteEffects.None, 0); }
                }
                string sp = a.Sp == "boi" ? "Gado" : a.Sp == "cavalo" ? "Cavalo" : a.Sp == "cao" ? "Cachorro" : a.Sp;
                Text(a.Name, r.X + 62 * U, r.Y + 4 * U, Dark, 1, k, Color.Transparent);
                var ar = world.AreaAt(a.Pos.X, a.Pos.Y); Text(sp + " · " + a.Breed + (ar != null ? " · " + ar.Name : ""), r.X + 62 * U, r.Y + 19 * U, new Color(110, 64, 30), 0, k, Color.Transparent);
                // coraçõezinhos de afeição (fixos por enquanto)
                for (int hI = 0; hI < 5; hI++) IconAt(hI < 3 ? "cor" : "cor0", new Rectangle(r.Right - (6 - hI) * 10 * U, r.Y + 4 * U, 9 * U, 9 * U));
            }
            int others = animals.Count - list.Count; Text("Na região: " + others + " animais dos vizinhos.", rWin.X + 14 * U, rWin.Bottom - 14 * U, new Color(130, 80, 40), 0, k, Color.Transparent);
        }

        void MenuMap(float k)
        {
            var box = new Rectangle(rWin.X + 14 * U, rWin.Y + 30 * U, rWin.Width - 28 * U, rWin.Height - 44 * U);
            float wpx = world.MW * world.TS, hpx = world.MH * world.TS, sc = Math.Min(box.Width / wpx, box.Height / hpx);
            var mr = new Rectangle(box.X + (int)((box.Width - wpx * sc) / 2), box.Y + (int)((box.Height - hpx * sc) / 2), (int)(wpx * sc), (int)(hpx * sc));
            sb.Draw(spr.Pixel, new Rectangle(mr.X - 2 * U, mr.Y - 2 * U, mr.Width + 4 * U, mr.Height + 4 * U), UiArt.Ink);
            sb.End(); sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.LinearClamp);
            sb.Draw(spr.Terrain[season], mr, Color.White);
            sb.End(); sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp);
            foreach (var b in world.Buildings) { var p = new Vector2(mr.X + (b.R0 + b.R2) / 2f * world.TS * sc, mr.Y + b.R3 * world.TS * sc); sb.Draw(spr.Pixel, new Rectangle((int)p.X - 2 * U, (int)p.Y - 2 * U, 4 * U, 3 * U), new Color(190, 70, 40)); }
            foreach (var a in animals) if (a.Own == "player") { var p = new Vector2(mr.X + a.Pos.X * sc, mr.Y + a.Pos.Y * sc); sb.Draw(spr.Pixel, new Rectangle((int)p.X - U, (int)p.Y - U, 2 * U, 2 * U), UiArt.Gold); }
            var pp = new Vector2(mr.X + pl.Pos.X * sc, mr.Y + pl.Pos.Y * sc); int ps = 6 * U;
            sb.Draw(spr.Pixel, new Rectangle((int)pp.X - ps / 2 - U, (int)pp.Y - ps / 2 - U, ps + 2 * U, ps + 2 * U), Color.White); sb.Draw(spr.Pixel, new Rectangle((int)pp.X - ps / 2, (int)pp.Y - ps / 2, ps, ps), new Color(220, 40, 30));
            var ar = world.AreaAt(pl.Pos.X, pl.Pos.Y); string here = "Você está em: " + (ar != null ? ar.Name : "estrada"); Text(here, rWin.Right - 14 * U - TextW(here, 0, k), rWin.Y + 14 * U, Dark, 0, k, Color.Transparent);
        }

        void MenuOptions(float k)
        {
            foreach (var o in rOpt) { Draw9(ui.Plank, o.r); IconAt(o.id, new Rectangle(o.r.X + 6 * U, o.r.Y, 22 * U, o.r.Height)); Text(o.label, o.r.X + 32 * U, o.r.Y + (o.r.Height - 18 * k) / 2, Cream, 1, k); }
            string info = "Dia " + day + "  ·  R$ " + cash.ToString("N0") + "  ·  Banco R$ " + acct.ToString("N0");
            Text(info, rWin.X + (rWin.Width - TextW(info, 0, k)) / 2, rWin.Y + 32 * U, Dark, 0, k, Color.Transparent);
            string keys = OperatingSystem.IsAndroid() ? "Joystick à esquerda · mão = ação · bota = correr" : "WASD anda · Shift corre · E age · 1-0 itens · I mochila · M mapa";
            Text(keys, rWin.X + (rWin.Width - TextW(keys, 0, k)) / 2, rWin.Bottom - 16 * U, new Color(130, 80, 40), 0, k, Color.Transparent);
        }
    }
}
