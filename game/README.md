# Terra de Crinas — código do jogo

Jogo de aventura equestre em mundo aberto, pixel art 2.5D. **MonoGame 3.8 + C# (.NET 8)**, mesma base do
Stardew Valley; roda no computador (DesktopGL) e no Android. Ficha do jogo: `design/game-brief.md`.

## Por que MonoGame
- Pixel art 2D com controle total do desenho (ordenação por profundidade, mapa de luz, sem filtro).
- Um código só para computador e Android; o APK sai pelo GitHub Actions sem precisar de computador.
- Sistemas como classes C# separadas e testáveis (a lógica dos cavalos não depende do motor gráfico).

## Estrutura
| Pasta | Sistema |
|---|---|
| `Shared/Core` | `Rng` (aleatório determinístico e ruído), `SaveManager` (JSON atômico + `.bak`), `CharacterLook` |
| `Shared/World` | `WorldGen` (mundo determinístico 1024×1024 ladrilhos, biomas do vale, rancho), `ChunkStreamingManager` (pedaços 32×32 gerados em segundo plano, colisão) |
| `Shared/Horses` | `HorseBreeds` (12 raças), `HorsePersonality` (traços → comportamento), `Horse` (dados persistentes), `HorseMovement` (andaduras, fôlego, `RideController`), `HorseAI` (IA dos soltos), `HorseManager` |
| `Shared/Render` | `Atlas` (quadros gerados + fonte), `TerrainArt`, `PropArt` (cenário desenhado em código), `Lighting` (mapa de luz e atmosfera), `Px` |
| `Shared/Player` | `CharacterArt` (personagem com aparência escolhida e poses montado) |
| `Shared/UI` | `UiArt` (moldura de madeira, botões, ícones), `Input` (teclado, mouse, toque, joystick) |
| `Shared/GameRoot*.cs` | Telas, laço do jogo, desenho do mundo e interface |
| `Tests` | Testes xUnit da lógica (cavalos, mundo, salvamento) |

Os dados de cada cavalo (`Horse`) são independentes do desenho: o quadro é escolhido por raça, pelagem, vista,
animação e número do quadro no atlas gerado.

## Arte gerada
`tools/horse-rig/rig.js` desenha os cavalos (corpo, cabeça, pescoço, crina e cauda próprios de cada raça, três
vistas, andaduras e poses). `tools/asset-pipeline/export_assets.js` gera `Shared/Assets/atlas_N.png` +
`atlas.json` com todos os quadros e a fonte Pixelify Sans (OFL):

```bash
npm i --no-save playwright @fontsource/pixelify-sans
node tools/asset-pipeline/export_assets.js game/Shared/Assets
```

## Rodar e testar
```bash
cd game && dotnet test Tests/TerraDeCrinas.Tests.csproj
cd game/Desktop && dotnet run -c Release
# captura de tela de uma cena (usada como evidência de QA):
dotnet run -c Release -- --shot cena.png --scene menu|create|choose|play|ride|gallop|sheet|herd --hour 10
```

## Controles
Teclado: WASD anda · Shift corre / galopa · Espaço disparada · R ré · Ctrl passo · E montar/descer · F carinho ·
Q chamar o cavalo · Tab ficha do cavalo · Esc pausa. Toque: joystick à esquerda (leve = passo, forte = trote),
botões redondos à direita (ação, galope, disparada, ré / correr, carinho, chamar).
