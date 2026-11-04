// Testes da lógica dos cavalos: raças, criação individual, personalidade, andaduras, montaria e IA.
using System;
using System.Collections.Generic;
using System.Linq;
using Crinas.Core;
using Crinas.Horses;
using Xunit;

namespace Crinas.Tests
{
    public class HorseBreedsTests
    {
        [Fact]
        public void AllBreeds_HaveTwelveDistinctEntriesWithFullAttributeMeans()
        {
            Assert.Equal(12, HorseBreeds.All.Length);
            Assert.Equal(12, HorseBreeds.All.Select(b => b.Key).Distinct().Count());
            foreach (var b in HorseBreeds.All) { Assert.Equal(Attrs.Count, b.Mean.Length); Assert.NotEmpty(b.Coats); Assert.Equal(b.Coats.Length, b.CoatNames.Length); }
        }

        [Fact]
        public void BreedAverages_ReflectAptitudes_PsiFasterThanFrisio_CriouloTougherThanPsi()
        {
            var r = new Rng(42); float Avg(string br, Attr a) { float s = 0; for (int i = 0; i < 300; i++) s += Horse.Create(r, br).Attr[(int)a]; return s / 300; }
            Assert.True(Avg("psi", Attr.Velocidade) > Avg("frisio", Attr.Velocidade) + 20);
            Assert.True(Avg("crioulo", Attr.Resistencia) > Avg("psi", Attr.Resistencia) + 12);
            Assert.True(Avg("frisio", Attr.Forca) > Avg("arabe", Attr.Forca) + 20);
        }
    }

    public class HorseCreationTests
    {
        [Fact]
        public void SameSeed_ProducesIdenticalHorse()
        {
            var a = Horse.Create(new Rng(7), "mm"); var b = Horse.Create(new Rng(7), "mm");
            Assert.Equal(a.Id, b.Id); Assert.Equal(a.Name, b.Name); Assert.Equal(a.Attr, b.Attr); Assert.Equal(a.Traits, b.Traits);
        }

        [Fact]
        public void ManyHorses_AttributesInRange_PotentialNotBelowCurrent_TwoOrThreeCompatibleTraits()
        {
            var r = new Rng(123);
            for (int i = 0; i < 600; i++)
            {
                var h = Horse.Create(r, HorseBreeds.All[i % 12].Key);
                for (int k = 0; k < Attrs.Count; k++) { Assert.InRange(h.Attr[k], 15, 96); Assert.True(h.Potential[k] >= h.Attr[k] && h.Potential[k] <= 99); }
                Assert.InRange(h.Traits.Count, 2, 3); Assert.Equal(h.Traits.Count, h.Traits.Distinct().Count());
                for (int x = 0; x < h.Traits.Count; x++) for (int y = x + 1; y < h.Traits.Count; y++) Assert.False(HorsePersonality.Conflict(h.Traits[x], h.Traits[y]));
            }
        }

        [Fact]
        public void IndividualsOfSameBreed_Differ()
        {
            var r = new Rng(9); var a = Horse.Create(r, "arabe"); var b = Horse.Create(r, "arabe");
            Assert.NotEqual(a.Attr, b.Attr);
        }
    }

    public class HorsePersonalityTests
    {
        static float[] Flat(float v) { var a = new float[Attrs.Count]; for (int i = 0; i < a.Length; i++) a[i] = v; return a; }

        [Fact]
        public void StubbornHorse_ObeysLessThanDocileHorse()
        {
            var a = Flat(60);
            var docil = HorsePersonality.Compute(a, new List<Trait> { Trait.Docil }, 0);
            var teimoso = HorsePersonality.Compute(a, new List<Trait> { Trait.Teimoso }, 0);
            Assert.True(docil.Obedience > teimoso.Obedience + 0.2f);
        }

