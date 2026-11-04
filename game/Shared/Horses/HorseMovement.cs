// Terra de Crinas — andaduras e montaria. A velocidade, a aceleração, as curvas e o fôlego vêm dos atributos;
// a obediência, os sustos, a preguiça e o impulso vêm da personalidade. Tudo aqui é lógica pura (sem desenho),
// testável em Crinas.Tests.
using System;
using Crinas.Core;

namespace Crinas.Horses
{
    public enum Gait { Stop, Back, Walk, Trot, Gallop, Sprint }

    /// <summary>Eventos que a montaria emite para a interface e a animação.</summary>
    public enum RideEvent { None, Refused, Hesitated, Spooked, Reared, Impulse, Tired, LazyStop }

    public static class GaitModel
    {
        public static readonly string[] Name = { "Parado", "Ré", "Passo", "Trote", "Galope", "Disparada" };

        /// <summary>Velocidade máxima (px/s) da andadura para este cavalo.</summary>
        public static float Speed(float[] a, Gait g)
        {
            float vel = a[(int)Attr.Velocidade], agi = a[(int)Attr.Agilidade], equ = a[(int)Attr.Equilibrio];
            switch (g)
            {
                case Gait.Back: return 16f;
                case Gait.Walk: return 32f * (0.88f + equ / 420f);
                case Gait.Trot: return 66f * (0.82f + (vel + agi) / 560f);
                case Gait.Gallop: return 120f * (0.72f + vel / 220f);
                case Gait.Sprint: return 150f * (0.72f + vel / 200f);
                default: return 0;
            }
        }
        /// <summary>Aceleração (px/s²).</summary>
        public static float Accel(float[] a) => 70f + a[(int)Attr.Aceleracao] * 2.6f;
        /// <summary>Velocidade de giro (rad/s); cavalos ágeis viram mais fechado.</summary>
        public static float Turn(float[] a, Gait g) => (g >= Gait.Gallop ? 2.2f : 4.2f) * (0.7f + a[(int)Attr.Agilidade] / 180f);

        /// <summary>Variação do fôlego por segundo (negativo = gasta).</summary>
        public static float StaminaRate(float[] a, Gait g, float laziness)
        {
            float res = a[(int)Attr.Resistencia] / 100f, rec = a[(int)Attr.Recuperacao] / 100f;
            float drain = 1.45f - 0.9f * res; // 0.55 (muito resistente) .. 1.45 (pouco)
            switch (g)
            {
                case Gait.Sprint: return -12f * drain * laziness;
                case Gait.Gallop: return -4.6f * drain * laziness;
                case Gait.Trot: return -0.6f * drain * laziness + 1.2f * rec;
                case Gait.Walk: return 3.2f + 5f * rec;
                default: return 4.5f + 7f * rec;
            }
        }
    }

    /// <summary>Controla o cavalo montado: o jogador pede uma andadura e o cavalo responde conforme o seu jeito.</summary>
    public sealed class RideController
    {
        public Gait Current = Gait.Stop;
        public float Speed;          // velocidade atual (px/s)
        public float Heading;        // direção (rad)
        public float Lock;           // tempo em que o cavalo está "fazendo a dele" (refugo, empinada, preguiça)
        public RideEvent LockKind;
        float trotTime, gallopTime, impulseT;
        readonly Rng rng;
        public RideController(Rng r) { rng = r; }

