// Terra de Crinas — atributos e raças. Cada raça tem médias próprias de atributos, aptidão, tendências de
// temperamento e um desenho próprio no RIG (porte, cabeça, pescoço, crina, cauda). Para criar uma raça nova basta
// acrescentar uma entrada em HorseBreeds.All e as pelagens em tools/asset-pipeline/export_assets.js.
using System.Collections.Generic;

namespace Crinas.Horses
{
    /// <summary>Os 12 atributos individuais (0 a 100).</summary>
    public enum Attr { Velocidade, Aceleracao, Resistencia, Forca, Agilidade, Equilibrio, Recuperacao, Inteligencia, Obediencia, Coragem, Sensibilidade, Temperamento }

    public static class Attrs
    {
        public const int Count = 12;
        public static readonly string[] Name = { "Velocidade", "Aceleração", "Resistência", "Força", "Agilidade", "Equilíbrio", "Recuperação", "Inteligência", "Obediência", "Coragem", "Sensibilidade", "Temperamento" };
        public static readonly string[] Desc =
        {
            "Velocidade máxima no galope e na disparada.", "Rapidez para ganhar velocidade e responder às pernas.", "Quanto tempo aguenta um ritmo forte sem cansar.",
            "Carga, tração e firmeza em subidas.", "Curvas fechadas e mudanças de direção.", "Firmeza em terreno ruim e nos saltos.",
            "Rapidez para recuperar o fôlego parado ou ao passo.", "Aprende comandos e treinos mais depressa.", "Atende aos comandos sem hesitar.",
            "Enfrenta sustos, água e escuro sem fugir.", "Percebe o cavaleiro e o ambiente (sensível = reage mais).", "Sangue quente: energia e impulso (alto = esquentado)."
        };
    }

    /// <summary>Definição de uma raça.</summary>
    public sealed class BreedDef
    {
        public string Key, Name, Origin, Aptitude, Description, RigKey;
        public string[] Coats; public string[] CoatNames;
        /// <summary>Médias dos 12 atributos (ordem de <see cref="Attr"/>).</summary>
        public float[] Mean;
        public float Spread = 9;
        /// <summary>Peso extra de cada traço de personalidade ao sortear (1 = neutro).</summary>
        public Dictionary<Trait, float> TraitBias = new Dictionary<Trait, float>();
        /// <summary>Altura na cernelha em palmos (só informativo na ficha).</summary>
        public float Hands;
    }

    public static class HorseBreeds
    {
        static BreedDef B(string key, string name, string origin, string apt, string desc, float hands, string[] coats, string[] coatNames, float[] mean, params (Trait, float)[] bias)
        {
            var b = new BreedDef { Key = key, Name = name, Origin = origin, Aptitude = apt, Description = desc, RigKey = key, Coats = coats, CoatNames = coatNames, Mean = mean, Hands = hands };
            foreach (var (t, w) in bias) b.TraitBias[t] = w; return b;
        }

