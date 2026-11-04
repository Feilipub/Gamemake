// Terra de Crinas — personalidade. Cada cavalo recebe 2 ou 3 traços (combinações livres, menos as contraditórias)
// e o perfil de comportamento resultante (Behavior) é o que a IA e a montaria usam de verdade: obediência, sustos,
// preguiça, impulso, curiosidade, afeto, independência, competição e aprendizado.
using System;
using System.Collections.Generic;
using Crinas.Core;

namespace Crinas.Horses
{
    public enum Trait { Docil, Corajoso, Assustadico, Teimoso, Curioso, Preguicoso, Competitivo, Territorial, Carinhoso, Independente, Inteligente, Impulsivo }

    public sealed class TraitDef { public Trait T; public string Name, Desc; }

    /// <summary>Números de comportamento derivados de atributos + traços + vínculo. Todos usados na jogabilidade.</summary>
    public struct Behavior
    {
        /// <summary>Probabilidade (0..1) de atender de pronto a um pedido de andadura mais rápida.</summary>
        public float Obedience;
        /// <summary>Sustos esperados por minuto em condições normais.</summary>
        public float SpookPerMin;
        /// <summary>Chance (0..1) de o susto virar empinada em vez de só refugar.</summary>
        public float RearChance;
        /// <summary>Multiplicador do gasto de fôlego e vontade de parar para pastar.</summary>
        public float Laziness;
        /// <summary>Chance por minuto de acelerar sozinho uma andadura.</summary>
        public float ImpulsePerMin;
        public float Curiosity, Affection, Independence, Competitive, LearnRate;
    }

    public static class HorsePersonality
    {
        public static readonly TraitDef[] Defs =
        {
            new TraitDef { T = Trait.Docil, Name = "Dócil", Desc = "Aceita comandos com facilidade e quase nunca discute." },
            new TraitDef { T = Trait.Corajoso, Name = "Corajoso", Desc = "Raramente se assusta; encara água, escuro e bichos." },
            new TraitDef { T = Trait.Assustadico, Name = "Assustadiço", Desc = "Refuga com barulhos, sombras e bichos — pode empinar." },
            new TraitDef { T = Trait.Teimoso, Name = "Teimoso", Desc = "Às vezes empaca e só obedece na segunda vez." },
            new TraitDef { T = Trait.Curioso, Name = "Curioso", Desc = "Vem investigar você e as coisas novas por perto." },
            new TraitDef { T = Trait.Preguicoso, Name = "Preguiçoso", Desc = "Cansa antes no galope e para para pastar quando pode." },
            new TraitDef { T = Trait.Competitivo, Name = "Competitivo", Desc = "Corre mais quando outro cavalo galopa perto." },
            new TraitDef { T = Trait.Territorial, Name = "Territorial", Desc = "Defende seu espaço e enfrenta outros cavalos." },
            new TraitDef { T = Trait.Carinhoso, Name = "Carinhoso", Desc = "Procura sua companhia; o vínculo cresce mais rápido." },
            new TraitDef { T = Trait.Independente, Name = "Independente", Desc = "Gosta de liberdade: nem sempre atende ao seu chamado." },
            new TraitDef { T = Trait.Inteligente, Name = "Inteligente", Desc = "Aprende depressa e lembra dos caminhos." },
            new TraitDef { T = Trait.Impulsivo, Name = "Impulsivo", Desc = "Acelera sozinho quando se empolga." },
        };
        public static TraitDef Def(Trait t) => Defs[(int)t];

        /// <summary>Pares que não combinam no mesmo cavalo.</summary>
        static readonly (Trait, Trait)[] Conflicts = { (Trait.Corajoso, Trait.Assustadico), (Trait.Preguicoso, Trait.Impulsivo), (Trait.Docil, Trait.Territorial) };
        public static bool Conflict(Trait a, Trait b) { foreach (var (x, y) in Conflicts) if ((a == x && b == y) || (a == y && b == x)) return true; return false; }

