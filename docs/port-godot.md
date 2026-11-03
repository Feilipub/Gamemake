# Lida no Sertão em Godot — como rodar, testar e exportar

## Abrir e rodar

1. Instale o **Godot 4.7.2** (versão padrão, não a .NET): https://godotengine.org/download
2. Abra o Godot → **Importar** → escolha `project.godot` na raiz deste repositório.
3. Aperte **F5**. O jogo abre na tela de título (RF GAMES → LIDA NO SERTÃO).

Linha de comando:

```bash
godot --headless --path . --import          # primeira vez (importa PNG/MP3)
godot --path . --windowed --resolution 1280x720
```

## Controles

| Ação | Teclado | Toque |
|---|---|---|
| Andar | WASD / setas | joystick (canto esquerdo) |
| Correr / galopar | Shift | botão **Correr** (segurar) |
| Montar / desmontar (longe: assobia) | R | botão **Montar** |
| Aboio (o gado segue você) | Q | botão **Aboio** |
| Zoom | + / − ou rodinha | pinça com dois dedos |

## Testes

```bash
godot --headless --path . -s res://tests/run_tests.gd
```

## Regerar a arte e o mapa a partir do protótipo

```bash
npm i playwright && npx playwright install chromium   # uma vez
node tools/asset-pipeline/export_from_html.js prototypes/html-v3.2/index.html .
godot --headless --path . --import
```

## Exportar

No editor: **Projeto → Exportar**. O preset **Android** já está configurado (`export_presets.cfg`); o alvo do jogo é somente Android.
Na primeira vez, o Godot pede para **baixar os modelos de exportação** (Editor → Gerenciar
modelos de exportação → Baixar).

### Android (APK)

1. Instale o **Android Studio** (traz o SDK) e um **JDK 17+**.
2. No Godot: **Editor → Configurações do Editor → Exportar → Android**: preencha
   *Android SDK Path* e *Java SDK Path*. O Godot cria a keystore de depuração sozinho.
3. Para publicar na Play Store, gere uma keystore de release
   (`keytool -genkey -v -keystore rfgames.keystore -alias rfgames -keyalg RSA -validity 10000`)
   e preencha em **Projeto → Exportar → Android → Keystore → Release**.
4. Preset **Android** → Exportar projeto → `build/android/LidaNoSertao.apk`.
   Pacote: `br.com.rfgames.lidanosertao`, arm64 + armv7, tela imersiva, gira com o aparelho.
5. Com o celular em modo desenvolvedor e cabo USB, o botão **Implantação remota** (ícone do
   Android no canto superior direito) instala e abre direto no aparelho.

## Estado do porte

Fatia 1 (pronta): mapa completo da fazenda e da cidade, colisão, cercas/porteiras/árvores/prédios,
luz do dia e janelas acesas à noite, vaqueiro (parado/andando/correndo), montaria com passo,
trote, galope e fôlego, cavalo que pasta e atende ao assobio, rebanho Pé-Duro com pastejo,
fuga pela pressão do cavaleiro e aboio, câmera com zoom/pinça, joystick e botões de toque,
título com a abertura RF GAMES, trilhas INTRO e GAME1/GAME2 com crossfade, salvamento
automático com cópia de segurança.

Ainda só no HTML (próximas fatias): criação do personagem, economia e loja, inventário e
menus, NPCs e a cidade viva, peões, cabras e cães, fauna e onça, açude com natação, eventos,
cutscene com a trilha CUTSCENE.
