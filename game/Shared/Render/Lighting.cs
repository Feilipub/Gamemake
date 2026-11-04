// Terra de Crinas — luz e atmosfera. Mapa de luz multiplicado sobre a cena (madrugada azul, aurora rosada, dia,
// pôr do sol dourado, noite), luzes somadas (lampião, janelas do estábulo), sombras de nuvens, poeira dourada no ar
// de dia, vaga-lumes à noite, brilho na água e vinheta. Feito só com SpriteBatch (roda igual no Android).
using System;
using System.Collections.Generic;
using Crinas.Core;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Render
{
    public sealed class Lighting
    {
        RenderTarget2D rt; readonly Texture2D vignette; readonly GraphicsDevice gd; readonly Atlas at;
        readonly Vector2[] clouds = new Vector2[8]; readonly List<Vector4> motes = new List<Vector4>(); readonly Rng r = new Rng(77);
        public float T;
        public static readonly BlendState Multiply = new BlendState { ColorSourceBlend = Blend.DestinationColor, ColorDestinationBlend = Blend.Zero, ColorBlendFunction = BlendFunction.Add, AlphaSourceBlend = Blend.Zero, AlphaDestinationBlend = Blend.One };

        public Lighting(GraphicsDevice g, Atlas a, float worldW, float worldH)
        {
            gd = g; at = a; const int S = 128; var px = new Color[S * S];
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float dx = (x + 0.5f - S / 2f) / (S / 2f), dy = (y + 0.5f - S / 2f) / (S / 2f); float d = (float)Math.Sqrt(dx * dx * 0.8f + dy * dy); float k = MathHelper.Clamp((d - 0.6f) / 0.55f, 0, 1); px[y * S + x] = Color.Black * (k * k); }
            vignette = new Texture2D(g, S, S); vignette.SetData(px);
            for (int i = 0; i < clouds.Length; i++) clouds[i] = new Vector2(r.Range(0, worldW), r.Range(0, worldH));
        }

        /// <summary>Cor ambiente pela hora (0..24) e quanto está escuro (0..1).</summary>
        public static Color Ambient(float h, out float dark)
        {
            Color night = new Color(56, 66, 122), dawn = new Color(244, 178, 170), dusk = new Color(255, 192, 132); dark = 0;
            if (h < 4.5f || h >= 20.5f) { dark = 1; return night; }
            if (h < 6) { float k = (h - 4.5f) / 1.5f; dark = 1 - k; return Color.Lerp(night, dawn, k); }
            if (h < 7.5f) return Color.Lerp(dawn, Color.White, (h - 6) / 1.5f);
            if (h < 16.5f) return Color.White;
            if (h < 18.5f) return Color.Lerp(Color.White, dusk, (h - 16.5f) / 2f);
            { float k = (h - 18.5f) / 2f; dark = k; return Color.Lerp(dusk, night, k); }
        }

        public void Update(float dt, RectangleF view, float dark)
        {
            T += dt;
            for (int i = 0; i < clouds.Length; i++) { clouds[i].X += dt * 8; if (clouds[i].X > view.X + 2000) clouds[i].X = view.X - 600; if (clouds[i].X < view.X - 900) clouds[i].X = view.X + view.W + 300; if (Math.Abs(clouds[i].Y - view.Y) > 1500) clouds[i].Y = view.Y + r.Range(-300, view.H + 300); }
            int want = dark > 0.5f ? 30 : 16;
            while (motes.Count < want) motes.Add(new Vector4(view.X + r.Next() * view.W, view.Y + r.Next() * view.H, r.Next() * 6.28f, 0));
            if (motes.Count > want) motes.RemoveRange(want, motes.Count - want);
            for (int i = 0; i < motes.Count; i++)
            {
                var m = motes[i]; m.Z += dt;
                m.X += (float)Math.Sin(m.Z * 0.9f + i) * dt * 7 + dt * 3; m.Y += (float)Math.Cos(m.Z * 0.7f + i * 2) * dt * 5;
                if (!view.Near(m.X, m.Y, 20)) m = new Vector4(view.X + r.Next() * view.W, view.Y + r.Next() * view.H, r.Next() * 6.28f, 0);
                motes[i] = m;
            }
        }

        /// <summary>Monta o mapa de luz (chamar ANTES de desenhar a cena: trocar o alvo apaga a tela).</summary>
        public void BuildLightmap(SpriteBatch sb, Matrix M, Viewport vp, Color amb, float dark, IEnumerable<(Vector2 p, float r, Color c)> lights)
        {
            if (rt == null || rt.Width != vp.Width || rt.Height != vp.Height) { rt?.Dispose(); rt = new RenderTarget2D(gd, vp.Width, vp.Height); }
            gd.SetRenderTarget(rt); gd.Clear(amb);
            if (dark > 0.05f)
            {
                sb.Begin(SpriteSortMode.Deferred, BlendState.Additive, SamplerState.LinearClamp, null, null, null, M);
                foreach (var (p, rad, c) in lights) sb.Draw(at.Glow, new Rectangle((int)(p.X - rad), (int)(p.Y - rad * 0.8f), (int)(rad * 2), (int)(rad * 1.6f)), c * dark);
                foreach (var m in motes) { float b = 0.5f + 0.5f * (float)Math.Sin(m.Z * 3 + m.X); sb.Draw(at.Glow, new Rectangle((int)m.X - 7, (int)m.Y - 7, 14, 14), new Color(220, 255, 120) * (b * dark)); }
                sb.End();
            }
            gd.SetRenderTarget(null);
        }

        /// <summary>Camadas do mundo por cima dos objetos (dentro do Begin com a matriz da câmera).</summary>
        public void WorldOverlay(SpriteBatch sb, RectangleF view, float dark, Func<int, int, bool> isWater)
        {
            if (dark < 0.5f)
            {
                var rr = new Random((int)(T * 3));
                for (int k = 0; k < 60; k++)
                {
                    int tx = (int)(view.X / 16) + rr.Next((int)(view.W / 16) + 1), ty = (int)(view.Y / 16) + rr.Next((int)(view.H / 16) + 1);
                    if (!isWater(tx, ty)) continue; int sx = tx * 16 + rr.Next(14), sy = ty * 16 + rr.Next(14);
                    sb.Draw(at.Pixel, new Rectangle(sx, sy, 2, 1), Color.White * 0.8f); sb.Draw(at.Pixel, new Rectangle(sx + 3, sy, 1, 1), Color.White * 0.45f);
                }
                foreach (var m in motes) sb.Draw(at.Pixel, new Rectangle((int)m.X, (int)m.Y, 1, 1), new Color(255, 244, 200) * 0.7f);
                foreach (var c in clouds) if (view.Near(c.X, c.Y, 200)) sb.Draw(at.Glow, new Rectangle((int)c.X - 150, (int)c.Y - 80, 300, 160), Color.Black * (0.10f * (1 - dark)));
            }
        }

        public void Composite(SpriteBatch sb, Viewport vp, Matrix M, float dark)
        {
            sb.Begin(SpriteSortMode.Deferred, Multiply, SamplerState.PointClamp); sb.Draw(rt, Vector2.Zero, Color.White); sb.End();
            if (dark > 0.5f) { sb.Begin(SpriteSortMode.Deferred, BlendState.Additive, SamplerState.PointClamp, null, null, null, M); foreach (var m in motes) { float b = 0.5f + 0.5f * (float)Math.Sin(m.Z * 3 + m.X); sb.Draw(at.Pixel, new Rectangle((int)m.X, (int)m.Y, 1, 1), new Color(230, 255, 140) * b); } sb.End(); }
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.LinearClamp); sb.Draw(vignette, new Rectangle(0, 0, vp.Width, vp.Height), Color.White * (0.4f + 0.35f * dark)); sb.End();
        }
    }

    /// <summary>Retângulo em ponto flutuante (área visível do mundo).</summary>
    public struct RectangleF
    {
        public float X, Y, W, H;
        public RectangleF(float x, float y, float w, float h) { X = x; Y = y; W = w; H = h; }
        public bool Near(float px, float py, float m) => px > X - m && px < X + W + m && py > Y - m && py < Y + H + m * 1.6f;
    }
}
