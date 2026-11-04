// Lida no Sertão (MonoGame) — vaqueiro e animais.
using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.Xna.Framework;

namespace Lida
{
    /// <summary>O vaqueiro: anda, corre e esbarra nas cercas e construções.</summary>
    public class Player
    {
        public Vector2 Pos; public int Dir; // 0 baixo, 1 cima, 2 esquerda (espelho de 3), 3 direita
        public float Dist, AnimT; public bool Moving, Running;
        public float Energy = 100;
        public Dictionary<string, string[]> Frames = new Dictionary<string, string[]>();
        const float HW = 5, HH = 3; // meia caixa de colisão nos pés

        public void Update(World w, Vector2 input, bool run, float dt)
        {
            Moving = input.LengthSquared() > 0.04f; Running = run && Moving && Energy > 2; AnimT += dt;
            if (!Moving) return;
            if (input.Length() > 1) input.Normalize();
            float sp = (Running ? 108 : 62) * dt; var d = input * sp;
            if (Math.Abs(input.X) > Math.Abs(input.Y)) Dir = input.X < 0 ? 2 : 3; else Dir = input.Y < 0 ? 1 : 0;
            // move por eixo: desliza na parede em vez de travar
            if (!w.BoxHit(Pos.X + d.X - HW, Pos.Y - HH, Pos.X + d.X + HW, Pos.Y + HH, false)) Pos.X += d.X;
            if (!w.BoxHit(Pos.X - HW, Pos.Y + d.Y - HH, Pos.X + HW, Pos.Y + d.Y + HH, false)) Pos.Y += d.Y;
            Dist += d.Length();
            if (Running) Energy = Math.Max(0, Energy - dt * 1.2f);
        }

        /// <summary>Quadro atual (chave do sprite) e se deve espelhar.</summary>
        public (string key, bool flip) Frame()
        {
            int d = Dir == 2 ? 3 : Dir; string pose = !Moving ? "idle" : Running ? "run" : "walk";
            if (!Frames.TryGetValue(d + pose, out var fr) || fr.Length == 0) return (null, false);
            int i = pose == "idle" ? ((int)(AnimT * 1.6f) % 6 == 5 ? 1 : 0) : (int)(Dist / (Running ? 26f : 22f) * fr.Length) % fr.Length;
            return (fr[i % fr.Length], Dir == 2);
        }
    }

    /// <summary>Animal: pasta, anda pelo cercado, descansa e se afasta do vaqueiro (a tocada básica).</summary>
    public class Animal
    {
        public int Id; public string Sp, Breed, Name, Own, AreaKey; public bool Main;
        public Vector2 Pos, Target; public int Face = 1; public string Pose = "idle"; public float T, Dist, Speed, Wait;
        public Dictionary<string, string[]> Look = new Dictionary<string, string[]>();
        public Dictionary<string, float> Cyc = new Dictionary<string, float>();
        static readonly Random Rnd = new Random(7);

        public static Animal From(JsonElement a)
        {
            var an = new Animal { Id = a.GetProperty("id").GetInt32(), Sp = a.GetProperty("sp").GetString(), Breed = a.GetProperty("br").GetString(), Name = a.GetProperty("n").GetString(), Own = a.GetProperty("own").GetString(), AreaKey = a.GetProperty("area").GetString(), Main = a.GetProperty("main").GetInt32() == 1, Pos = new Vector2(a.GetProperty("x").GetSingle(), a.GetProperty("y").GetSingle()) };
            foreach (var p in a.GetProperty("look").EnumerateObject())
            {
                if (p.Name == "cyc") { foreach (var c in p.Value.EnumerateObject()) an.Cyc[c.Name] = c.Value.GetSingle(); continue; }
                var l = new List<string>(); foreach (var k in p.Value.EnumerateArray()) l.Add(k.GetString()); an.Look[p.Name] = l.ToArray();
            }
            an.Target = an.Pos; an.Wait = (float)Rnd.NextDouble() * 4; return an;
        }

