// Lida no Sertão (MonoGame) — atlas de sprites exportados do jogo web e utilidades de desenho.
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    /// <summary>Um sprite dentro de um atlas: retângulo de origem e âncora (ponto que fica no chão).</summary>
    public struct Spr { public int Atlas; public Rectangle Src; public Vector2 Anchor; public bool Ok; }

    /// <summary>Carrega os arquivos embutidos (Assets/*) e guarda os atlas na GPU.</summary>
    public class Sprites
    {
        public Texture2D[] Atlas;
        public Texture2D[] Terrain = new Texture2D[2];
        public Texture2D Pixel, Soft;
        readonly Dictionary<string, Spr> map = new Dictionary<string, Spr>();

        public static Stream Res(string name)
        {
            var asm = typeof(Sprites).GetTypeInfo().Assembly;
            var s = asm.GetManifestResourceStream("Assets/" + name);
            if (s == null) throw new FileNotFoundException("Recurso embutido ausente: Assets/" + name);
            return s;
        }

        public Sprites(GraphicsDevice gd)
        {
            var list = new List<Texture2D>();
            for (int i = 0; ; i++) { Stream s; try { s = Res("atlas_" + i + ".png"); } catch (FileNotFoundException) { break; } using (s) list.Add(Texture2D.FromStream(gd, s)); }
            Atlas = list.ToArray();
            using (var s = Res("sprites.json"))
            {
                var doc = JsonDocument.Parse(s);
                foreach (var p in doc.RootElement.EnumerateObject())
                {
                    var a = p.Value; map[p.Name] = new Spr { Atlas = a[0].GetInt32(), Src = new Rectangle(a[1].GetInt32(), a[2].GetInt32(), a[3].GetInt32(), a[4].GetInt32()), Anchor = new Vector2(a[5].GetSingle(), a[6].GetSingle()), Ok = true };
                }
            }
            Pixel = new Texture2D(gd, 1, 1); Pixel.SetData(new[] { Color.White });
            // sombra macia (elipse com borda suave) para os pés de árvores, animais e pessoas
            int W = 64, H = 32; var px = new Color[W * H];
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) { float dx = (x + 0.5f - W / 2f) / (W / 2f), dy = (y + 0.5f - H / 2f) / (H / 2f), d = dx * dx + dy * dy; float a = MathHelper.Clamp(1 - d, 0, 1); a = a * a; px[y * W + x] = new Color(0, 0, 0) * a; }
            Soft = new Texture2D(gd, W, H); Soft.SetData(px);
        }

        public void LoadTerrain(GraphicsDevice gd, int season)
        {
            if (Terrain[season] != null) return;
            using (var s = Res("terrain_s" + season + ".png")) Terrain[season] = Texture2D.FromStream(gd, s);
        }

        public Spr Get(string key) => key != null && map.TryGetValue(key, out var s) ? s : default;
        public bool Has(string key) => key != null && map.ContainsKey(key);

        /// <summary>Desenha o sprite com a âncora no ponto (x, y) do mundo.</summary>
        public void Draw(SpriteBatch sb, string key, float x, float y, Color c, bool flip = false)
        {
            var s = Get(key); if (!s.Ok) return;
            float ox = flip ? s.Src.Width - s.Anchor.X : s.Anchor.X;
            sb.Draw(Atlas[s.Atlas], new Vector2((float)Math.Round(x - ox), (float)Math.Round(y - s.Anchor.Y)), s.Src, c, 0, Vector2.Zero, 1, flip ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0);
        }

        /// <summary>Desenha girando em volta da âncora (árvores balançando no vento).</summary>
        public void DrawRot(SpriteBatch sb, string key, float x, float y, Color c, float rot)
        {
            var s = Get(key); if (!s.Ok) return;
            sb.Draw(Atlas[s.Atlas], new Vector2((float)Math.Round(x), (float)Math.Round(y)), s.Src, c, rot, s.Anchor, 1, SpriteEffects.None, 0);
        }

        public void Shadow(SpriteBatch sb, float x, float y, float rx, float ry, float a)
        {
            sb.Draw(Soft, new Rectangle((int)(x - rx), (int)(y - ry), (int)(rx * 2), (int)(ry * 2)), Color.White * a);
        }
    }
}
