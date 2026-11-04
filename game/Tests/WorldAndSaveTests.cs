// Testes do mundo (geração determinística, rancho em terra firme, pedaços) e do salvamento (ida e volta, versão).
using System.Collections.Generic;
using Crinas.Core;
using Crinas.Horses;
using Crinas.World;
using Xunit;

namespace Crinas.Tests
{
    public class WorldGenTests
    {
        [Fact]
        public void SameSeed_GivesSameTiles_DifferentSeed_GivesDifferentMap()
        {
            var a = new WorldGen(5); var b = new WorldGen(5); var c = new WorldGen(6); int diff = 0;
            for (int i = 0; i < 2000; i++) { int x = 20 + i * 37 % 980, y = 20 + i * 53 % 980; Assert.Equal(a.TileAt(x, y), b.TileAt(x, y)); if (a.TileAt(x, y) != c.TileAt(x, y)) diff++; }
            Assert.True(diff > 100);
        }

        [Fact]
        public void Ranch_IsOnDryLand_ForAnySeed()
        {
            for (int s = 1; s < 30; s++)
            {
                var g = new WorldGen(s);
                for (int y = g.RanchY0; y <= g.RanchY1; y++) for (int x = g.RanchX0; x <= g.RanchX1; x++) Assert.False(WorldGen.IsWater(g.TileAt(x, y)));
            }
        }

        [Fact]
        public void Valley_HasVariedTerrain()
        {
            var g = new WorldGen(2026); var seen = new HashSet<byte>();
            for (int y = 100; y < 900; y += 7) for (int x = 100; x < 900; x += 7) seen.Add(g.TileAt(x, y));
            foreach (var t in new[] { Tile.Grass, Tile.Lush, Tile.Forest, Tile.Water, Tile.Sand, Tile.Dirt }) Assert.Contains(t, seen);
        }

        [Fact]
        public void WorldEdge_IsBlockedWater()
        {
            var w = new ChunkStreamingManager(new WorldGen(3)) { Async = false };
            Assert.True(w.Blocked(8, 8, false)); Assert.True(w.Blocked(-50, 100, true));
        }
    }

    public class ChunkStreamingTests
    {
        [Fact]
        public void Update_LoadsRingAroundCamera_AndUnloadsFarChunks()
        {
            var g = new WorldGen(8); var w = new ChunkStreamingManager(g) { Async = false, Radius = 1 };
            w.Update(g.SpawnTX * 16, g.SpawnTY * 16); Assert.Equal(9, w.Loaded);
            w.Update(g.SpawnTX * 16 + 32 * 16 * 6, g.SpawnTY * 16);
            Assert.True(w.Loaded <= 25);
        }

        [Fact]
        public void PlayerSpawn_IsWalkable()
        {
            var g = new WorldGen(2026); var w = new ChunkStreamingManager(g) { Async = false };
            Assert.False(w.Blocked((g.RanchX0 + 5) * 16 + 8, (g.RanchY0 + 10) * 16, true));
        }

        [Fact]
        public void StableFootprint_BlocksWalking()
        {
            var g = new WorldGen(2026); var w = new ChunkStreamingManager(g) { Async = false };
            Assert.True(w.Blocked((g.RanchX0 + 4) * 16 + 8, (g.RanchY0 + 7) * 16 + 5, true));
        }
    }

    public class SaveManagerTests
    {
        [Fact]
        public void SaveData_RoundTripsThroughJson_WithHorseIdentityAndPersonality()
        {
            var h = Horse.Create(new Rng(77), "lusitano"); h.Bond = 42.5f; h.Owned = true; h.Tamed = true; h.X = 123; h.Y = 456;
            var s = new SaveData { Seed = 99, PX = 10, PY = 20, Mounted = true, RideId = h.Id, Minutes = 600, Day = 3, Look = new CharacterLook { Name = "Bento", Skin = 2, Hat = 2 } };
            s.Horses.Add(h);
            var back = SaveManager.FromJson(SaveManager.ToJson(s));
            Assert.Equal(99, back.Seed); Assert.True(back.Mounted); Assert.Equal(h.Id, back.RideId); Assert.Equal("Bento", back.Look.Name); Assert.Equal(2, back.Look.Hat);
            var hb = back.Horses[0];
            Assert.Equal(h.Id, hb.Id); Assert.Equal(h.Name, hb.Name); Assert.Equal(h.Breed, hb.Breed); Assert.Equal(h.Coat, hb.Coat);
            Assert.Equal(h.Attr, hb.Attr); Assert.Equal(h.Potential, hb.Potential); Assert.Equal(h.Traits, hb.Traits); Assert.Equal(42.5f, hb.Bond); Assert.Equal(123f, hb.X);
        }

        [Fact]
        public void CorruptJson_IsRejected()
        {
            Assert.ThrowsAny<System.Exception>(() => SaveManager.FromJson("{\"Horses\":[{\"Attr\":[1,2]}]}"));
        }
    }
}
