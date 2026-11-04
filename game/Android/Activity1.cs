// Terra de Crinas (Android): atividade principal em tela cheia.
using Android.App;
using Android.Content.PM;
using Android.OS;
using Android.Views;
using Microsoft.Xna.Framework;

namespace Crinas
{
    [Activity(Label = "Terra de Crinas", MainLauncher = true, Icon = "@drawable/icon", AlwaysRetainTaskState = true, LaunchMode = LaunchMode.SingleInstance,
        ScreenOrientation = ScreenOrientation.SensorLandscape, Theme = "@android:style/Theme.NoTitleBar.Fullscreen",
        ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.Keyboard | ConfigChanges.KeyboardHidden | ConfigChanges.ScreenSize | ConfigChanges.ScreenLayout | ConfigChanges.UiMode | ConfigChanges.SmallestScreenSize)]
    public class Activity1 : AndroidGameActivity
    {
        GameRoot game;
        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            game = new GameRoot();
            SetContentView((View)game.Services.GetService(typeof(View)));
            game.Run();
        }
    }
}