        [Fact]
        public void SkittishHorse_SpooksMoreThanBraveHorse()
        {
            var a = Flat(60);
            Assert.True(HorsePersonality.Compute(a, new List<Trait> { Trait.Assustadico }, 0).SpookPerMin > 4 * HorsePersonality.Compute(a, new List<Trait> { Trait.Corajoso }, 0).SpookPerMin);
        }

        [Fact]
        public void HigherBond_RaisesObedienceAndLowersSpooksAndIndependence()
        {
            var a = Flat(55); var t = new List<Trait> { Trait.Independente };
            var low = HorsePersonality.Compute(a, t, 0); var high = HorsePersonality.Compute(a, t, 100);
            Assert.True(high.Obedience > low.Obedience); Assert.True(high.SpookPerMin < low.SpookPerMin); Assert.True(high.Independence < low.Independence);
        }

        [Fact]
        public void LazyHorse_HasHigherLaziness_ImpulsiveHorse_HasHigherImpulse()
        {
            var a = Flat(50);
            Assert.True(HorsePersonality.Compute(a, new List<Trait> { Trait.Preguicoso }, 0).Laziness > HorsePersonality.Compute(a, new List<Trait>(), 0).Laziness);
            Assert.True(HorsePersonality.Compute(a, new List<Trait> { Trait.Impulsivo }, 0).ImpulsePerMin > 5 * HorsePersonality.Compute(a, new List<Trait>(), 0).ImpulsePerMin);
        }
    }

    public class GaitModelTests
    {
        static float[] Flat(float v) { var a = new float[Attrs.Count]; for (int i = 0; i < a.Length; i++) a[i] = v; return a; }

        [Fact]
        public void Speeds_IncreaseWithGait()
        {
            var a = Flat(60);
            Assert.True(GaitModel.Speed(a, Gait.Walk) < GaitModel.Speed(a, Gait.Trot));
            Assert.True(GaitModel.Speed(a, Gait.Trot) < GaitModel.Speed(a, Gait.Gallop));
            Assert.True(GaitModel.Speed(a, Gait.Gallop) < GaitModel.Speed(a, Gait.Sprint));
            Assert.Equal(0, GaitModel.Speed(a, Gait.Stop));
        }

        [Fact]
        public void FasterHorse_GallopsFaster()
        {
            var slow = Flat(40); var fast = Flat(40); fast[(int)Attr.Velocidade] = 95;
            Assert.True(GaitModel.Speed(fast, Gait.Gallop) > GaitModel.Speed(slow, Gait.Gallop) * 1.2f);
        }

        [Fact]
        public void Gallop_DrainsStamina_Rest_Recovers_EnduranceDrainsSlower()
        {
            var weak = Flat(50); weak[(int)Attr.Resistencia] = 20; var tough = Flat(50); tough[(int)Attr.Resistencia] = 95;
            Assert.True(GaitModel.StaminaRate(weak, Gait.Gallop, 1) < 0);
            Assert.True(GaitModel.StaminaRate(weak, Gait.Stop, 1) > 0);
            Assert.True(GaitModel.StaminaRate(tough, Gait.Gallop, 1) > GaitModel.StaminaRate(weak, Gait.Gallop, 1));
        }
    }

    public class RideControllerTests
    {
        static Horse Make(float obedience, params Trait[] traits)
        {
            var h = new Horse { Name = "Teste" }; for (int i = 0; i < Attrs.Count; i++) h.Attr[i] = 60; h.Attr[(int)Attr.Obediencia] = obedience; h.Attr[(int)Attr.Coragem] = 100; h.Traits = traits.ToList(); h.Bond = 0; return h;
        }

        [Fact]
        public void ObedientHorse_ReachesGallopSpeedWhenAsked()
        {
            var h = Make(100, Trait.Docil, Trait.Corajoso); var c = new RideController(new Rng(1));
            for (int i = 0; i < 300; i++) c.Step(h, Gait.Gallop, 0, 1 / 60f, 0);
            Assert.Equal(Gait.Gallop, c.Current); Assert.True(c.Speed > GaitModel.Speed(h.Attr, Gait.Trot));
        }

