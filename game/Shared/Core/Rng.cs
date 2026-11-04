// Terra de Crinas — números aleatórios determinísticos e ruído (mesma semente = mesmo mundo e mesmos cavalos).
using System;

namespace Crinas.Core
{
    /// <summary>Gerador pseudoaleatório pequeno e determinístico (SplitMix64). Não depende de System.Random.</summary>
    public sealed class Rng
    {
        ulong s;
        public Rng(ulong seed) { s = seed == 0 ? 0x9E3779B97F4A7C15UL : seed; }
        public Rng(int seed) : this((ulong)(uint)seed * 2654435761UL + 1) { }

        public ulong NextU64() { unchecked { ulong z = (s += 0x9E3779B97F4A7C15UL); z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL; z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL; return z ^ (z >> 31); } }
        /// <summary>Número em [0, 1).</summary>
        public float Next() => (NextU64() >> 40) / (float)(1UL << 24);
        public float Range(float a, float b) => a + (b - a) * Next();
        public int Int(int a, int bExclusive) => a + (int)(Next() * (bExclusive - a));
        public bool Chance(float p) => Next() < p;
        /// <summary>Distribuição normal (média 0, desvio 1) pelo método de Box-Muller.</summary>
        public float Gauss() { float u = Math.Max(1e-7f, Next()), v = Next(); return (float)(Math.Sqrt(-2 * Math.Log(u)) * Math.Cos(2 * Math.PI * v)); }
        public T Pick<T>(T[] a) => a[Int(0, a.Length)];
    }

    /// <summary>Hash e ruído de valor 2D para gerar o mundo sem guardar nada.</summary>
    public static class Noise
    {
        public static float Hash(int x, int y, int seed)
        {
            unchecked { uint h = (uint)(x * 374761393 + y * 668265263 + seed * 1442695041); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xFFFFFF) / 16777216f; }
        }
        static float Smooth(float t) => t * t * (3 - 2 * t);
        public static float Value(float x, float y, int seed)
        {
            int xi = (int)Math.Floor(x), yi = (int)Math.Floor(y); float fx = x - xi, fy = y - yi, u = Smooth(fx), v = Smooth(fy);
            float a = Hash(xi, yi, seed), b = Hash(xi + 1, yi, seed), c = Hash(xi, yi + 1, seed), d = Hash(xi + 1, yi + 1, seed);
            return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
        }
        /// <summary>Soma de oitavas (fBm) normalizada em [0, 1].</summary>
        public static float Fbm(float x, float y, int seed, int oct = 4)
        {
            float sum = 0, amp = 1, norm = 0, f = 1;
            for (int i = 0; i < oct; i++) { sum += Value(x * f, y * f, seed + i * 101) * amp; norm += amp; amp *= 0.5f; f *= 2.03f; }
            return sum / norm;
        }
    }
}
