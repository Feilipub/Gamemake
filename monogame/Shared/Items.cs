// Lida no Sertão (MonoGame) — itens e mochila (30 casas; as 10 primeiras são a barra rápida).
using System.Collections.Generic;

namespace Lida
{
    /// <summary>Definição de um item: nome, ícone, descrição e se é ferramenta (não se gasta).</summary>
    public class ItemDef { public string Id, Name, Desc; public bool Tool; }

    /// <summary>Uma casa da mochila.</summary>
    public class Slot { public string Id; public int N; public bool Empty => Id == null || N <= 0; }

    public class Inventory
    {
        public static readonly Dictionary<string, ItemDef> Defs = new Dictionary<string, ItemDef>
        {
            ["laco"] = new ItemDef { Id = "laco", Name = "Laço", Desc = "Corda de couro trançado. Pega o boi que foge.", Tool = true },
            ["balde"] = new ItemDef { Id = "balde", Name = "Balde", Desc = "Enche o bebedouro do piquete.", Tool = true },
            ["facao"] = new ItemDef { Id = "facao", Name = "Facão", Desc = "Abre caminho na caatinga.", Tool = true },
            ["racao"] = new ItemDef { Id = "racao", Name = "Ração", Desc = "Um saco enche o cocho de ração." },
            ["sal"] = new ItemDef { Id = "sal", Name = "Sal mineral", Desc = "Vai no cocho: o gado precisa de sal." },
            ["milho"] = new ItemDef { Id = "milho", Name = "Milho", Desc = "Galinhas, porcos e cavalos adoram." },
            ["queijo"] = new ItemDef { Id = "queijo", Name = "Queijo coalho", Desc = "Feito com o leite da fazenda." },
            ["leite"] = new ItemDef { Id = "leite", Name = "Leite", Desc = "Tirado na mão, de manhã cedo." },
            ["ovo"] = new ItemDef { Id = "ovo", Name = "Ovo", Desc = "Ovo caipira do galinheiro." },
        };

        public const int Size = 30, Bar = 10;
        public readonly Slot[] S = new Slot[Size];
        public int Sel;

        public Inventory() { for (int i = 0; i < Size; i++) S[i] = new Slot(); }

        /// <summary>Mochila inicial do vaqueiro.</summary>
        public static Inventory Start()
        {
            var v = new Inventory(); int i = 0;
            foreach (var (id, n) in new[] { ("laco", 1), ("balde", 1), ("facao", 1), ("racao", 20), ("sal", 10), ("milho", 15), ("leite", 2), ("queijo", 1), ("ovo", 6) }) { v.S[i].Id = id; v.S[i].N = n; i++; }
            return v;
        }

        public Slot Current => S[Sel];
        public string CurId => Current.Empty ? null : Current.Id;

        /// <summary>Gasta uma unidade do item selecionado (ferramentas não gastam).</summary>
        public void UseOne() { var s = Current; if (s.Empty || Defs[s.Id].Tool) return; if (--s.N <= 0) { s.Id = null; s.N = 0; } }

        public bool Add(string id, int n)
        {
            foreach (var s in S) if (!s.Empty && s.Id == id) { s.N += n; return true; }
            foreach (var s in S) if (s.Empty) { s.Id = id; s.N = n; return true; }
            return false;
        }

        /// <summary>Troca duas casas de lugar (arrastar na mochila).</summary>
        public void Swap(int a, int b) { var t = S[a]; S[a] = S[b]; S[b] = t; }
    }
}