        //                                       Vel Ace Res For Agi Equ Rec Int Obe Cor Sen Tem
        public static readonly BreedDef[] All =
        {
            B("arabe", "Árabe", "Península Arábica", "Enduro e longas distâncias", "Cabeça de perfil côncavo, cauda alta e muito fôlego. Esperto e sensível.", 15,
              new[] { "tordilho", "castanho" }, new[] { "Tordilho", "Castanho" }, new float[] { 72, 68, 88, 50, 74, 66, 80, 82, 58, 60, 80, 76 }, (Trait.Inteligente, 2f), (Trait.Impulsivo, 1.5f), (Trait.Curioso, 1.3f), (Trait.Carinhoso, 1.2f)),
            B("qm", "Quarto de Milha", "Estados Unidos", "Arrancada e trabalho com gado", "Musculoso e baixo, explode em curtas distâncias. Calmo para o trabalho.", 15,
              new[] { "alazao", "castanho" }, new[] { "Alazão", "Castanho" }, new float[] { 80, 92, 60, 74, 84, 74, 70, 70, 74, 70, 56, 48 }, (Trait.Docil, 1.6f), (Trait.Competitivo, 1.5f), (Trait.Corajoso, 1.2f)),
            B("mm", "Mangalarga Marchador", "Brasil (Minas Gerais)", "Marcha macia em longas viagens", "Andadura confortável, pescoço longo e temperamento manso.", 15,
              new[] { "castanho", "tordilho" }, new[] { "Castanho", "Tordilho" }, new float[] { 62, 58, 86, 62, 66, 84, 78, 72, 78, 64, 66, 44 }, (Trait.Docil, 2f), (Trait.Carinhoso, 1.5f)),
            B("andaluz", "Andaluz", "Espanha", "Adestramento e passeio elegante", "Pescoço arqueado, crina farta e movimentos altos. Nobre e corajoso.", 15.5f,
              new[] { "tordilho", "castanho" }, new[] { "Tordilho", "Castanho" }, new float[] { 64, 64, 68, 70, 78, 80, 68, 78, 74, 74, 70, 56 }, (Trait.Corajoso, 1.6f), (Trait.Carinhoso, 1.3f), (Trait.Inteligente, 1.2f)),
            B("psi", "Puro-Sangue Inglês", "Inglaterra", "Corridas de velocidade", "Alto e magro, pernas longas: o mais veloz no galope. Nervoso e competitivo.", 16,
              new[] { "castanho", "alazao" }, new[] { "Castanho", "Alazão" }, new float[] { 93, 84, 72, 54, 70, 60, 66, 70, 56, 52, 84, 82 }, (Trait.Competitivo, 2f), (Trait.Impulsivo, 1.6f), (Trait.Assustadico, 1.3f)),
            B("frisio", "Frísio", "Países Baixos", "Tração leve e apresentação", "Preto, robusto, crina e cauda longuíssimas e boletos peludos. Gentil.", 16,
              new[] { "preto" }, new[] { "Preto" }, new float[] { 58, 52, 64, 86, 58, 76, 62, 72, 80, 70, 64, 44 }, (Trait.Docil, 1.6f), (Trait.Carinhoso, 1.4f), (Trait.Preguicoso, 1.2f)),
            B("appaloosa", "Appaloosa", "Estados Unidos", "Trilhas e trabalho versátil", "Pelagem pintalgada, cascos listrados e muita resistência.", 15,
              new[] { "appaLeo", "appaManta" }, new[] { "Leopardo", "Manta" }, new float[] { 66, 66, 80, 66, 70, 72, 74, 72, 64, 74, 58, 52 }, (Trait.Corajoso, 1.4f), (Trait.Independente, 1.2f), (Trait.Teimoso, 1.1f)),
            B("mustang", "Mustang", "Pradarias selvagens", "Sobrevivência e terreno difícil", "Selvagem e compacto, fôlego enorme e pés firmes. Desconfiado.", 14.5f,
              new[] { "baio", "rosilho" }, new[] { "Baio", "Rosilho" }, new float[] { 68, 70, 90, 68, 74, 80, 86, 74, 44, 76, 62, 66 }, (Trait.Independente, 2f), (Trait.Teimoso, 1.4f), (Trait.Territorial, 1.3f), (Trait.Corajoso, 1.2f)),
            B("paint", "Paint Horse", "Estados Unidos", "Trabalho e lazer", "Malhado em grandes manchas, forte e de boa índole.", 15,
              new[] { "pampaAlazao", "pampaPreto" }, new[] { "Pampa alazão", "Pampa preto" }, new float[] { 72, 80, 64, 70, 78, 70, 70, 68, 72, 68, 58, 52 }, (Trait.Docil, 1.3f), (Trait.Curioso, 1.3f), (Trait.Competitivo, 1.1f)),
            B("lusitano", "Lusitano", "Portugal", "Adestramento e toureio a cavalo", "Valente e equilibrado, responde ao menor toque.", 15.5f,
              new[] { "castanho", "tordilho" }, new[] { "Castanho", "Tordilho" }, new float[] { 66, 68, 70, 68, 80, 84, 70, 80, 76, 84, 72, 58 }, (Trait.Corajoso, 2f), (Trait.Inteligente, 1.4f)),
            B("crioulo", "Crioulo", "Pampa (Sul da América)", "Resistência no campo", "Baixo e rústico: anda o dia inteiro com pouca comida.", 14.5f,
              new[] { "baio", "preto" }, new[] { "Gateado", "Preto" }, new float[] { 60, 62, 94, 74, 68, 82, 88, 70, 66, 78, 56, 50 }, (Trait.Corajoso, 1.4f), (Trait.Independente, 1.2f), (Trait.Teimoso, 1.1f)),
            B("akhal", "Akhal-Teke", "Turcomenistão", "Velocidade e resistência no deserto", "Esguio, pelo de brilho metálico. Fiel a um só cavaleiro.", 15.5f,
              new[] { "dourado", "preto" }, new[] { "Dourado metálico", "Preto" }, new float[] { 86, 76, 90, 50, 72, 66, 84, 76, 50, 56, 86, 82 }, (Trait.Independente, 1.6f), (Trait.Territorial, 1.3f), (Trait.Carinhoso, 1.2f), (Trait.Assustadico, 1.1f)),
        };

        static Dictionary<string, BreedDef> byKey;
        public static BreedDef Get(string key)
        {
            if (byKey == null) { byKey = new Dictionary<string, BreedDef>(); foreach (var b in All) byKey[b.Key] = b; }
            return byKey.TryGetValue(key, out var d) ? d : All[0];
        }
        public static string CoatName(BreedDef b, string coat) { for (int i = 0; i < b.Coats.Length; i++) if (b.Coats[i] == coat) return b.CoatNames[i]; return coat; }
    }
}
