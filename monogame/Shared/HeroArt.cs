// Lida no Sertão (MonoGame) — o vaqueiro redesenhado em código: chapéu de couro de aba quebrada com estrela,
// gibão de couro, lenço vermelho, calça, botas, cabeça grande (proporção dos jogos de fazenda em pixel art).
// 3 direções (baixo, cima, lado; o lado esquerdo é espelho) × 5 quadros (parado + 4 de caminhada).
using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    public class HeroArt
    {
        public const int FW = 22, FH = 34; public static readonly Vector2 Anchor = new Vector2(11, 33);
        public Texture2D Sheet; // linhas: 0 baixo, 1 cima, 2 lado; colunas: 0 parado, 1..4 andando
        public Rectangle Src(int row, int f) => new Rectangle(f * FW, row * FH, FW, FH);

        static readonly Color Ink = new Color(44, 26, 14), Skin = new Color(238, 186, 140), SkinD = new Color(206, 146, 104), Hair = new Color(84, 52, 30),
            Leather = new Color(156, 96, 46), LeatherD = new Color(118, 70, 32), LeatherL = new Color(196, 132, 66), Hat = new Color(146, 88, 40), HatL = new Color(186, 122, 60),
            Shirt = new Color(232, 224, 204), Scarf = new Color(204, 52, 42), Pants = new Color(70, 88, 132), PantsD = new Color(52, 66, 104), Boot = new Color(92, 54, 26), Gold = new Color(236, 196, 92);

        public HeroArt(GraphicsDevice gd)
        {
            var all = new Color[FW * 5 * FH * 3];
            for (int row = 0; row < 3; row++) for (int f = 0; f < 5; f++)
                {
                    var p = new Px(FW, FH); Draw(p, row, f); p.Shade(0.14f, 0.16f); p.Outline(Ink);
                    for (int y = 0; y < FH; y++) for (int x = 0; x < FW; x++) all[(row * FH + y) * FW * 5 + f * FW + x] = p.P[y * FW + x];
                }
            Sheet = new Texture2D(gd, FW * 5, FH * 3); Sheet.SetData(all);
        }

        static void Draw(Px p, int row, int f)
        {
            int ox = 1, oy = 1; // margem do contorno
            int bob = f == 2 || f == 4 ? -1 : 0;
            if (row == 2) { Side(p, f, bob, ox, oy); return; }
            bool back = row == 1;
            int liftL = f == 1 ? -2 : 0, liftR = f == 3 ? -2 : 0;
            // pernas e botas
            void Leg(int x, int lift) { int foot = oy + 29 + lift; p.Rect(ox + x, oy + 22 + bob, 3, foot - (oy + 22 + bob), Pants); p.Rect(ox + x, oy + 22 + bob, 1, foot - (oy + 22 + bob), PantsD); p.Rect(ox + x - (back ? 0 : 0), foot, 4, 2, Boot); }
            Leg(6, liftL); Leg(11, liftR);
            // braços (balançam ao andar)
            int aL = f == 1 ? -1 : f == 3 ? 1 : 0, aR = -aL;
            void Arm(int x, int dy) { p.Rect(ox + x, oy + 16 + bob + dy, 2, 6, Leather); p.Rect(ox + x, oy + 22 + bob + dy, 2, 2, Skin); }
            Arm(3, aL); Arm(15, aR);
            // gibão
            p.Rect(ox + 5, oy + 15 + bob, 10, 8, Leather); p.Rect(ox + 5, oy + 15 + bob, 10, 1, LeatherL);
            if (!back) { p.Rect(ox + 9, oy + 16 + bob, 2, 5, Shirt); p.Set(ox + 6, oy + 18 + bob, LeatherD); p.Set(ox + 13, oy + 18 + bob, LeatherD); p.Set(ox + 7, oy + 20 + bob, Gold); p.Set(ox + 12, oy + 20 + bob, Gold); }
            else { p.Rect(ox + 7, oy + 17 + bob, 6, 1, LeatherD); p.Rect(ox + 9, oy + 18 + bob, 2, 3, LeatherD); }
            p.Rect(ox + 5, oy + 22 + bob, 10, 1, LeatherD); if (!back) p.Rect(ox + 9, oy + 22 + bob, 2, 1, Gold);
            // lenço no pescoço
            p.Rect(ox + 7, oy + 14 + bob, 6, 2, Scarf); if (!back) { p.Set(ox + 9, oy + 16 + bob, Scarf); p.Set(ox + 10, oy + 16 + bob, Scarf); }
            // cabeça
            p.Rect(ox + 5, oy + 6 + bob, 10, 9, back ? Hair : Skin); p.Rect(ox + 6, oy + 5 + bob, 8, 1, back ? Hair : Skin);
            if (!back)
            {
                p.Rect(ox + 5, oy + 7 + bob, 1, 3, Hair); p.Rect(ox + 14, oy + 7 + bob, 1, 3, Hair); p.Rect(ox + 6, oy + 7 + bob, 8, 1, Hair);
                bool blink = f == 0 && false; int ey = oy + 10 + bob;
                if (!blink) { p.Rect(ox + 7, ey, 1, 2, Ink); p.Rect(ox + 12, ey, 1, 2, Ink); p.Set(ox + 7, ey, new Color(90, 60, 40)); }
                p.Set(ox + 6, oy + 12 + bob, new Color(236, 150, 128)); p.Set(ox + 13, oy + 12 + bob, new Color(236, 150, 128));
                p.Rect(ox + 9, oy + 13 + bob, 2, 1, SkinD);
            }
            else { p.Rect(ox + 7, oy + 13 + bob, 6, 1, SkinD); }
            // chapéu de couro: aba larga, copa redonda e meia-lua da frente virada para cima, com estrela
            p.Ell(ox + 10, oy + 6.5f + bob, 9, 2.3f, Hat); p.Ell(ox + 10, oy + 6.2f + bob, 8, 1.4f, HatL);
            p.Ell(ox + 10, oy + 4f + bob, 4.5f, 3.6f, Hat); p.Rect(ox + 6, oy + 5 + bob, 8, 1, LeatherD);
            if (!back) { p.Ell(ox + 10, oy + 3.2f + bob, 5.5f, 2.6f, HatL); p.Ell(ox + 10, oy + 4.2f + bob, 4.4f, 1.6f, Hat); p.Set(ox + 10, oy + 2 + bob, Gold); p.Set(ox + 9, oy + 3 + bob, Gold); p.Set(ox + 11, oy + 3 + bob, Gold); p.Set(ox + 10, oy + 3 + bob, Gold); }
            else { p.Set(ox + 7, oy + 3 + bob, HatL); p.Set(ox + 12, oy + 3 + bob, HatL); }
        }

        static void Side(Px p, int f, int bob, int ox, int oy)
        {
            // virado para a direita
            int sw = f == 1 ? 2 : f == 3 ? -2 : 0;
            void Leg(int dx, Color c) { int x = ox + 9 + dx; p.Rect(x, oy + 22 + bob, 3, 7 - bob, c); p.Rect(x, oy + 29, 4, 2, Boot); }
            Leg(-sw, PantsD); // perna de trás
            p.Rect(ox + 9 - sw / 2, oy + 16 + bob, 2, 6, LeatherD); // braço de trás
            Leg(sw, Pants);
            p.Rect(ox + 7, oy + 15 + bob, 7, 8, Leather); p.Rect(ox + 7, oy + 15 + bob, 7, 1, LeatherL); p.Rect(ox + 12, oy + 16 + bob, 2, 5, Shirt); p.Rect(ox + 7, oy + 22 + bob, 7, 1, LeatherD);
            p.Rect(ox + 9, oy + 14 + bob, 5, 2, Scarf); p.Set(ox + 14, oy + 15 + bob, Scarf);
            // braço da frente balança
            p.Rect(ox + 9 + sw / 2, oy + 16 + bob, 2, 6, Leather); p.Rect(ox + 9 + sw / 2 + (sw > 0 ? 1 : 0), oy + 22 + bob, 2, 2, Skin);
            // cabeça de perfil
            p.Rect(ox + 6, oy + 6 + bob, 9, 9, Skin); p.Rect(ox + 7, oy + 5 + bob, 7, 1, Skin); p.Set(ox + 15, oy + 10 + bob, Skin); p.Set(ox + 15, oy + 11 + bob, SkinD);
            p.Rect(ox + 6, oy + 7 + bob, 4, 5, Hair); p.Rect(ox + 6, oy + 7 + bob, 8, 1, Hair); p.Set(ox + 9, oy + 10 + bob, Skin); p.Rect(ox + 8, oy + 9 + bob, 2, 2, SkinD);
            p.Rect(ox + 12, oy + 9 + bob, 1, 2, Ink); p.Set(ox + 12, oy + 12 + bob, new Color(236, 150, 128)); p.Set(ox + 13, oy + 13 + bob, SkinD);
            // chapéu de perfil: aba comprida e a frente virada
            p.Ell(ox + 10.5f, oy + 6.5f + bob, 9, 2, Hat); p.Ell(ox + 10, oy + 4f + bob, 4.5f, 3.4f, Hat); p.Rect(ox + 6, oy + 5 + bob, 9, 1, LeatherD);
            p.Ell(ox + 15.5f, oy + 4.5f + bob, 2.2f, 2.6f, HatL); p.Set(ox + 10, oy + 2 + bob, Gold); p.Set(ox + 11, oy + 3 + bob, Gold);
        }
    }
}
