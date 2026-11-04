// Terra de Crinas — IA do cavalo solto. Estados com metas e motivos reais (não animação aleatória):
// pastar, andar, beber perto da água, cochilar à noite, deitar quando cansado, vir investigar (curioso),
// procurar o jogador (carinhoso), atender ao chamado (ou não, se independente), fugir (selvagem ou assustado),
// seguir a manada (selvagens) e relinchar.
using System;
using Crinas.Core;

namespace Crinas.Horses
{
    /// <summary>O que a IA precisa saber do mundo (implementado pelo mundo do jogo; nos testes, por um falso).</summary>
    public interface IWorldQuery
    {
        bool Blocked(float x, float y);
        /// <summary>Ponto de água mais perto dentro do raio (ou false).</summary>
        bool FindWater(float x, float y, float radius, out float wx, out float wy);
        /// <summary>0 = dia, 1 = noite fechada.</summary>
        float Night { get; }
    }

    public enum AIState { Idle, Graze, Wander, Drink, Doze, Lie, Approach, Follow, Flee, Neigh }

    public sealed class HorseAI
    {
        public AIState State = AIState.Idle;
        public float T;            // tempo restante no estado
        public float TX, TY;       // alvo
        public Gait Gait = Gait.Stop;
        public float VX, VY;       // velocidade calculada no quadro
        public float HomeX, HomeY, HomeR = 160; // área de vida (manada ou pasto)
        public bool Called;        // jogador assobiou
        bool toWater;              // o passeio atual termina bebendo água
        readonly Rng rng;
        public HorseAI(Rng r) { rng = r; }

        /// <summary>Animação que combina com o estado e a andadura.</summary>
        public string Anim
        {
            get
            {
                if (Gait >= Gait.Walk) return Gait == Gait.Walk ? "walk" : Gait == Gait.Trot ? "trot" : "gallop";
                switch (State) { case AIState.Graze: return "eat"; case AIState.Drink: return "drink"; case AIState.Doze: return "doze"; case AIState.Lie: return "lie"; case AIState.Neigh: return "neigh"; case AIState.Flee: return "scared"; default: return "idle"; }
            }
        }

