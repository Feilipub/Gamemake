// Lida no Sertão (MonoGame, Android): a atividade que abre o jogo em tela cheia.
using Android.App;
using Android.Content.PM;
using Android.OS;
using Android.Views;
using Microsoft.Xna.Framework;

namespace Lida
{
    [Activity(Label = "Lida no Sertão (MonoGame)", MainLauncher = true, AlwaysRetainTaskState = true, LaunchMode = LaunchMode.SingleInstance,
        ScreenOrientation = ScreenOrientation.FullUser, Theme = "@android:style/Theme.NoTitleBar.Fullscreen",
        ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.Keyboard | ConfigChanges.KeyboardHidden | ConfigChanges.ScreenSize | ConfigChanges.ScreenLayout)]
    public class Activity1 : AndroidGameActivity
    {
        LidaGame game;
        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            game = new LidaGame();
            SetContentView((View)game.Services.GetService(typeof(View)));
            game.Run();
        }
    }
}