        /// <summary>Sorteia 2 ou 3 traços pesados pela raça e pelos próprios atributos do cavalo.</summary>
        public static List<Trait> Roll(Rng r, BreedDef breed, float[] a)
        {
            var w = new float[Defs.Length];
            for (int i = 0; i < w.Length; i++) w[i] = 1f;
            foreach (var kv in breed.TraitBias) w[(int)kv.Key] *= kv.Value;
            float A(Attr x) => a[(int)x];
            w[(int)Trait.Docil] *= 0.4f + A(Attr.Obediencia) / 60f;
            w[(int)Trait.Teimoso] *= 0.4f + (100 - A(Attr.Obediencia)) / 60f;
            w[(int)Trait.Corajoso] *= 0.3f + A(Attr.Coragem) / 60f;
            w[(int)Trait.Assustadico] *= 0.3f + (100 - A(Attr.Coragem)) / 50f;
            w[(int)Trait.Impulsivo] *= 0.3f + A(Attr.Temperamento) / 55f;
            w[(int)Trait.Preguicoso] *= 0.3f + (100 - A(Attr.Temperamento)) / 70f;
            w[(int)Trait.Inteligente] *= 0.3f + A(Attr.Inteligencia) / 60f;
            int n = r.Chance(0.45f) ? 3 : 2; var got = new List<Trait>();
            for (int k = 0; k < n; k++)
            {
                float sum = 0; for (int i = 0; i < w.Length; i++) if (Ok(got, (Trait)i)) sum += w[i];
                if (sum <= 0) break; float p = r.Next() * sum;
                for (int i = 0; i < w.Length; i++) { if (!Ok(got, (Trait)i)) continue; p -= w[i]; if (p <= 0) { got.Add((Trait)i); break; } }
            }
            return got;
        }
        static bool Ok(List<Trait> got, Trait t) { foreach (var g in got) if (g == t || Conflict(g, t)) return false; return true; }

        /// <summary>Calcula o comportamento real a partir de atributos, traços e vínculo (0..100).</summary>
        public static Behavior Compute(float[] a, IList<Trait> traits, float bond)
        {
            float A(Attr x) => a[(int)x] / 100f; bool Has(Trait t) => traits.Contains(t);
            var b = new Behavior();
            b.Obedience = 0.45f + 0.4f * A(Attr.Obediencia) + 0.15f * bond / 100f;
            if (Has(Trait.Docil)) b.Obedience += 0.12f; if (Has(Trait.Teimoso)) b.Obedience -= 0.2f; if (Has(Trait.Independente)) b.Obedience -= 0.06f;
            b.Obedience = Math.Clamp(b.Obedience, 0.25f, 0.99f);
            b.SpookPerMin = 0.35f + 1.6f * (1 - A(Attr.Coragem)) * (0.6f + 0.6f * A(Attr.Sensibilidade));
            if (Has(Trait.Assustadico)) b.SpookPerMin *= 2.2f; if (Has(Trait.Corajoso)) b.SpookPerMin *= 0.3f;
            b.SpookPerMin *= 1 - 0.4f * bond / 100f;
            b.RearChance = Math.Clamp(0.15f + 0.5f * A(Attr.Temperamento) - 0.3f * A(Attr.Equilibrio) + (Has(Trait.Assustadico) ? 0.15f : 0), 0.05f, 0.75f);
            b.Laziness = 1f + (Has(Trait.Preguicoso) ? 0.35f : 0) - (Has(Trait.Competitivo) ? 0.05f : 0) + (0.5f - A(Attr.Temperamento)) * 0.2f;
            b.ImpulsePerMin = (Has(Trait.Impulsivo) ? 1.4f : 0.1f) * (0.5f + A(Attr.Temperamento));
            b.Curiosity = (Has(Trait.Curioso) ? 0.8f : 0.25f) + 0.2f * A(Attr.Inteligencia);
            b.Affection = (Has(Trait.Carinhoso) ? 0.8f : 0.3f) + 0.4f * bond / 100f;
            b.Independence = (Has(Trait.Independente) ? 0.55f : 0.15f) * (1 - 0.6f * bond / 100f);
            b.Competitive = Has(Trait.Competitivo) ? 0.1f : 0f;
            b.LearnRate = (0.6f + 0.8f * A(Attr.Inteligencia)) * (Has(Trait.Inteligente) ? 1.3f : 1f);
            return b;
        }
    }
}
