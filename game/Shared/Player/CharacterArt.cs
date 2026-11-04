// Terra de Crinas — personagem desenhado pixel a pixel (16×32), com aparência escolhida na criação:
// tom de pele, cor e comprimento do cabelo, cor da roupa e chapéu (sem, couro, palha, preto).
// Gera a folha: frente, costas e lado (parado + 4 passos) e as poses montado (lado, frente, costas).
using System;
using System.Collections.Generic;
using Crinas.Core;
using Crinas.Render;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Crinas.Player
{
    public sealed class CharacterArt
    {
        public const int FW = 18, FH = 34;
        public static readonly Vector2 Foot = new Vector2(9, 32), Seat = new Vector2(9, 25);
        public Texture2D Sheet; // linhas 0 frente, 1 costas, 2 lado (5 quadros); linha 3 montado: 0 lado, 1 frente, 2 costas
        public Rectangle Src(int row, int f) => new Rectangle(f * FW, row * FH, FW, FH);

        public static readonly string[] SkinNames = { "Clara", "Morena clara", "Morena", "Negra" };
        public static readonly Color[][] Skins = { new[] { new Color(246, 202, 160), new Color(216, 162, 122) }, new[] { new Color(226, 172, 126), new Color(190, 134, 94) }, new[] { new Color(182, 124, 84), new Color(146, 94, 60) }, new[] { new Color(128, 84, 56), new Color(98, 62, 40) } };
        public static readonly string[] HairColorNames = { "Castanho", "Preto", "Loiro", "Ruivo", "Grisalho" };
        public static readonly Color[][] Hairs = { new[] { new Color(84, 52, 30), new Color(60, 36, 20) }, new[] { new Color(42, 34, 32), new Color(26, 20, 20) }, new[] { new Color(226, 186, 96), new Color(186, 146, 64) }, new[] { new Color(184, 82, 40), new Color(140, 56, 28) }, new[] { new Color(176, 172, 168), new Color(132, 128, 126) } };
        public static readonly string[] HairNames = { "Curto", "Comprido" };
        public static readonly string[] OutfitNames = { "Couro", "Azul", "Verde", "Vinho", "Cinza" };
        public static readonly Color[][] Outfits = { new[] { new Color(178, 112, 58), new Color(136, 82, 40), new Color(216, 154, 90) }, new[] { new Color(78, 110, 170), new Color(56, 82, 134), new Color(120, 152, 204) }, new[] { new Color(90, 140, 80), new Color(64, 104, 58), new Color(132, 180, 110) }, new[] { new Color(150, 54, 64), new Color(112, 36, 46), new Color(196, 90, 98) }, new[] { new Color(120, 120, 124), new Color(86, 86, 92), new Color(164, 164, 170) } };
        public static readonly string[] HatNames = { "Sem chapéu", "Couro", "Palha", "Preto" };
        static readonly Color[][] Hats = { null, new[] { new Color(166, 106, 54), new Color(134, 82, 38), new Color(96, 56, 26) }, new[] { new Color(226, 196, 118), new Color(196, 162, 88), new Color(150, 116, 56) }, new[] { new Color(58, 52, 56), new Color(40, 36, 40), new Color(24, 22, 26) } };
        static readonly Color Ink = new Color(44, 28, 20);

        static readonly string[] Front =
        {
            "................", "................", "......hhhh......", ".....hhyyhh.....", "....hhyyyyhh....", "....hhhyyhhh....", "...HhhhhhhhhH...", "..HHddddddddHH..", ".dHHHHHHHHHHHHd.",
            "...dBBBBBBBBd...", "...BSSSSSSSSB...", "...SSkSSSSkSS...", "...SSkSSSSkSS...", "...sSmSSSSmSs...", "....sSSMMSSs....",
            ".....RRRRRR.....", "...JJRRrrRRJJ...", "..JJLJWrrWJLJJ..", ".JjJLJWWWWJLJjJ.", ".JjJLJWWWWJLJjJ.", ".JjJJJWWWWJJJjJ.", ".JjjJJWWWWJJjjJ.", ".SsbbbbyybbbbsS.", ".ss.PPPPPPPP.ss.", "....PPPPPPPP....", "....PPPPPPPP....",
        };
        static readonly string[] Back =
        {
            "................", "................", "......hhhh......", ".....hhhhhh.....", "....hhhhhhhh....", "....hhhhhhhh....", "...HhhhhhhhhH...", "..HHddddddddHH..", ".dHHHHHHHHHHHHd.",
            "...dBBBBBBBBd...", "...nBBBBBBBBn...", "...nBBBBBBBBn...", "...nBBBBBBBBn...", "...snBBBBBBns...", "....sSSSSSSs....",
            ".....RRRRRR.....", "...JJJrRRrJJJ...", "..JJJJJJJJJJJJ..", ".JjJJJjJJjJJJjJ.", ".JjJJJjJJjJJJjJ.", ".JjJJJJJJJJJJjJ.", ".JjjJJJJJJJJjjJ.", ".SsbbbbbbbbbbsS.", ".ss.PPPPPPPP.ss.", "....PPPPPPPP....", "....PPPPPPPP....",
        };
        static readonly string[] Side =
        {
            "................", "................", "......hhhh......", ".....hhhhhh.h...", ".....hhhhhhhyh..", "....hhhhhhhhhh..", "....Hhhhhhhhhh..", "...dddddddddHH..", ".HHHHHHHHHHHHHd.",
            "....dBBBSSSd....", "....BBBSSSSS....", "....BBSSSkSS....", "....BBsSSkSSS...", "....BsSSSSmS....", ".....sSSSSs.....",
            "......RRRRR.....", ".....JJRRrRR....", ".....JJJJJWW....", ".....JJjjJWW....", ".....JJjjJWW....", ".....JJjjJJJ....", ".....JJjjJJJ....", ".....bbbSSbyb...", "......PPPPPP....", "......PPPPPP....", "......PPPPPP....",
        };
        // topo da cabeça sem chapéu (linhas 5..9)
        static readonly string[] FrontBare = { "................", "....BBBBBBBB....", "...BBBBBBBBBB...", "...BBBBBBBBBB...", "...BBSSSSSSBB..." };
        static readonly string[] BackBare = { "................", "....BBBBBBBB....", "...BBBBBBBBBB...", "...BBBBBBBBBB...", "...nBBBBBBBBn..." };
        static readonly string[] SideBare = { "................", ".....BBBBBB.....", "....BBBBBBBB....", "....BBBBBBBBB...", "....BBBBSSSB...." };

        public CharacterArt(GraphicsDevice gd, CharacterLook look)
        {
            var pal = Palette(look);
            var all = new Color[FW * 5 * FH * 4];
            void Put(Px p, int row, int col) { for (int y = 0; y < FH; y++) for (int x = 0; x < FW; x++) all[(row * FH + y) * FW * 5 + col * FW + x] = p.P[y * FW + x]; }
            for (int row = 0; row < 3; row++) for (int f = 0; f < 5; f++) { var p = new Px(FW, FH); Draw(p, row, f, look, pal); p.Outline(Ink); Put(p, row, f); }
            for (int v = 0; v < 3; v++) { var p = new Px(FW, FH); Ride(p, v, look, pal); p.Outline(Ink); Put(p, 3, v); }
            Sheet = new Texture2D(gd, FW * 5, FH * 4); Sheet.SetData(all);
        }

        static Dictionary<char, Color> Palette(CharacterLook l)
        {
            var sk = Skins[Math.Clamp(l.Skin, 0, Skins.Length - 1)]; var hr = Hairs[Math.Clamp(l.HairColor, 0, Hairs.Length - 1)]; var o = Outfits[Math.Clamp(l.Outfit, 0, Outfits.Length - 1)];
            var ht = Hats[Math.Clamp(l.Hat, 0, Hats.Length - 1)] ?? Hats[1];
            return new Dictionary<char, Color>
            {
                ['h'] = ht[0], ['H'] = ht[1], ['d'] = ht[2], ['y'] = l.Hat == 3 ? new Color(200, 200, 210) : new Color(238, 200, 98),
                ['B'] = hr[0], ['n'] = hr[1], ['S'] = sk[0], ['s'] = sk[1], ['k'] = new Color(50, 32, 26), ['m'] = Color.Lerp(sk[0], new Color(240, 140, 130), 0.4f), ['M'] = Color.Lerp(sk[1], new Color(150, 70, 60), 0.45f),
                ['R'] = new Color(212, 60, 46), ['r'] = new Color(158, 38, 30), ['J'] = o[0], ['j'] = o[1], ['L'] = o[2], ['W'] = new Color(242, 234, 214),
                ['b'] = new Color(84, 50, 26), ['P'] = new Color(74, 94, 140), ['p'] = new Color(54, 70, 108), ['O'] = new Color(112, 66, 34), ['o'] = new Color(78, 44, 20),
            };
        }

        static string[] Rows(int row, CharacterLook l)
        {
            var src = row == 0 ? Front : row == 1 ? Back : Side; var r = (string[])src.Clone();
            if (l.Hat == 0)
            {
                var bare = row == 0 ? FrontBare : row == 1 ? BackBare : SideBare;
                for (int i = 0; i < 5; i++) r[2 + i] = "................";
                for (int i = 0; i < 5; i++) r[5 + i] = bare[i];
                r[2] = r[3] = r[4] = "................";
            }
            if (l.Hair == 1) // cabelo comprido caindo nos ombros
            {
                for (int y = 10; y <= 17; y++)
                {
                    var ch = r[y].ToCharArray();
                    if (row == 0) { ch[2] = 'B'; ch[13] = 'B'; if (y > 14) { ch[3] = 'n'; ch[12] = 'n'; } }
                    else if (row == 1) { for (int x = 3; x <= 12; x++) if (y > 13) ch[x] = x == 3 || x == 12 ? 'n' : 'B'; }
                    else { ch[3] = 'B'; ch[4] = 'B'; if (y > 14) ch[5] = 'n'; }
                    r[y] = new string(ch);
                }
            }
            return r;
        }

        static void Map(Px p, string[] rows, int ox, int oy, Dictionary<char, Color> pal, int maxRow = 99)
        {
            for (int y = 0; y < rows.Length && y <= maxRow; y++) for (int x = 0; x < rows[y].Length; x++) { char c = rows[y][x]; if (c != '.' && pal.TryGetValue(c, out var col)) p.Set(ox + x, oy + y, col); }
        }

        static void Draw(Px p, int row, int f, CharacterLook l, Dictionary<char, Color> pal)
        {
            const int ox = 1, oy = 1, ground = 30;
            int bob = f == 2 || f == 4 ? -1 : 0;
            var P = pal['P']; var Pd = pal['p']; var O = pal['O']; var Od = pal['o'];
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
                Map(p, Rows(row, l), ox, oy + bob, pal);
            }
            else
            {
                int sw = f == 1 ? 2 : f == 3 ? -2 : 0;
                void Leg(int dx, bool backLeg)
                {
                    int x0 = 7 + dx, top = 26 + bob; var c = backLeg ? Pd : P;
                    for (int y = top; y < ground - 1; y++) for (int x = 0; x < 3; x++) p.Set(ox + x0 + x, oy + y, x == 0 ? Pd : c);
                    for (int x = 0; x < 3; x++) p.Set(ox + x0 + x, oy + ground - 1, backLeg ? Od : O);
                    for (int x = 0; x < 4; x++) p.Set(ox + x0 + x, oy + ground, x == 3 ? Od : (backLeg ? Od : O));
                }
                Leg(-sw, true); Leg(sw, false);
                Map(p, Rows(2, l), ox, oy + bob, pal);
            }
        }

        /// <summary>Pose montado: tronco do quadro parado e pernas abertas sobre o cavalo. v: 0 lado, 1 frente, 2 costas.</summary>
        static void Ride(Px p, int v, CharacterLook l, Dictionary<char, Color> pal)
        {
            const int ox = 1, oy = 1; var P = pal['P']; var Pd = pal['p']; var O = pal['O']; var Od = pal['o'];
            int row = v == 0 ? 2 : v == 1 ? 0 : 1;
            Map(p, Rows(row, l), ox, oy, pal, 23);
            if (v == 0)
            {
                // coxa para a frente e canela para baixo (a outra perna fica escondida pelo cavalo)
                for (int x = 7; x <= 11; x++) { p.Set(ox + x, oy + 23, P); p.Set(ox + x, oy + 24, Pd); }
                for (int y = 25; y <= 27; y++) { p.Set(ox + 10, oy + y, P); p.Set(ox + 11, oy + y, Pd); }
                for (int x = 9; x <= 12; x++) { p.Set(ox + x, oy + 28, O); } p.Set(ox + 13, oy + 28, Od); for (int x = 9; x <= 13; x++) p.Set(ox + x, oy + 29, x == 13 ? Od : O);
            }
            else
            {
                // pernas abertas dos dois lados do cavalo
                for (int y = 23; y <= 27; y++) { int d = (y - 23) / 2; p.Set(ox + 3 - d, oy + y, P); p.Set(ox + 4 - d, oy + y, Pd); p.Set(ox + 11 + d, oy + y, Pd); p.Set(ox + 12 + d, oy + y, P); }
                for (int x = 0; x < 3; x++) { p.Set(ox + 0 + x, oy + 28, O); p.Set(ox + 13 + x, oy + 28, O); }
                for (int x = 4; x <= 11; x++) p.Set(ox + x, oy + 23, P);
            }
        }
    }
}