        [Fact]
        public void ExhaustedHorse_CannotGallop()
        {
            var h = Make(100, Trait.Docil); h.Stamina = 0; var c = new RideController(new Rng(2));
            for (int i = 0; i < 200; i++) { h.Stamina = 0; c.Step(h, Gait.Gallop, 0, 1 / 60f, 0); }
            Assert.True(c.Current <= Gait.Trot);
        }

        [Fact]
        public void StubbornHorse_RefusesMoreOftenThanDocileHorse()
        {
            int Refusals(Horse h, ulong seed)
            {
                int n = 0; var c = new RideController(new Rng(seed));
                for (int k = 0; k < 400; k++) { c.Current = Gait.Walk; c.Lock = 0; c.Speed = 30; var e = c.Step(h, Gait.Gallop, 0, 0.016f, 0); if (e == RideEvent.Refused || e == RideEvent.Hesitated) n++; }
                return n;
            }
            Assert.True(Refusals(Make(20, Trait.Teimoso), 5) > Refusals(Make(95, Trait.Docil), 5) * 3 + 10);
        }

        [Fact]
        public void SkittishHorse_SpooksAtNight_AndStops()
        {
            var h = Make(80, Trait.Assustadico); h.Attr[(int)Attr.Coragem] = 5; h.Attr[(int)Attr.Sensibilidade] = 95;
            var c = new RideController(new Rng(3)); bool spooked = false;
            for (int i = 0; i < 60 * 120 && !spooked; i++) { var e = c.Step(h, Gait.Trot, 0, 1 / 60f, 3f); spooked = e == RideEvent.Spooked || e == RideEvent.Reared; }
            Assert.True(spooked);
            Assert.True(c.Lock > 0);
        }

        [Fact]
        public void Steering_TurnsGraduallyTowardRequestedDirection()
        {
            var h = Make(100, Trait.Docil); var c = new RideController(new Rng(4));
            c.Step(h, Gait.Walk, (float)Math.PI / 2, 1 / 60f, 0);
            Assert.True(c.Heading > 0 && c.Heading < Math.PI / 2);
        }
    }

    public class HorseAITests
    {
        sealed class OpenWorld : IWorldQuery
        {
            public bool Blocked(float x, float y) => false;
            public bool FindWater(float x, float y, float radius, out float wx, out float wy) { wx = wy = 0; return false; }
            public float Night => 0;
        }

        [Fact]
        public void WildHorse_FleesFromApproachingPlayer()
        {
            var h = Horse.Create(new Rng(11), "mustang"); h.Tamed = false; h.X = 100; h.Y = 100;
            var ai = new HorseAI(new Rng(12)) { HomeX = 100, HomeY = 100 };
            float before = Dist(h, 80, 100);
            for (int i = 0; i < 120; i++) ai.Update(h, new OpenWorld(), 80, 100, 1 / 60f);
            Assert.Equal(AIState.Flee, ai.State);
            Assert.True(Dist(h, 80, 100) > before + 30);
        }

        [Fact]
        public void TamedHorse_ComesWhenCalled_UnlessIndependentRefuses()
        {
            var h = Horse.Create(new Rng(21), "mm"); h.Tamed = true; h.Traits = new List<Trait> { Trait.Docil }; h.Bond = 100; h.X = 0; h.Y = 0;
            var ai = new HorseAI(new Rng(22)) { Called = true };
            for (int i = 0; i < 60 * 8; i++) ai.Update(h, new OpenWorld(), 300, 0, 1 / 60f);
            Assert.True(Dist(h, 300, 0) < 60);
        }

        static float Dist(Horse h, float x, float y) => (float)Math.Sqrt((h.X - x) * (h.X - x) + (h.Y - y) * (h.Y - y));
    }
}
