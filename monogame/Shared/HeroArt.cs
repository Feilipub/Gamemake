// Lida no Sertão (MonoGame) — o vaqueiro desenhado pixel a pixel (16×32, proporção dos jogos de fazenda):
// chapéu de couro com a aba da frente virada e estrela dourada, gibão de couro, lenço vermelho, camisa clara,
// cinto com fivela, calça e botas. Corpo em mapa de caracteres; pernas montadas por quadro (caminhada em 4 passos).
// 3 direções (baixo, cima, lado; o lado esquerdo é espelho) × 5 quadros (parado + 4 andando). Contorno automático.
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Lida
{
    public class HeroArt
    {
        public const int FW = 18, FH = 34; public static readonly Vector2 Anchor = new Vector2(9, 32);
        public Texture2D Sheet; // linhas: 0 baixo, 1 cima, 2 lado; colunas: 0 parado, 1..4 andando
        public Rectangle Src(int row, int f) => new Rectangle(f * FW, row * FH, FW, FH);

        static readonly Dictionary<char, Color> Pal = new Dictionary<char, Color>
        {
            ['h'] = new Color(166, 106, 54), ['H'] = new Color(134, 82, 38), ['d'] = new Color(96, 56, 26), ['y'] = new Color(238, 200, 98),
            ['B'] = new Color(80, 50, 30), ['n'] = new Color(58, 34, 20),
            ['S'] = new Color(244, 198, 156), ['s'] = new Color(214, 160, 120), ['k'] = new Color(50, 32, 26), ['m'] = new Color(198, 108, 94),
            ['R'] = new Color(212, 60, 46), ['r'] = new Color(158, 38, 30),
            ['J'] = new Color(178, 112, 58), ['j'] = new Color(136, 82, 40), ['L'] = new Color(216, 154, 90), ['W'] = new Color(242, 234, 214),
            ['b'] = new Color(84, 50, 26), ['P'] = new Color(74, 94, 140), ['p'] = new Color(54, 70, 108), ['O'] = new Color(112, 66, 34), ['o'] = new Color(78, 44, 20),
        };
        static readonly Color Ink = new Color(44, 28, 20);

        static readonly string[] Front =
        {
            ".....hhhhhh.....",
            "....hhhyyhhh....",
            "...hhhyyyyhhh...",
            "...hhhhyyhhhh...",
            "..HhhhhhhhhhhH..",
            ".HHHddddddddHHH.",
            "dHHHHHHHHHHHHHHd",
            ".ddBBBBBBBBBBdd.",
            "..BSSSSSSSSSSB..",
            "..SSSSSSSSSSSS..",
            "..SSkSSSSSSkSS..",
            "..SSkSSSSSSkSS..",
            "..sSmSSSSSSmSs..",
            "..sSSSSmmSSSSs..",
            "...sSSSSSSSSs...",
            ".....RRRRRR.....",
            "...JJRRrrRRJJ...",
            "..JJLJWrrWJLJJ..",
            ".JjJLJWWWWJLJjJ.",
            ".JjJLJWWWWJLJjJ.",
            ".JjJJJWWWWJJJjJ.",
            ".JjjJJWWWWJJjjJ.",
            ".SsbbbbyybbbbsS.",
            ".ss.PPPPPPPP.ss.",
            "....PPPPPPPP....",
            "....PPPPPPPP....",
        };
        static readonly string[] Back =
        {
            ".....hhhhhh.....",
            "....hhhhhhhh....",
            "...hhhhhhhhhh...",
            "...hhhhhhhhhh...",
            "..HhhhhhhhhhhH..",
            ".HHHddddddddHHH.",
            "dHHHHHHHHHHHHHHd",
            ".ddBBBBBBBBBBdd.",
            "..nBBBBBBBBBBn..",
            "..nBBBBBBBBBBn..",
            "..nBBBBBBBBBBn..",
            "..nBBBBBBBBBBn..",
            "..snBBBBBBBBns..",
            "..sSnBBBBBBnSs..",
            "....sSSSSSSs....",
            ".....RRRRRR.....",
            "...JJJrRRrJJJ...",
            "..JJJJJJJJJJJJ..",
            ".JjJJJjJJjJJJjJ.",
            ".JjJJJjJJjJJJjJ.",
            ".JjJJJJJJJJJJjJ.",
            ".JjjJJJJJJJJjjJ.",
            ".SsbbbbbbbbbbsS.",
            ".ss.PPPPPPPP.ss.",
            "....PPPPPPPP....",
            "....PPPPPPPP....",
        };
        static readonly string[] Side =
        {
            ".....hhhhh......",
            "....hhhhhhh.hh..",
            "....hhhhhhhhhyh.",
            "...hhhhhhhhhhhh.",
            "...Hhhhhhhhhhhh.",
            "..dddddddddddHH.",
            "HHHHHHHHHHHHHHHd",
            "..dBBBBBSSSSd...",
            "...BBBBSSSSSS...",
            "...BBBSSSSSSS...",
            "...BBBSSSSkSS...",
            "...BBsSSSSkSSS..",
            "...BBsSSSSSSSS..",
            "....BsSSSSmSS...",
            ".....sSSSSSs....",
            "......RRRRR.....",
            ".....JJRRrRR....",
            ".....JJJJJWW....",
            ".....JJjjJWW....",
            ".....JJjjJWW....",
            ".....JJjjJJJ....",
            ".....JJjjJJJ....",
            ".....bbbSSbyb...",
            "......PPPPPP....",
            "......PPPPPP....",
            "......PPPPPP....",
        };

        public HeroArt(GraphicsDevice gd)
        {
            var all = new Color[FW * 5 * FH * 3];
            for (int row = 0; row < 3; row++) for (int f = 0; f < 5; f++)
                {
                    var p = new Px(FW, FH); Draw(p, row, f); p.Outline(Ink);
                    for (int y = 0; y < FH; y++) for (int x = 0; x < FW; x++) all[(row * FH + y) * FW * 5 + f * FW + x] = p.P[y * FW + x];
                }
            Sheet = new Texture2D(gd, FW * 5, FH * 3); Sheet.SetData(all);
        }

        static void Map(Px p, string[] rows, int ox, int oy)
        {
            for (int y = 0; y < rows.Length; y++) for (int x = 0; x < rows[y].Length; x++) { char c = rows[y][x]; if (c != '.' && Pal.TryGetValue(c, out var col)) p.Set(ox + x, oy + y, col); }
        }

        static void Draw(Px p, int row, int f)
        {
            const int ox = 1, oy = 1, ground = 30; // última linha da bota (sem contorno)
            int bob = f == 2 || f == 4 ? -1 : 0;   // nos quadros de passagem o corpo sobe 1 px
            var P = Pal['P']; var Pd = Pal['p']; var O = Pal['O']; var Od = Pal['o'];
            if (row < 2)
            {
                int liftL = f == 1 ? 1 : 0, liftR = f == 3 ? 1 : 0; bool back = row == 1;
                void Leg(int x0, int lift, bool left)
                {
                    int top = 26 + bob, bootY = ground - 1 - lift;
                    for (int y = top; y < bootY; y++) { p.Set(ox + x0, oy + y, left ? P : Pd); p.Set(ox + x0 + 1, oy + y, P); p.Set(ox + x0 + 2, oy + y, left ? Pd : P); }
                    for (int x = 0; x < 3; x++) p.Set(ox + x0 + x, oy + bootY, O);
                    int bx = left ? x0 - 1 : x0; for (int x = 0; x < 4; x++) p.Set(ox + bx + x, oy + bootY + 1, x == (left ? 0 : 3) ? Od : O);
                    if (back) p.Set(ox + x0 + 1, oy + bootY, Od);
                }
                Leg(4, liftL, true); Leg(9, liftR, false);
                Map(p, row == 0 ? Front : Back, ox, oy + bob);
            }
            else
            {
                int sw = f == 1 ? 2 : f == 3 ? -2 : f == 2 || f == 4 ? 0 : 0;
                void Leg(int dx, bool backLeg)
                {
                    int x0 = 7 + dx, top = 26 + bob; var c = backLeg ? Pd : P;
                    for (int y = top; y < ground - 1; y++) for (int x = 0; x < 3; x++) p.Set(ox + x0 + x, oy + y, x == 0 ? Pd : c);
                    for (int x = 0; x < 3; x++) p.Set(ox + x0 + x, oy + ground - 1, backLeg ? Od : O);
                    for (int x = 0; x < 4; x++) p.Set(ox + x0 + x, oy + ground, x == 3 ? Od : (backLeg ? Od : O));
                }
                Leg(-sw, true); Leg(sw, false);
                Map(p, Side, ox, oy + bob);
                // braço da frente balança para trás e para a frente
                if (sw != 0) { int ax = sw > 0 ? 9 : 7; p.Set(ox + ax, oy + 22 + bob, Pal['S']); p.Set(ox + ax + 1, oy + 22 + bob, Pal['S']); p.Set(ox + 8, oy + 22 + bob, sw > 0 ? Pal['b'] : Pal['S']); }
            }
        }
    }
}
