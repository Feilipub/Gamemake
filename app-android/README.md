# App Android do Lida no Sertão

Empacota o jogo (`../jogo/index.html`) num app Android com o [Capacitor](https://capacitorjs.com). O jogo roda direto do aparelho, sem internet. A internet só é usada no modo online.

## Ponte com o jogo
- **`LidaAppPlugin.java`:** é o plugin `LidaApp`. Ele grava arquivos do jogo, como o save exportado e o modelo de história, em `Downloads/Lida no Sertao`. No Android 9 ou anterior, abre a tela de compartilhar. No jogo, é usado pela função `baixarArquivo()`.
- **`MainActivity.java`:**
  - **Tela:** tela cheia, e a tela fica acesa enquanto joga.
  - **Botão voltar:** chama `window.lidaVoltar()`. O jogo fecha o que estiver aberto; na tela inicial, o app vai para segundo plano.

## Gerar uma versão na nuvem (automático)
A cada atualização do jogo, o workflow `.github/workflows/lida-android.yml` compila o app sozinho. Veja os segredos e o envio para a Play Store em `../loja/LEIA-ME.md`, Passo 7. Na nuvem, o número de versão é `número da execução` + `00` (100, 200…).

## Gerar uma versão no computador
1. **Versão:** em `android/app/build.gradle`, o `versionCode` padrão tem que ser maior que o último enviado. Também dá para definir pela variável `VERSION_CODE`. O `versionName` deve ser igual ao `GAME_V` do jogo.
2. **Requisitos:**
   - Android SDK com a plataforma 36 (variável `ANDROID_HOME`).
   - O arquivo `android/keystore.properties`, que fica fora do git e aponta para a chave de upload:
     ```
     storeFile=/caminho/para/lida-upload.jks
     storePassword=...
     keyAlias=lida-upload
     keyPassword=...
     ```
3. Rode:
   ```
   npm install
   npm run sync                      # copia o jogo para www/ e atualiza o projeto Android
   cd android && ./gradlew bundleRelease assembleRelease
   ```
4. Saídas:
   - `android/app/build/outputs/bundle/release/app-release.aab` (Play Store);
   - `.../apk/release/app-release.apk` (instalar direto).

Ícones e tela de abertura ficam em `android/app/src/main/res/`. Eles foram feitos a partir de `../jogo/icon-512.png`.
