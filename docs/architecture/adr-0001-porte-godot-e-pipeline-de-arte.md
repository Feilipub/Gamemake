# ADR-0001: Porte para Godot 4.7 com a arte exportada do protótipo HTML

## Status

Proposed

> Quem pode mudar para `Accepted`: o usuário (RF Games), ou o `technical-director`
> com confirmação explícita do usuário.

## Date

2026-11-03

## Last Verified

2026-11-03

## Decision Makers

RF Games (Ryan Duarte Borges, Felipe Rodrigues Campos), com implementação assistida.

## Summary

Lida no Sertão era um HTML único (v3.2, 7.189 linhas) com toda a pixel art desenhada por
código. Decidimos portar para Godot 4.7, somente para Android, **sem redesenhar a arte**:
um pipeline roda os geradores do próprio protótipo no Chromium e exporta PNGs e JSON
(mapa, colisão, objetos, tiras de animação) que o Godot carrega.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Godot 4.7.2 |
| **Domain** | Core / Rendering / Input / Audio |
| **Layer** | Foundation |
| **Knowledge Risk** | HIGH — 4.7 é posterior ao corte de conhecimento (ver `docs/engine-reference/godot/VERSION.md`) |
| **References Consulted** | `docs/engine-reference/godot/breaking-changes.md`, `deprecated-apis.md`, `modules/input.md`, `modules/audio.md` |
| **Post-Cutoff APIs Used** | Nenhuma API nova. Respeitado: override com retorno tipado precisa de `return` explícito (4.7); padrões de stretch de projeto novo (4.7) definidos explicitamente; mouse/teclado não usam `device == 0`. O nó `VirtualJoystick` (4.7) **não** foi usado: joystick próprio (`src/ui/virtual_stick.gd`). |
| **Verification Required** | Rodar no Android real: toque multiponto (joystick + botão Correr), orientação `sensor`, áudio MP3 e desempenho do GL Compatibility com ~1.500 sprites. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | Porte dos demais sistemas da v3.2 (economia, NPCs, cidade, fauna, eventos) |
| **Blocks** | None |
| **Ordering Note** | Qualquer mudança visual no protótipo exige rodar o pipeline de novo. |

## Context

### Problem Statement

O jogo em HTML não abre em visualizadores com sandbox, perde o save fora do navegador,
depende de autoplay para a música e não vira app instalável. A RF Games escolheu Godot 4
com alvo somente Android.

### Current State

Protótipo v3.2 em `prototypes/html-v3.2/index.html` (referência e fonte da arte).

### Constraints

- A arte é procedural (canvas); redesenhar ~70 animações à mão levaria meses.
- O Godot não roda JavaScript; não há como reaproveitar o código de desenho diretamente.
- Ambiente de desenvolvimento sem Android SDK (download bloqueado).

### Requirements

- Arte idêntica à do protótipo.
- Rodar em Android de entrada.
- Valores de jogo em dados, lógica testável.

## Decision

1. **Pipeline de arte** (`tools/asset-pipeline/export_from_html.js`, Playwright): abre o
   protótipo com `#debug`, inicia uma partida e chama os geradores internos (`charSpr`,
   `RIG.get`, `drawMounted`, `propSpr`, `bldSpr`, `fenceSpr`, `buildGround`…). Salva tiras PNG
   e `assets/data/world_map.json` + `art_sprites.json` (schema em `assets/data/data_schema.md`).
2. **Godot 4.7, GDScript, renderizador GL Compatibility**, tela `canvas_items` + `expand`,
   orientação `sensor`, filtro de textura `nearest`.
3. **Colisão por grade** (`CollisionGrid`), igual à do protótipo, em vez de física 2D:
   determinística, barata e testável.
4. **Lógica separada da apresentação**: `HerdBrain` e `GameClock` são `RefCounted` puros com
   testes; nós de cena só aplicam movimento e animação.
5. **Toque e teclado pelas mesmas ações**: o joystick chama `Input.action_press`.

### Key Interfaces

- `CollisionGrid.move(pos, delta, half) -> Vector2`
- `HerdBrain.step(dt, pos, ctx, rng) -> Vector2` (estados documentados no arquivo)
- `GameClock.advance(dt)`, `light_color()`
- `GameData.build_frames(key, anims) -> SpriteFrames`; `StripSprite.show_anim(anim, flip)`
- `Music.play("intro" | "cutscene" | "game")`

## Alternatives Considered

### Alternative 1: Reescrever os geradores de sprite em GDScript

Preserva a geração procedural (pelagens, roupas infinitas), mas são ~2.500 linhas de desenho
para portar e validar pixel a pixel. Fica para quando a personalização completa do vaqueiro
precisar de combinações que o pipeline não pré-gera.

### Alternative 2: Empacotar o HTML como app (Capacitor/Electron)

Rápido e sem perda, mas não é o motor de jogo que a RF Games pediu.

## Consequences

### Positive

- Arte idêntica desde o primeiro dia; ~4 MB de PNG.
- Lógica central coberta por testes headless.

### Negative

- A aparência do vaqueiro é fixa (a do padrão) até exportar mais combinações ou portar `drawChar`.
- O protótipo precisa continuar no repositório como fonte da arte.

### Neutral

- Os testes usam um executor mínimo (`tests/run_tests.gd`) até `/test-setup` instalar o gdUnit4.

## Risks

- O Godot 4.7 é posterior ao corte de conhecimento; tudo foi validado rodando o motor 4.7.2.
- O desempenho em Android de entrada ainda não foi medido.

## GDD Requirements Addressed

Ainda não há GDD; o protótipo v3.2 é a referência de design.

## Performance Implications

~1.500 `Sprite2D` estáticos com y-sort. No Mesa llvmpipe (software) roda; medir em aparelho.

## Migration Plan

Fatias: (1) mapa, vaqueiro, montaria, gado, aboio, câmera, toque, título, música, save →
(2) economia, inventário e menus → (3) NPCs e cidade → (4) fauna, onça e defesa →
(5) açude, eventos, cutscenes.

## Validation Criteria

Testes passando; capturas em `production/qa/evidence/port-s1-*.png`; APK rodando em um
Android real.

## Related

`prototypes/html-v3.2/index.html`, `assets/data/data_schema.md`, `docs/port-godot.md`.