        /// <summary>Um passo da IA. px,py = jogador; playerMounted = jogador montado em outro cavalo.</summary>
        public string Update(Horse h, IWorldQuery w, float px, float py, float dt)
        {
            var b = h.Behavior; string msg = null; T -= dt;
            float dx = px - h.X, dy = py - h.Y, dist = (float)Math.Sqrt(dx * dx + dy * dy);
            // 1) selvagem: foge quando o jogador chega perto (distância de fuga depende da sensibilidade e da confiança)
            if (!h.Tamed)
            {
                float flee = 70 + h.A(Attr.Sensibilidade) * 0.9f - h.Trust * 0.8f;
                if (dist < flee && State != AIState.Flee) { State = AIState.Flee; T = rng.Range(2.5f, 4f); }
            }
            // 2) chamado pelo assobio: o independente às vezes ignora
            if (Called && h.Tamed)
            {
                Called = false;
                if (rng.Chance(b.Independence)) { msg = h.Name + " ouviu, mas preferiu ficar onde estava."; State = AIState.Graze; T = 4; }
                else { State = AIState.Follow; T = 30; msg = h.Name + " atendeu ao chamado!"; }
            }
            // 3) escolhe novo estado quando o atual acaba
            if (T <= 0) Choose(h, w, b, dist);

            float spd = 0; Gait = Gait.Stop;
            switch (State)
            {
                case AIState.Flee:
                    {
                        float l = Math.Max(1, dist); TX = h.X - dx / l * 120; TY = h.Y - dy / l * 120;
                        Gait = dist < 60 ? Gait.Gallop : Gait.Trot; spd = GaitModel.Speed(h.Attr, Gait) * 0.85f;
                        if (dist > 220 || T <= 0) { State = AIState.Idle; T = rng.Range(1, 3); }
                        break;
                    }
                case AIState.Follow:
                    TX = px; TY = py; if (dist < 26) { State = AIState.Idle; T = rng.Range(3, 6); break; }
                    Gait = dist > 140 ? Gait.Gallop : dist > 60 ? Gait.Trot : Gait.Walk; spd = GaitModel.Speed(h.Attr, Gait); break;
                case AIState.Approach:
                    TX = px; TY = py; if (dist < 28) { State = rng.Chance(0.4f) ? AIState.Neigh : AIState.Idle; T = State == AIState.Neigh ? 1.2f : rng.Range(2, 5); break; }
                    if (dist > 150) { State = AIState.Idle; T = 1; break; }
                    Gait = Gait.Walk; spd = GaitModel.Speed(h.Attr, Gait) * 0.8f; break;
                case AIState.Wander:
                    {
                        float ex = TX - h.X, ey = TY - h.Y, el = (float)Math.Sqrt(ex * ex + ey * ey);
                        if (el < 4) { if (toWater) { State = AIState.Drink; T = rng.Range(3, 6); toWater = false; } else { State = AIState.Graze; T = rng.Range(3, 8); } break; }
                        Gait = Gait.Walk; spd = GaitModel.Speed(h.Attr, Gait) * 0.75f; break;
                    }
            }
            if (spd > 0)
            {
                float ex = TX - h.X, ey = TY - h.Y, el = Math.Max(0.001f, (float)Math.Sqrt(ex * ex + ey * ey));
                VX = ex / el * spd; VY = ey / el * spd;
                float nx = h.X + VX * dt, ny = h.Y + VY * dt;
                if (!w.Blocked(nx, h.Y)) h.X = nx; else VX = 0;
                if (!w.Blocked(h.X, ny)) h.Y = ny; else VY = 0;
                if (VX == 0 && VY == 0 && State != AIState.Flee) { State = AIState.Idle; T = 1; toWater = false; }
            }
            else { VX = VY = 0; }
            h.Stamina = Math.Clamp(h.Stamina + GaitModel.StaminaRate(h.Attr, Gait, b.Laziness) * dt, 0, 100);
            return msg;
        }

        void Choose(Horse h, IWorldQuery w, Behavior b, float dist)
        {
            float night = w.Night;
            // de noite cochila; cansado deita
            if (night > 0.6f && rng.Chance(0.7f)) { State = rng.Chance(0.25f) ? AIState.Lie : AIState.Doze; T = rng.Range(8, 20); return; }
            if (h.Stamina < 30 && rng.Chance(0.5f)) { State = AIState.Lie; T = rng.Range(6, 12); return; }
            // domado: vem até o jogador por curiosidade ou carinho
            if (h.Tamed && dist < 130 && dist > 34 && rng.Chance(Math.Min(0.8f, b.Curiosity * 0.4f + b.Affection * 0.4f)))
            { State = AIState.Approach; T = 8; return; }
            if (rng.Chance(0.18f) && w.FindWater(h.X, h.Y, 140, out float wx, out float wy)) { State = AIState.Wander; toWater = true; TX = wx; TY = wy; T = 20; return; }
            float r = rng.Next();
            if (r < 0.5f) { State = AIState.Graze; T = rng.Range(4, 10) * b.Laziness; }
            else if (r < 0.62f) { State = AIState.Neigh; T = 1.2f; }
            else if (r < 0.72f) { State = AIState.Idle; T = rng.Range(2, 5); }
            else
            {
                // passeia dentro da área de vida
                for (int k = 0; k < 6; k++)
                {
                    float a = rng.Range(0, 6.283f), rr = rng.Range(20, HomeR);
                    float x = HomeX + (float)Math.Cos(a) * rr, y = HomeY + (float)Math.Sin(a) * rr;
                    if (!w.Blocked(x, y)) { State = AIState.Wander; TX = x; TY = y; T = 25; return; }
                }
                State = AIState.Graze; T = 4;
            }
        }
    }
}
