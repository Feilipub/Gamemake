# App Android do Lida no Sertão

Empacota o jogo (`../jogo/index.html`) num app Android com o [Capacitor](https://capacitorjs.com). O jogo roda direto do aparelho, sem internet.

## Gerar uma versão nova
1. Suba o número da versão em `android/app/build.gradle` (`versionCode` sempre maior que o anterior; `versionName` igual ao `GAME_V` do jogo).
2. Precisa do Android SDK (variável `ANDROID_HOME`) e do arquivo `android/keystore.properties` (fora do git), apontando para a chave de upload:
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
4. Saídas: `android/app/build/outputs/bundle/release/app-release.aab` (Play Store) e `.../apk/release/app-release.apk` (instalar direto).

Ícones e tela de abertura ficam em `android/app/src/main/res/` (feitos a partir de `../jogo/icon-512.png`).
