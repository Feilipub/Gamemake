// Lida no Sertão (MonoGame) — sistema gráfico: luz do dia por mapa de luz (noite azul de verdade, com lampião,
// postes, janelas e fogueira acesos), sombra de nuvens, vento nas árvores, chuva com respingos, poeira e folhas na
// seca, vaga-lumes à noite, brilho na água, poeira dos pés ao correr e vinheta. Sem shader: só SpriteBatch e
// um alvo de renderização, para rodar igual no computador e no celular.
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    public partial class LidaGame
    {
        RenderTarget2D lightRT; Texture2D glow, vignette;
        bool raining; float rainK, rainCheck, fxT; readonly Random fxR = new Random(11);
        readonly List<Vector4> drops = new List<Vector4>(), motes = new List<Vector4>(), puffs = new List<Vector4>(); // x, y, vida/velocidade, extra
        readonly Vector2[] clouds = new Vector2[7];
        static readonly BlendState Multiply = new BlendState { ColorSourceBlend = Blend.DestinationColor, ColorDestinationBlend = Blend.Zero, ColorBlendFunction = BlendFunction.Add, AlphaSourceBlend = Blend.Zero, AlphaDestinationBlend = Blend.One };

        void FxInit()
        {
            int S = 64; var px = new Color[S * S];
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float dx = (x + 0.5f - S / 2f) / (S / 2f), dy = (y + 0.5f - S / 2f) / (S / 2f); float a = MathHelper.Clamp(1 - (float)Math.Sqrt(dx * dx + dy * dy), 0, 1); a = a * a * (3 - 2 * a); px[y * S + x] = Color.White * a; }
            glow = new Texture2D(GraphicsDevice, S, S); glow.SetData(px);
            S = 128; px = new Color[S * S];
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float dx = (x + 0.5f - S / 2f) / (S / 2f), dy = (y + 0.5f - S / 2f) / (S / 2f); float d = (float)Math.Sqrt(dx * dx * 0.8f + dy * dy); float a = MathHelper.Clamp((d - 0.55f) / 0.6f, 0, 1); px[y * S + x] = Color.Black * (a * a); }
            vignette = new Texture2D(GraphicsDevice, S, S); vignette.SetData(px);
            for (int i = 0; i < clouds.Length; i++) clouds[i] = new Vector2(fxR.Next(world.MW * world.TS), fxR.Next(world.MH * world.TS));
        }

        /// <summary>Luz ambiente pela hora (multiplica a cena): madrugada azul, aurora rosa, dia claro, tarde dourada.</summary>
        Color Ambient(out float dark)
        {
            float h = (float)(minutes / 60.0) % 24; dark = 0; Color night = new Color(58, 70, 124), dawn = new Color(240, 180, 170), dusk = new Color(255, 196, 140);
            Color c;
            if (h < 4.5f || h >= 20.5f) { c = night; dark = 1; }
            else if (h < 6) { float k = (h - 4.5f) / 1.5f; c = Color.Lerp(night, dawn, k); dark = 1 - k; }
            else if (h < 7.5f) c = Color.Lerp(dawn, Color.White, (h - 6) / 1.5f);
            else if (h < 16.5f) c = Color.White;
            else if (h < 18.5f) c = Color.Lerp(Color.White, dusk, (h - 16.5f) / 2f);
            else { float k = (h - 18.5f) / 2f; c = Color.Lerp(dusk, night, k); dark = k; }
            if (rainK > 0) c = Color.Lerp(c, new Color((int)(c.R * 0.72f), (int)(c.G * 0.76f), (int)(c.B * 0.86f)), rainK);
            return c;
        }

        void FxUpdate(float dt, RectangleF view)
        {
            fxT += dt;
            // tempo: na estação das chuvas, a cada hora do jogo sorteia se chove (35%); na seca, quase nunca
            if ((rainCheck -= dt) <= 0) { rainCheck = 60; raining = fxR.NextDouble() < (season == 0 ? 0.35 : 0.03); }
            rainK = MathHelper.Clamp(rainK + (raining ? dt : -dt) * 0.25f, 0, 1);
            if (raining) foreach (var t in world.Troughs) if (t.Kind == "agua") t.Level = Math.Min(t.Cap, t.Level + dt * t.Cap / 900f);
            // nuvens andam com o vento
            for (int i = 0; i < clouds.Length; i++) { clouds[i].X += dt * 7; if (clouds[i].X > world.MW * world.TS + 200) clouds[i].X = -200; }
            // chuva: gotas em coordenadas do mundo, perto da câmera
            int want = (int)(380 * rainK);
            while (drops.Count < want) drops.Add(new Vector4(view.X + (float)fxR.NextDouble() * view.W, view.Y + (float)fxR.NextDouble() * view.H - 40, 0, 0));
            if (drops.Count > want) drops.RemoveRange(want, drops.Count - want);
            for (int i = 0; i < drops.Count; i++)
            {
                var d = drops[i]; d.X += dt * -40; d.Y += dt * 260; d.Z += dt;
                if (d.Y > view.Y + view.H || d.X < view.X - 10 || fxR.NextDouble() < dt * 1.6) { if (fxR.NextDouble() < 0.5) puffs.Add(new Vector4(d.X, d.Y, 0, 2)); d = new Vector4(view.X + (float)fxR.NextDouble() * (view.W + 40), view.Y - 10 + (float)fxR.NextDouble() * 30, 0, 0); }
                drops[i] = d;
            }
            // partículas do ar: poeira e folhas secas (seca, de dia) ou vaga-lumes (noite)
            Ambient(out float dark); int mw = dark > 0.5f ? 26 : season == 1 ? 34 : 10;
            while (motes.Count < mw) motes.Add(new Vector4(view.X + (float)fxR.NextDouble() * view.W, view.Y + (float)fxR.NextDouble() * view.H, (float)fxR.NextDouble() * 6.28f, fxR.Next(3)));
            if (motes.Count > mw) motes.RemoveRange(mw, motes.Count - mw);
            for (int i = 0; i < motes.Count; i++)
            {
                var m = motes[i]; m.Z += dt;
                if (dark > 0.5f) { m.X += (float)Math.Sin(m.Z * 0.9f + i) * dt * 8; m.Y += (float)Math.Cos(m.Z * 0.7f + i * 2) * dt * 6; }
                else { m.X += dt * (season == 1 ? 18 : 6) + (float)Math.Sin(m.Z * 2 + i) * dt * 6; m.Y += dt * (season == 1 ? 5 : 2) + (float)Math.Cos(m.Z * 1.3f) * dt * 4; }
                if (!view.Near(m.X, m.Y, 20)) m = new Vector4(view.X + (float)fxR.NextDouble() * view.W, view.Y + (float)fxR.NextDouble() * view.H, (float)fxR.NextDouble() * 6.28f, fxR.Next(3));
                motes[i] = m;
            }
            // poeira dos pés ao correr (e dos animais assustados)
            if (pl.Running && fxR.NextDouble() < dt * 14) puffs.Add(new Vector4(pl.Pos.X + (float)(fxR.NextDouble() - 0.5) * 6, pl.Pos.Y, 0, 1));
            for (int i = puffs.Count - 1; i >= 0; i--) { var p = puffs[i]; p.Z += dt; if (p.W == 1) p.Y -= dt * 6; puffs[i] = p; if (p.Z > (p.W == 2 ? 0.25f : 0.6f)) puffs.RemoveAt(i); }
        }

        /// <summary>Ângulo do vento para árvores (balanço leve que varia com a posição).</summary>
        float Sway(float x, float y) => (float)Math.Sin(fxT * 1.4f + x * 0.031f + y * 0.017f) * (0.018f + rainK * 0.02f) + (float)Math.Sin(fxT * 3.1f + x * 0.07f) * 0.006f;

        /// <summary>Camadas do mundo por cima dos objetos: respingos, gotas, poeira, sombra de nuvens.</summary>
        void FxWorld(RectangleF view, float dark)
        {
            // brilho na água (de dia)
            if (dark < 0.5f)
            {
                int t0 = (int)(fxT * 3); var r = new Random(t0);
                for (int k = 0; k < 40; k++)
                {
                    int tx = (int)(view.X / world.TS) + r.Next((int)(view.W / world.TS) + 1), ty = (int)(view.Y / world.TS) + r.Next((int)(view.H / world.TS) + 1);
                    if (world.GroundAt(tx, ty) != G.WATER) continue; int sx = tx * world.TS + r.Next(14), sy = ty * world.TS + r.Next(14);
                    sb.Draw(spr.Pixel, new Rectangle(sx, sy, 2, 1), Color.White * 0.75f); sb.Draw(spr.Pixel, new Rectangle(sx + 3, sy, 1, 1), Color.White * 0.4f);
                }
            }
            foreach (var p in puffs)
            {
                if (p.W == 2) { float k = p.Z / 0.25f; sb.Draw(spr.Pixel, new Rectangle((int)p.X - 1 - (int)(k * 2), (int)p.Y, 3 + (int)(k * 4), 1), new Color(200, 220, 255) * (0.6f * (1 - k))); }
                else { float k = p.Z / 0.6f; int s = 2 + (int)(k * 5); sb.Draw(glow, new Rectangle((int)p.X - s, (int)p.Y - s / 2, s * 2, s), new Color(214, 180, 130) * (0.55f * (1 - k))); }
            }
            foreach (var m in motes)
            {
                if (dark > 0.5f) continue;
                var c = season == 1 ? (m.W == 0 ? new Color(196, 140, 70) : m.W == 1 ? new Color(220, 190, 130) : new Color(160, 110, 50)) : new Color(255, 255, 230);
                sb.Draw(spr.Pixel, new Rectangle((int)m.X, (int)m.Y, m.W == 0 && season == 1 ? 2 : 1, 1), c * (season == 1 ? 0.85f : 0.5f));
            }
            foreach (var d in drops) sb.Draw(spr.Pixel, new Vector2(d.X, d.Y), null, new Color(190, 210, 240) * 0.55f, 1.42f, Vector2.Zero, new Vector2(7, 1), SpriteEffects.None, 0);
            // sombra das nuvens passando (de dia, sem chuva)
            if (dark < 0.6f)
                foreach (var c in clouds) if (view.Near(c.X, c.Y, 160)) sb.Draw(glow, new Rectangle((int)c.X - 130, (int)c.Y - 70, 260, 140), Color.Black * (0.10f * (1 - rainK) * (1 - dark)));
        }

        /// <summary>Mapa de luz: ambiente + luzes somadas, depois multiplicado sobre a cena.</summary>
        void FxLight(Matrix M, RectangleF view, Viewport vp)
        {
            var amb = Ambient(out float dark);
            if (lightRT == null || lightRT.Width != vp.Width || lightRT.Height != vp.Height) { lightRT?.Dispose(); lightRT = new RenderTarget2D(GraphicsDevice, vp.Width, vp.Height); }
            GraphicsDevice.SetRenderTarget(lightRT); GraphicsDevice.Clear(amb);
            if (dark > 0.05f)
            {
                sb.Begin(SpriteSortMode.Deferred, BlendState.Additive, SamplerState.LinearClamp, null, null, null, M);
                float fl = 1 + (float)Math.Sin(fxT * 9) * 0.04f + (float)Math.Sin(fxT * 23) * 0.03f;
                void L(float x, float y, float r, Color c) { if (view.Near(x, y, r)) sb.Draw(glow, new Rectangle((int)(x - r), (int)(y - r * 0.8f), (int)(r * 2), (int)(r * 1.6f)), c * dark); }
                L(pl.Pos.X, pl.Pos.Y - 8, 70 * fl, new Color(255, 196, 120)); // lampião do vaqueiro
                foreach (var b in world.Buildings) { var s = spr.Get(b.Sprite); if (s.Ok) L(b.X + s.Src.Width / 2f, b.SortY - 14, 46, new Color(255, 170, 80) * 0.8f); }
                foreach (var p in world.Props)
                {
                    if (p.Type == "poste") { L(p.X, p.Y - 26, 52, new Color(255, 214, 140)); }
                    else if (p.Type == "fogueira" || p.Type == "churrasqueira") L(p.X, p.Y - 6, 64 * fl, new Color(255, 130, 50));
                }
                foreach (var m in motes) { float b = 0.5f + 0.5f * (float)Math.Sin(m.Z * 3 + m.X); L(m.X, m.Y, 7, new Color(220, 255, 120) * b); }
                sb.End();
            }
            GraphicsDevice.SetRenderTarget(null);
        }

        void FxComposite(Viewport vp, float dark)
        {
            sb.Begin(SpriteSortMode.Deferred, Multiply, SamplerState.PointClamp);
            sb.Draw(lightRT, Vector2.Zero, Color.White);
            sb.End();
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.LinearClamp);
            // vaga-lumes por cima da escuridão (pontinho brilhante)
            sb.Draw(vignette, new Rectangle(0, 0, vp.Width, vp.Height), Color.White * (0.45f + 0.35f * dark + 0.2f * rainK));
            if (rainK > 0) sb.Draw(spr.Pixel, new Rectangle(0, 0, vp.Width, vp.Height), new Color(60, 80, 110) * (0.12f * rainK));
            sb.End();
        }
    }
}
