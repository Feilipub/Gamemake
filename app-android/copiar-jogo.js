// Copia o jogo (pasta ../jogo) para www/, que o Capacitor empacota dentro do app.
// O service worker fica de fora: no app o jogo já roda offline, direto do aparelho.
const fs = require('fs'), path = require('path');
const de = path.join(__dirname, '..', 'jogo'), para = path.join(__dirname, 'www');
fs.rmSync(para, { recursive: true, force: true }); fs.mkdirSync(para, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(de, f), path.join(para, f));
console.log('jogo copiado para www/');
