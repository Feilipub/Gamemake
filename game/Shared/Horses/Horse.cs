// Terra de Crinas — o cavalo como dado (separado do desenho): identidade persistente, raça, pelagem, sexo, idade,
// 12 atributos, potencial de treino, traços, vínculo, confiança, fôlego e estado no mundo.
using System;
using System.Collections.Generic;
using Crinas.Core;

namespace Crinas.Horses
{
    public sealed class Horse
    {
        public string Id = "";
        public string Name = "";
        public string Breed = "mm";
        public string Coat = "castanho";
        public char Sex = 'M';
        public int AgeYears = 5;
        /// <summary>Atributos atuais (0..100), na ordem de <see cref="Attr"/>.</summary>
        public float[] Attr = new float[Attrs.Count];
        /// <summary>Teto natural de cada atributo para o treino (aptidão individual).</summary>
        public float[] Potential = new float[Attrs.Count];
        public List<Trait> Traits = new List<Trait>();
        public float Bond, Trust;
        public float Stamina = 100;
        public bool Tamed, Owned, Saddled;
        public float X, Y;
        public string History = "";

        public BreedDef BreedDef => HorseBreeds.Get(Breed);
        public float A(Crinas.Horses.Attr a) => Attr[(int)a];
        public Behavior Behavior => HorsePersonality.Compute(Attr, Traits, Bond);

        /// <summary>Soma ponderada simples para a "nota" do cavalo na ficha (0..100).</summary>
        public float Overall { get { float s = 0; foreach (var v in Attr) s += v; return s / Attrs.Count; } }

        static readonly string[] NamesM = { "Trovão", "Relâmpago", "Faísca", "Cometa", "Vento", "Pampa", "Bravo", "Zorro", "Tufão", "Sereno", "Lampião", "Galã", "Barão", "Fumaça", "Jaguar", "Horizonte" };
        static readonly string[] NamesF = { "Estrela", "Brisa", "Aurora", "Pérola", "Ventania", "Jade", "Duquesa", "Luna", "Canela", "Serena", "Pluma", "Garoa", "Safira", "Princesa", "Maré", "Rainha" };

        /// <summary>Cria um cavalo individual da raça: atributos sorteados em torno das médias, potencial e personalidade.</summary>
        public static Horse Create(Rng r, string breed, string coat = null, char sex = '\0', string name = null)
        {
            var b = HorseBreeds.Get(breed); var h = new Horse { Breed = b.Key };
            h.Id = "h" + r.NextU64().ToString("x12").Substring(0, 12);
            h.Coat = coat ?? r.Pick(b.Coats);
            h.Sex = sex != '\0' ? sex : (r.Chance(0.5f) ? 'M' : 'F');
            h.AgeYears = r.Int(3, 13);
            for (int i = 0; i < Attrs.Count; i++)
            {
                float v = b.Mean[i] + r.Gauss() * b.Spread; h.Attr[i] = (float)Math.Round(Math.Clamp(v, 15, 96));
                // potencial: o quanto ainda pode subir com treino; raramente chega a 100
                h.Potential[i] = (float)Math.Round(Math.Clamp(h.Attr[i] + r.Range(4, 22), h.Attr[i], 99));
            }
            h.Traits = HorsePersonality.Roll(r, b, h.Attr);
            h.Name = name ?? r.Pick(h.Sex == 'F' ? NamesF : NamesM);
            return h;
        }
    }
}
