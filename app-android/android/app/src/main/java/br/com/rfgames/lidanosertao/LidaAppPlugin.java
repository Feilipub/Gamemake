package br.com.rfgames.lidanosertao;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import android.util.Base64;

/**
 * Ponte do jogo com o Android: grava arquivos do jogo (save exportado, modelo de história)
 * na pasta Downloads/Lida no Sertao (fotos do modo foto vão para a galeria, em Imagens/Lida no Sertao),
 * ou abre o "Compartilhar" do Android em aparelhos antigos.
 * No jogo: Capacitor.Plugins.LidaApp.salvar({ nome, texto, mime, base64 }).
 */
@CapacitorPlugin(name = "LidaApp")
public class LidaAppPlugin extends Plugin {
    private static final String PASTA = "Lida no Sertao";

    @PluginMethod
    public void salvar(PluginCall call) {
        String nome = limpar(call.getString("nome", "lida.txt"));
        String texto = call.getString("texto", "");
        String mime = call.getString("mime", "application/octet-stream");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) { compartilhar(call); return; }
        try {
            ContentResolver cr = getContext().getContentResolver();
            boolean img = mime.startsWith("image/");
            ContentValues v = new ContentValues();
            v.put(MediaStore.MediaColumns.DISPLAY_NAME, nome);
            v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            v.put(MediaStore.MediaColumns.RELATIVE_PATH, (img ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS) + "/" + PASTA);
            Uri u = cr.insert(img ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI : MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (u == null) throw new Exception("sem acesso à pasta");
            try (OutputStream o = cr.openOutputStream(u)) { o.write(bytes(call, texto)); }
            JSObject r = new JSObject();
            r.put("onde", img ? "a galeria (Imagens/" + PASTA + ")" : "Downloads/" + PASTA);
            call.resolve(r);
        } catch (Exception e) {
            compartilhar(call);
        }
    }

    @PluginMethod
    public void compartilhar(PluginCall call) {
        String nome = limpar(call.getString("nome", "lida.txt"));
        String texto = call.getString("texto", "");
        String mime = call.getString("mime", "application/octet-stream");
        try {
            File dir = new File(getContext().getCacheDir(), "arquivos");
            dir.mkdirs();
            File f = new File(dir, nome);
            try (FileOutputStream o = new FileOutputStream(f)) { o.write(bytes(call, texto)); }
            Uri u = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mime);
            i.putExtra(Intent.EXTRA_STREAM, u);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent ch = Intent.createChooser(i, "Guardar " + nome);
            ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(ch);
            JSObject r = new JSObject();
            r.put("onde", "Compartilhar");
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Não consegui salvar: " + e.getMessage());
        }
    }

    /** Abre o "Compartilhar" do Android com um texto (convite do modo online para o WhatsApp etc.). */
    @PluginMethod
    public void texto(PluginCall call) {
        String t = call.getString("texto", "");
        try {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, t);
            Intent ch = Intent.createChooser(i, "Convidar amigos");
            ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(ch);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não consegui compartilhar: " + e.getMessage());
        }
    }

    /** O conteúdo vem como texto ou, para imagens, em base64 (base64: true). */
    private static byte[] bytes(PluginCall call, String texto) {
        if (Boolean.TRUE.equals(call.getBoolean("base64", false))) return Base64.decode(texto, Base64.DEFAULT);
        return texto.getBytes(StandardCharsets.UTF_8);
    }

    private static String limpar(String n) {
        String s = n.replaceAll("[\\\\/:*?\"<>|]", "_");
        return s.isEmpty() ? "lida.txt" : s;
    }
}
