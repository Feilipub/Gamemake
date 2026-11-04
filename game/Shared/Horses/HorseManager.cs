// Terra de Crinas — HorseManager: guarda todos os cavalos (com identidade persistente), roda a IA dos soltos,
// cria a manada selvagem do vale e escolhe o quadro de animação certo de cada um (vista, andadura, pose).
using System;
using System.Collections.Generic;
using Crinas.Core;
using Crinas.World;

namespace Crinas.Horses
{
    /// <summary>Estado visual do cavalo (separado dos dados): distância andada, tempo da pose, vista e espelho.</summary>
    public sealed class HorseVisual
    {
        public float Dist, AnimT, FX = 1, FY;  // FX/FY = direção para onde olha
        public string Anim = "idle", LastAnim = "idle";
        public bool Back;                      // andando de ré
    }

    /// <summary>Liga a IA ao mundo real (colisão, água, noite).</summary>
    public sealed class WorldQuery : IWorldQuery
    {
        readonly ChunkStreamingManager w; public float NightValue;
        public WorldQuery(ChunkStreamingManager world) { w = world; }
        public bool Blocked(float x, float y) => w.Blocked(x, y, false) || w.Blocked(x - 6, y, false) || w.Blocked(x + 6, y, false);
        public bool FindWater(float x, float y, float radius, out float wx, out float wy) => w.FindShore(x, y, radius, out wx, out wy);
        public float Night => NightValue;
    }

    public sealed class HorseManager
    {
        public readonly List<Horse> Horses = new List<Horse>();
        public readonly Dictionary<string, HorseAI> AI = new Dictionary<string, HorseAI>();
        public readonly Dictionary<string, HorseVisual> Vis = new Dictionary<string, HorseVisual>();
        readonly Rng rng;
        public HorseManager(Rng r) { rng = r; }

        public Horse Find(string id) { foreach (var h in Horses) if (h.Id == id) return h; return null; }

        public void Add(Horse h, float homeX, float homeY, float homeR)
        {
            Horses.Add(h); AI[h.Id] = new HorseAI(new Rng(rng.NextU64())) { HomeX = homeX, HomeY = homeY, HomeR = homeR }; Vis[h.Id] = new HorseVisual();
        }

        /// <summary>Manada selvagem num campo perto do rancho (sem dono, desconfiada).</summary>
        public void SpawnWildHerd(ChunkStreamingManager w, float cx, float cy)
        {
            string[] breeds = { "mustang", "mustang", "crioulo", "arabe", "appaloosa" };
            int n = 0;
            for (int k = 0; k < 40 && n < breeds.Length; k++)
            {
                float x = cx + rng.Range(-60, 60), y = cy + rng.Range(-40, 40); if (w.Blocked(x, y, false)) continue;
                var h = Horse.Create(rng, breeds[n]); h.X = x; h.Y = y; h.Tamed = false; h.Owned = false; h.Trust = 0;
                h.History = "Nasceu livre nos campos do vale."; Add(h, cx, cy, 150); n++;
            }
        }

        /// <summary>Atualiza os cavalos soltos (o montado é controlado pelo RideController). Devolve mensagens para a tela.</summary>
        public List<string> Update(IWorldQuery w, float px, float py, string mountedId, float dt)
        {
            var msgs = new List<string>();
            foreach (var h in Horses)
            {
                var v = Vis[h.Id];
                if (h.Id == mountedId) continue;
                var ai = AI[h.Id];
                // longe demais da câmera: simulação econômica (só o fôlego e o tempo do estado)
                float dx = h.X - px, dy = h.Y - py; bool far = dx * dx + dy * dy > 900 * 900;
                if (far) { ai.T -= dt; h.Stamina = Math.Min(100, h.Stamina + dt * 4); continue; }
                var m = ai.Update(h, w, px, py, dt); if (m != null) msgs.Add(m);
                float sp = (float)Math.Sqrt(ai.VX * ai.VX + ai.VY * ai.VY);
                if (sp > 1) { v.FX = ai.VX / sp; v.FY = ai.VY / sp; v.Dist += sp * dt; }
                SetAnim(v, ai.Anim, dt);
            }
            return msgs;
        }

        public static void SetAnim(HorseVisual v, string anim, float dt)
        {
            if (anim != v.Anim) { v.LastAnim = v.Anim; v.Anim = anim; v.AnimT = 0; }
            v.AnimT += dt;
        }

        /// <summary>Vista do desenho a partir da direção: lado (com espelho), frente (descendo) ou costas (subindo).</summary>
        public static (string view, bool flip) View(float fx, float fy)
        {
            if (Math.Abs(fx) >= Math.Abs(fy) * 0.8f) return ("side", fx < 0);
            return (fy > 0 ? "front" : "back", false);
        }

        /// <summary>Índice do quadro: andaduras pela distância percorrida (pés não escorregam), poses pelo tempo.</summary>
        public static int FrameIndex(HorseVisual v, int n, float cycle)
        {
            string a = v.Anim;
            if (a == "walk" || a == "trot" || a == "gallop")
            {
                int i = (int)((v.Dist / Math.Max(1, cycle) % 1) * n) % n; return v.Back ? (n - 1 - i) : i;
            }
            float fps = a == "eat" ? 2.2f : a == "drink" ? 2f : a == "doze" || a == "lie" ? 0.7f : a == "scared" ? 6f : a == "rear" ? 5f : a == "neigh" ? 4f : 0;
            if (a == "rear") return Math.Min(n - 1, (int)(v.AnimT * fps));
            if (a == "idle") { float ph = v.AnimT % 6.3f; return Math.Min(n - 1, ph < 4.6f ? 0 : ph < 5.2f ? 1 : ph < 5.8f ? 2 : 3); }
            return (int)(v.AnimT * fps) % Math.Max(1, n);
        }
    }
}
