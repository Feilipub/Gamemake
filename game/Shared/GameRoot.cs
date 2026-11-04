// Terra de Crinas — raiz do jogo (MonoGame). Telas: menu inicial, criação do personagem, escolha do primeiro
// cavalo e o jogo. Liga os sistemas (mundo em pedaços, cavalos, jogador, luz, interface, salvamento).
// Captura para testes: TerraDeCrinas --shot arquivo.png --scene menu|create|choose|play|ride|sheet [--hour h] [--size LxA]
using System;
using System.Collections.Generic;
using Crinas.Core;
using Crinas.Horses;
using Crinas.Player;
using Crinas.Render;
using Crinas.UI;
using Crinas.World;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace Crinas
{
    public partial class GameRoot : Game
    {
        readonly GraphicsDeviceManager gdm;
        SpriteBatch sb; Atlas at; UiArt ui; TerrainArt terr; PropArt props; Lighting light;
        readonly InputState inp = new InputState();
        enum Screen { Menu, Create, Choose, Play }
        Screen screen = Screen.Menu;

        WorldGen gen; ChunkStreamingManager world; HorseManager horses; WorldQuery wq; Rng rng; int seed = 2026;
        CharacterLook look = new CharacterLook(); CharacterArt charArt;
        Vector2 pos; int pdir; float walkDist; bool moving, running;
        Horse ride; RideController rideCtl; float petCd;
        double minutes = 8 * 60; int day = 1;
        Vector2 cam; int zoom = 3, U = 2;
        string toast = ""; float toastT, saveT;
        bool sheetOpen, pauseOpen; Horse sheetHorse;
        readonly string[] args; string shotPath, shotScene; int shotFrames = -1;
        List<Horse> choices; int choiceSel = 1;
        readonly List<(Vector2 p, float t)> hearts = new List<(Vector2, float)>();

        public GameRoot(string[] a = null)
        {
            args = a ?? new string[0];
            gdm = new GraphicsDeviceManager(this) { PreferredBackBufferWidth = 960, PreferredBackBufferHeight = 540, SupportedOrientations = DisplayOrientation.LandscapeLeft | DisplayOrientation.LandscapeRight | DisplayOrientation.Portrait };
            IsMouseVisible = true; Window.AllowUserResizing = true; Window.Title = "Terra de Crinas";
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "--shot" && i + 1 < args.Length) { shotPath = args[i + 1]; shotFrames = 50; }
                if (args[i] == "--scene" && i + 1 < args.Length) shotScene = args[i + 1];
                if (args[i] == "--size" && i + 1 < args.Length) { var wh = args[i + 1].Split('x'); gdm.PreferredBackBufferWidth = int.Parse(wh[0]); gdm.PreferredBackBufferHeight = int.Parse(wh[1]); }
            }
#if !ANDROID
            Window.TextInput += (s, e) => { if (screen != Screen.Create) return; if (e.Character == '\b') { if (look.Name.Length > 0) look.Name = look.Name.Substring(0, look.Name.Length - 1); } else if (!char.IsControl(e.Character) && look.Name.Length < 14) look.Name += e.Character; };
#endif
        }

        protected override void LoadContent()
        {
            sb = new SpriteBatch(GraphicsDevice); at = new Atlas(GraphicsDevice); ui = new UiArt(GraphicsDevice); terr = new TerrainArt(GraphicsDevice); props = new PropArt(GraphicsDevice);
            BuildWorld(seed);
            charArt = new CharacterArt(GraphicsDevice, look);
            if (shotPath != null) SetupShot();
        }

        /// <summary>Cria o mundo (gerador, pedaços, cavalos) para a semente.</summary>
        void BuildWorld(int s)
        {
            seed = s; rng = new Rng(s * 7919 + 13); gen = new WorldGen(s); world = new ChunkStreamingManager(gen) { Async = shotPath == null };
            horses = new HorseManager(new Rng(s * 31 + 7)); wq = new WorldQuery(world); herdHome = new Vector2(-1, -1);
            light = new Lighting(GraphicsDevice, at, WorldGen.W * WorldGen.TS, WorldGen.H * WorldGen.TS);
            pos = new Vector2((gen.RanchX0 + 5) * WorldGen.TS + 8, (gen.RanchY0 + 10) * WorldGen.TS);
            cam = pos;
        }
        Vector2 Paddock => new Vector2((gen.RanchX0 + 9 + gen.RanchX1) / 2f * WorldGen.TS, (gen.RanchY0 + gen.RanchY1) / 2f * WorldGen.TS);
        Vector2 herdHome = new Vector2(-1, -1);
        /// <summary>Campo aberto (capim, sem água por perto) mais próximo a leste do rancho, onde vive a manada selvagem.</summary>
        Vector2 HerdHome
        {
            get
            {
                if (herdHome.X >= 0) return herdHome;
                for (int r = 0; r < 60; r += 2) for (int a = 0; a < 16; a++)
                    {
                        int tx = gen.SpawnTX + 46 + (int)(Math.Cos(a * 0.3927) * r), ty = gen.SpawnTY - 4 + (int)(Math.Sin(a * 0.3927) * r); bool ok = true;
                        for (int j = -6; j <= 6 && ok; j += 2) for (int i = -8; i <= 8 && ok; i += 2) { byte t = gen.TileAt(tx + i, ty + j); ok = t == Tile.Grass || t == Tile.Lush; }
                        if (ok) return herdHome = new Vector2(tx * WorldGen.TS, ty * WorldGen.TS);
                    }
                return herdHome = new Vector2((gen.SpawnTX + 46) * WorldGen.TS, gen.SpawnTY * WorldGen.TS);
            }
        }

        /// <summary>Começa um jogo novo com o cavalo escolhido.</summary>
        void StartNewGame(Horse first)
        {
            BuildWorld(Environment.TickCount & 0xFFFF);
            charArt = new CharacterArt(GraphicsDevice, look);
            first.Tamed = true; first.Owned = true; first.Saddled = true; first.Bond = 20; first.Trust = 55; first.Stamina = 100;
            first.History = "Seu primeiro cavalo, comprado no rancho do vale.";
            var pd = Paddock; first.X = pd.X; first.Y = pd.Y; horses.Add(first, pd.X, pd.Y, 70);
            world.Update(pos.X, pos.Y); var hh = HerdHome; horses.SpawnWildHerd(world, hh.X, hh.Y);
            minutes = 8 * 60; day = 1; ride = null; screen = Screen.Play; sheetOpen = pauseOpen = false;
            Toast("Bem-vindo(a), " + look.Name + "! " + first.Name + " espera você no piquete. Chegue perto e aperte a ferradura para montar.", 6);
            Save();
        }

        Horse Owned { get { foreach (var h in horses.Horses) if (h.Owned) return h; return null; } }

        // ---------------- salvar / carregar ----------------
        void Save()
        {
            if (shotPath != null || screen != Screen.Play) return;
            try
            {
                var s = new SaveData { Seed = seed, Look = look, PX = pos.X, PY = pos.Y, Mounted = ride != null, RideId = ride?.Id ?? "", Minutes = minutes, Day = day, Horses = horses.Horses };
                SaveManager.Write(s);
            }
            catch (Exception e) { Toast("Não foi possível salvar: " + e.Message); }
        }
        bool LoadGame()
        {
            var s = SaveManager.Read(); if (s == null) return false;
            look = s.Look ?? new CharacterLook(); BuildWorld(s.Seed); charArt = new CharacterArt(GraphicsDevice, look);
            pos = new Vector2(s.PX, s.PY); cam = pos; minutes = s.Minutes; day = s.Day;
            var pd = Paddock; var hh = HerdHome;
            foreach (var h in s.Horses) horses.Add(h, h.Owned ? pd.X : hh.X, h.Owned ? pd.Y : hh.Y, h.Owned ? 70 : 150);
            ride = s.Mounted ? horses.Find(s.RideId) : null; if (ride != null) { rideCtl = new RideController(new Rng(rng.NextU64())); pos = new Vector2(ride.X, ride.Y); }
            screen = Screen.Play; Toast("Jogo carregado: dia " + day + "."); return true;
        }
        protected override void OnExiting(object sender, ExitingEventArgs e) { Save(); base.OnExiting(sender, e); }

        void Toast(string t, float secs = 3.5f) { toast = t; toastT = secs; }

        // ---------------- laço ----------------
        protected override void Update(GameTime gt)
        {
            float dt = Math.Min(0.05f, (float)gt.ElapsedGameTime.TotalSeconds); if (shotFrames >= 0) dt = 1 / 30f;
            inp.Read(); Layout();
            switch (screen)
            {
                case Screen.Menu: UpdateMenu(dt); break;
                case Screen.Create: UpdateCreate(dt); break;
                case Screen.Choose: UpdateChoose(dt); break;
                case Screen.Play: UpdatePlay(dt); break;
            }
            if (toastT > 0) toastT -= dt;
            base.Update(gt);
        }

        float Hour => (float)(minutes / 60.0) % 24;

        protected override void Draw(GameTime gt)
        {
            var vp = GraphicsDevice.Viewport;
            if (screen == Screen.Play || screen == Screen.Menu || screen == Screen.Create || screen == Screen.Choose) DrawWorld(vp, screen == Screen.Menu ? 17.4f : screen == Screen.Play ? Hour : 9.5f);
            sb.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend, SamplerState.PointClamp);
            if (screen == Screen.Menu) DrawMenu(vp);
            else if (screen == Screen.Create) DrawCreate(vp);
            else if (screen == Screen.Choose) DrawChoose(vp);
            else { DrawHud(vp); if (sheetOpen) DrawSheet(vp, sheetHorse ?? ride ?? Owned); if (pauseOpen) DrawPause(vp); }
            if (!sheetOpen && !pauseOpen) DrawToast(vp);
            sb.End();
            base.Draw(gt);
            if (shotFrames >= 0 && --shotFrames == 0) Shot();
        }

        // ---------------- captura para testes ----------------
        void SetupShot()
        {
            float hour = -1; for (int i = 0; i < args.Length; i++) if (args[i] == "--hour" && i + 1 < args.Length) hour = float.Parse(args[i + 1], System.Globalization.CultureInfo.InvariantCulture);
            var sc = shotScene ?? "menu";
            if (sc == "menu") { MenuInit(); return; }
            look = new CharacterLook { Name = "Ana", Skin = 1, Hair = 1, HairColor = 3, Outfit = 0, Hat = 1 }; charArt = new CharacterArt(GraphicsDevice, look);
            if (sc == "create") { screen = Screen.Create; return; }
            RollChoices(new Rng(5)); if (sc == "choose") { screen = Screen.Choose; return; }
            var h = choices[1]; StartNewGame(h); if (hour >= 0) minutes = hour * 60;
            if (sc == "ride" || sc == "gallop") { pos = new Vector2(h.X, h.Y + 30); Mount(h); shotGallop = sc == "gallop"; }
            if (sc == "sheet") { sheetOpen = true; sheetHorse = h; }
            if (sc == "herd") { var hh = HerdHome; pos = new Vector2(hh.X - 150, hh.Y); }
        }
        bool shotGallop;
        void Shot()
        {
            var vp = GraphicsDevice.Viewport; var data = new Color[vp.Width * vp.Height]; GraphicsDevice.GetBackBufferData(data);
            using (var t = new Texture2D(GraphicsDevice, vp.Width, vp.Height)) { t.SetData(data); using (var f = System.IO.File.Create(shotPath)) t.SaveAsPng(f, vp.Width, vp.Height); }
            Exit();
        }
    }
}
