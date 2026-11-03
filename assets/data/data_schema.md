# Dados do jogo (`assets/data/`)

Arquivos JSON lidos por `src/core/game_data.gd`. Os dois primeiros são **gerados** pelo
pipeline `tools/asset-pipeline/export_from_html.js` a partir do protótipo HTML
(`prototypes/html-v3.2/index.html`). Não edite à mão: rode o pipeline de novo.

## `world_map.json` (gerado) — schema_version 1

| Chave | Tipo | Significado |
|---|---|---|
| `schema_version` | int | Versão do formato (1). |
| `tile_size` | int | Lado de um tile em pixels de mundo (16). |
| `map_width`, `map_height` | int | Tamanho do mapa em tiles (112 × 90). |
| `solid` | int[] | `map_width*map_height` valores, linha a linha: 1 = tile bloqueado (cerca, parede, prédio). |
| `water` | int[] | Mesmo formato: 1 = água (açude, riacho). Hoje também bloqueia. |
| `spawn` | {x, y} | Onde o vaqueiro começa (pixels de mundo, ponto do pé). |
| `herd` | [{x, y, sex, n}] | Rebanho inicial do jogador: posição, sexo (`F`/`M`) e nome. |
| `areas` | objeto | Áreas cercadas do protótipo (piquetes, curral…), em tiles `[x0, y0, x1, y1]`. |
| `objects` | [obj] | Tudo que fica de pé no mapa, desenhado com ordenação por profundidade. |

Cada `obj`:

| Chave | Significado |
|---|---|
| `t` | Caminho da textura (`res://assets/art/world/obj/...png`). Prédios também têm `..._n.png` (noite, janelas acesas). |
| `x`, `y` | Canto superior esquerdo onde a textura é desenhada (pixels de mundo). |
| `s` | Linha de ordenação (o "pé" do objeto): quem tem `s` maior fica na frente. |
| `k` | Tipo: `fence`, `gate`, `prop`, `tree`, `bld`. |
| `px`, `py` | (árvores) base do tronco, usada para a sombra. |
| `id`, `w` | (prédios) identificador e largura em pixels. |

## `art_sprites.json` (gerado)

Mapa `nome_da_tira -> {file, fw, fh, n, ox, oy}`: cada tira é um PNG com `n` quadros de
`fw × fh` lado a lado; `(ox, oy)` é a âncora (o ponto do pé) dentro do quadro. Nomes:
`player_<pose>_<dir>`, `mounted_<andadura>_<dir>`, `horse_<anim>_<vista>`,
`peduro<F|M>_<anim>_<vista>`. `dir`: 0 frente, 1 costas, 3 direita (esquerda = espelho de 3).
`vista`: `side` (olhando para a direita), `front`, `back`.

## `game_tuning.json` (editável)

Valores de jogo ajustáveis. Velocidades em **pixels de mundo por segundo** (1 tile = 16 px);
tempos em segundos; raios em pixels.

| Seção | Chave | Significado |
|---|---|---|
| `player` | `walk_speed`, `run_speed` | Andar e correr a pé. |
| | `half_size` | Meia-caixa de colisão `[x, y]` em volta do pé. |
| `mount` | `walk_speed`, `trot_speed`, `gallop_speed` | Passo, trote e galope montado. |
| | `trot_stick_threshold` | Inclinação do joystick (0–1) a partir da qual o cavalo trota. |
| | `stamina_max`, `stamina_drain_per_sec`, `stamina_regen_per_sec` | Fôlego: gasta galopando, recupera nas outras andaduras. |
| | `stamina_min_to_gallop` | Abaixo disso o cavalo não galopa. |
| | `mount_distance` | Distância máxima para montar; mais longe, o vaqueiro assobia. |
| | `call_speed` | Velocidade do cavalo vindo ao assobio. |
| | `idle_eat_cycle_sec` | Faixa `[min, max]` de cada período parado/pastando. |
| `cattle` | `walk_speed`, `trot_speed`, `flee_speed` | Andaduras do gado. |
| | `flee_radius`, `flee_radius_fast`, `fast_speed_ref` | Raio de pressão do vaqueiro: cresce de `flee_radius` (parado) até `flee_radius_fast` quando ele vem a `fast_speed_ref` px/s. |
| | `follow_radius`, `follow_stop_distance` | No aboio, o gado segue quem está até `follow_radius` e para a `follow_stop_distance`. |
| | `separation_radius`, `separation_weight` | Quanto os animais se afastam uns dos outros. |
| | `cohesion_radius`, `cohesion_weight` | Puxão para o centro do grupo quando vagueiam. |
| | `graze_chance`, `idle_chance`, `state_min_sec`, `state_max_sec` | Sorteio da rotina livre (pastar / parar / vaguear) e quanto dura. |
| | `aboio_duration_sec` | Quanto tempo o aboio segura o gado. |
| | `steer_rate` | Quão rápido o animal muda de direção (suavização). |
| | `neighbor_radius` | Até onde um animal enxerga os vizinhos. |
| `time` | `day_length_sec`, `start_minute` | Duração do dia em segundos reais; hora inicial em minutos (390 = 6h30). |
| `camera` | `zoom`, `zoom_min`, `zoom_max`, `wheel_step` | Zoom padrão e limites; passo da rodinha/pinça. |
| | `follow_speed`, `title_pan_speed` | Suavização da câmera; velocidade do passeio no título. |
| `music` | `fade_in_sec`, `fade_out_sec`, `crossfade_before_end_sec` | Transições entre trilhas. |
| | `music_volume`, `sfx_volume` | Volumes iniciais (0–1). |
