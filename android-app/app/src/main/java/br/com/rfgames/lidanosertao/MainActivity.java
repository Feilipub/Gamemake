package br.com.rfgames.lidanosertao;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * Tela única do app: abre o jogo HTML completo (assets/www/index.html) em tela cheia.
 * Os arquivos são servidos por https://appassets.androidplatform.net (WebViewAssetLoader), então
 * o salvamento (IndexedDB/localStorage), as músicas e a fonte funcionam sem internet.
 */
public class MainActivity extends Activity {
    private static final String HOME = "https://appassets.androidplatform.net/www/index.html";
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setTextZoom(100);
        web.setBackgroundColor(0xFF000000);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                return !"appassets.androidplatform.net".equals(u.getHost());
            }
        });
        setContentView(web);
        if (state != null) web.restoreState(state);
        else web.loadUrl(HOME);
        immersive();
    }

    private void immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) immersive();
    }

    /** Voltar do Android = tecla Esc do jogo (fecha janelas / abre o menu). */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));"
                + "setTimeout(function(){window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}));},60);", null);
    }

    @Override
    protected void onPause() {
        web.evaluateJavascript("try{window.dispatchEvent(new Event('pagehide'));}catch(e){}", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        immersive();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }
}