        /// <summary>Avança a montaria. desired = andadura pedida; dir = direção pedida (rad) ou NaN se sem direção.
        /// envSpook = multiplicador do ambiente (noite, mata, água). Devolve o evento do quadro (se houver).</summary>
        public RideEvent Step(Horse h, Gait desired, float dir, float dt, float envSpook = 1f)
        {
            var bh = h.Behavior; var ev = RideEvent.None;
            // fôlego limita a andadura
            if (h.Stamina < 1 && desired >= Gait.Gallop) { desired = Gait.Trot; if (Current >= Gait.Gallop) ev = RideEvent.Tired; }
            else if (h.Stamina < 18 && desired == Gait.Sprint) desired = Gait.Gallop;

            if (Lock > 0) { Lock -= dt; desired = LockKind == RideEvent.Reared || LockKind == RideEvent.Spooked ? Gait.Stop : LockKind == RideEvent.LazyStop ? Gait.Stop : Current; }
            else
            {
                // sustos: mais quando rápido, à noite e na mata; vínculo e coragem reduzem
                float spk = bh.SpookPerMin / 60f * envSpook * (Current >= Gait.Gallop ? 1.4f : 1f) * dt;
                if (Current != Gait.Stop && rng.Chance(spk))
                {
                    bool rear = Current >= Gait.Trot && rng.Chance(bh.RearChance);
                    Lock = rear ? 1.3f : 0.8f; LockKind = rear ? RideEvent.Reared : RideEvent.Spooked; ev = LockKind; desired = Gait.Stop;
                }
                // pedido de acelerar: obediência decide se atende já, hesita ou recusa
                else if (desired > Current && desired >= Gait.Trot && Current != Gait.Back)
                {
                    float p = bh.Obedience; float roll = rng.Next();
                    if (roll > p) { bool refuse = roll > p + (1 - p) * 0.5f; Lock = refuse ? 1.2f : 0.5f; LockKind = refuse ? RideEvent.Refused : RideEvent.Hesitated; ev = LockKind; desired = Current; }
                }
                // impulso: no trote, o impulsivo dispara no galope por conta própria
                if (ev == RideEvent.None && desired == Gait.Trot && Current == Gait.Trot)
                {
                    trotTime += dt; if (trotTime > 2 && rng.Chance(bh.ImpulsePerMin / 60f * dt)) { impulseT = 1.6f; ev = RideEvent.Impulse; }
                }
                else trotTime = 0;
                if (impulseT > 0) { impulseT -= dt; if (desired == Gait.Trot) desired = Gait.Gallop; else impulseT = 0; }
                // preguiça: galope longo com pouco fôlego -> ele diminui sozinho
                if (desired >= Gait.Gallop) { gallopTime += dt; if (gallopTime > 5 && h.Stamina < 55 && rng.Chance((bh.Laziness - 0.95f) * 0.35f * dt)) { Lock = 1.5f; LockKind = RideEvent.LazyStop; ev = RideEvent.LazyStop; desired = Gait.Trot; } }
                else gallopTime = 0;
            }
            if (LockKind == RideEvent.LazyStop && Lock > 0) desired = Gait.Trot;

            // velocidade suave até a meta da andadura
            float target = GaitModel.Speed(h.Attr, desired);
            float acc = GaitModel.Accel(h.Attr) * (target < Speed ? 1.6f : 1f);
            Speed = Speed < target ? Math.Min(target, Speed + acc * dt) : Math.Max(target, Speed - acc * dt);
            Current = desired == Gait.Stop && Speed > 1 ? (Speed > GaitModel.Speed(h.Attr, Gait.Trot) * 1.05f ? Gait.Gallop : Speed > GaitModel.Speed(h.Attr, Gait.Walk) * 1.1f ? Gait.Trot : Gait.Walk) : desired;
            if (desired == Gait.Stop && Speed <= 1) { Current = Gait.Stop; Speed = 0; }

            // direção: gira até a direção pedida, limitado pela agilidade
            if (!float.IsNaN(dir) && desired != Gait.Back)
            {
                float d = WrapPi(dir - Heading), turn = GaitModel.Turn(h.Attr, Current) * dt;
                Heading = WrapPi(Heading + Math.Clamp(d, -turn, turn));
            }
            h.Stamina = Math.Clamp(h.Stamina + GaitModel.StaminaRate(h.Attr, Current, bh.Laziness) * dt, 0, 100);
            return ev;
        }

        public static float WrapPi(float a) { while (a > Math.PI) a -= (float)(2 * Math.PI); while (a < -Math.PI) a += (float)(2 * Math.PI); return a; }

        public static string Message(RideEvent e, Horse h)
        {
            switch (e)
            {
                case RideEvent.Refused: return h.Name + " empacou e não quis acelerar.";
                case RideEvent.Hesitated: return h.Name + " hesitou antes de obedecer.";
                case RideEvent.Spooked: return h.Name + " se assustou e refugou!";
                case RideEvent.Reared: return h.Name + " empinou de susto!";
                case RideEvent.Impulse: return h.Name + " se empolgou e disparou no galope!";
                case RideEvent.Tired: return h.Name + " está sem fôlego.";
                case RideEvent.LazyStop: return h.Name + " diminuiu o ritmo por conta própria.";
                default: return null;
            }
        }
    }
}