        public void Update(World w, Player pl, float dt, Animal dogOwnerFollow = null)
        {
            T += dt; var area = w.AreaAt(Pos.X, Pos.Y);
            // cachorro segue o vaqueiro de perto
            if (Sp == "cao" && Own == "player") { var to = pl.Pos + new Vector2(pl.Dir == 2 ? 22 : -22, 3); MoveTo(w, to, (to - Pos).Length() > 60 ? 90 : 55, dt, 14); return; }
            // vaqueiro perto: o gado se afasta (zona de fuga)
            var away = Pos - pl.Pos; float d = away.Length();
            if (d < 42 && Sp != "galinha" && !(Main && Sp == "cavalo"))
            {
                away.Normalize(); var to = Pos + away * 40; Pose = "walk"; MoveTo(w, to, d < 24 ? 46 : 30, dt, 0); return;
            }
            if (Wait > 0) { Wait -= dt; if (Pose == "walk") Pose = Rnd.NextDouble() < 0.6 ? "eat" : "idle"; return; }
            if ((Target - Pos).Length() < 3)
            {
                Wait = 2 + (float)Rnd.NextDouble() * 6; Pose = Rnd.NextDouble() < 0.55 ? "eat" : Rnd.NextDouble() < 0.2 ? "lie" : "idle";
                // próximo ponto: dentro do cercado (ou perto de onde está, se estiver solto)
                if (area != null) Target = new Vector2((area.X0 + 1 + (float)Rnd.NextDouble() * (area.X1 - area.X0 - 2)) * w.TS, (area.Y0 + 1 + (float)Rnd.NextDouble() * (area.Y1 - area.Y0 - 2)) * w.TS);
                else Target = Pos + new Vector2((float)(Rnd.NextDouble() - 0.5) * 80, (float)(Rnd.NextDouble() - 0.5) * 60);
                return;
            }
            Pose = "walk"; MoveTo(w, Target, Sp == "galinha" ? 12 : 14, dt, 0);
        }

        void MoveTo(World w, Vector2 to, float sp, float dt, float stopAt)
        {
            var dv = to - Pos; float l = dv.Length(); if (l <= stopAt + 0.5f) { if (Sp == "cao") Pose = "idle"; return; }
            dv /= l; var step = dv * Math.Min(l, sp * dt); bool hitX = w.BoxHit(Pos.X + step.X - 6, Pos.Y - 3, Pos.X + step.X + 6, Pos.Y + 3, true), hitY = w.BoxHit(Pos.X - 6, Pos.Y + step.Y - 3, Pos.X + 6, Pos.Y + step.Y + 3, true);
            if (!hitX) Pos.X += step.X; if (!hitY) Pos.Y += step.Y;
            if (hitX && hitY) { Target = Pos; Wait = 1; }
            if (Math.Abs(step.X) > 0.01f) Face = step.X < 0 ? -1 : 1;
            Dist += step.Length(); Speed = sp; if (Sp == "cao") Pose = "walk";
        }

        /// <summary>Quadro atual e espelho (o desenho de lado olha para a direita).</summary>
        public (string key, bool flip) Frame()
        {
            string an = Pose == "walk" ? (Speed > 40 && Look.ContainsKey("trot") ? "trot" : "walk") : Pose;
            if (!Look.TryGetValue(an, out var fr) || fr.Length == 0) { if (!Look.TryGetValue("idle", out fr) || fr.Length == 0) return (null, false); an = "idle"; }
            int i;
            if (an == "walk" || an == "trot" || an == "gallop") { float cyc = Cyc.TryGetValue(an, out var c) ? c : 20; i = (int)((Dist / cyc % 1) * fr.Length) % fr.Length; }
            else if (an == "eat") i = (int)(T * 2.2f) % fr.Length;
            else if (an == "lie") i = (int)(T * 0.7f) % fr.Length;
            else { float ph = (T + Id * 0.37f) % 6.3f; i = Math.Min(fr.Length - 1, ph < 4.8f ? 0 : ph < 5.3f ? 1 : ph < 5.8f ? 2 : 3); }
            return (fr[i], Face < 0);
        }
    }
}
