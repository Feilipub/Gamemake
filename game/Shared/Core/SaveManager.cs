// Terra de Crinas — salvamento. JSON legível com versão, gravado de forma atômica (arquivo temporário + troca) e
// com cópia de segurança (.bak), para nunca corromper o progresso se o jogo fechar no meio da gravação.
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Crinas.Horses;

namespace Crinas.Core
{
    /// <summary>Aparência do personagem (índices nas paletas de CharacterArt).</summary>
    public sealed class CharacterLook
    {
        public string Name = "Ana";
        public int Skin = 1, Hair = 0, HairColor = 0, Outfit = 0, Hat = 1;
    }

    /// <summary>Tudo o que vai para o disco. Campos públicos para o System.Text.Json.</summary>
    public sealed class SaveData
    {
        public int Version = 1;
        public int Seed = 1234;
        public CharacterLook Look = new CharacterLook();
        public float PX, PY;
        public bool Mounted;
        public string RideId = "";
        public double Minutes = 8 * 60;
        public int Day = 1;
        public List<Horse> Horses = new List<Horse>();
        public long SavedAtUnix;
    }

    public static class SaveManager
    {
        static readonly JsonSerializerOptions Opt = new JsonSerializerOptions { IncludeFields = true, WriteIndented = false };

        public static string Folder
        {
            get { var d = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TerraDeCrinas"); Directory.CreateDirectory(d); return d; }
        }
        public static string MainPath => Path.Combine(Folder, "save.json");

        public static string ToJson(SaveData s) => JsonSerializer.Serialize(s, Opt);
        public static SaveData FromJson(string json)
        {
            var s = JsonSerializer.Deserialize<SaveData>(json, Opt);
            if (s == null) throw new InvalidDataException("save vazio");
            foreach (var h in s.Horses) { if (h.Attr == null || h.Attr.Length != Attrs.Count) throw new InvalidDataException("cavalo sem atributos"); if (h.Potential == null || h.Potential.Length != Attrs.Count) h.Potential = (float[])h.Attr.Clone(); if (h.Traits == null) h.Traits = new List<Trait>(); }
            return s;
        }

        /// <summary>Grava sem risco: escreve num temporário e troca; mantém a versão anterior em .bak.</summary>
        public static void Write(SaveData s, string path = null)
        {
            path = path ?? MainPath; s.SavedAtUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string tmp = path + ".tmp", bak = path + ".bak";
            File.WriteAllText(tmp, ToJson(s));
            if (File.Exists(path)) File.Copy(path, bak, true);
            File.Move(tmp, path, true);
        }

        /// <summary>Lê o save; se estiver corrompido, tenta a cópia de segurança.</summary>
        public static SaveData Read(string path = null)
        {
            path = path ?? MainPath;
            foreach (var p in new[] { path, path + ".bak" })
            {
                try { if (File.Exists(p)) return FromJson(File.ReadAllText(p)); }
                catch (Exception) { }
            }
            return null;
        }
        public static bool Exists(string path = null) => File.Exists(path ?? MainPath) || File.Exists((path ?? MainPath) + ".bak");
    }
}
