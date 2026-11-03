# ADR-0002: o APK roda o jogo HTML completo num WebView

**Status:** Proposed (aguarda o "aprovo" da RF Games)
**Data:** 2026-11-03
**Substitui em parte:** ADR-0001 (o porte em Godot continua no repositório, mas não é o que vai no APK)

## Contexto
A RF Games pediu "nada faltando no APK" e "me entregue tudo pronto". O porte em Godot tinha só uma
fatia (mapa, vaqueiro, cavalo, 2 bois, porteiras, roça e cochos); a comparação de 03/11/2026
(`production/qa/comparacao_html_vs_app.md`) mostrou que quase todos os sistemas do HTML faltavam.

## Decisão
O APK passa a ser um app Android leve (`android-app/`) que abre `web/index.html` em tela cheia num
WebView, servido pelo `WebViewAssetLoader` (origem https local), com músicas e fonte dentro do APK.
`prototypes/html-v3.2/index.html` fica intocado como fonte da verdade; `web/index.html` é a cópia
mantida, onde entram as novidades (casa, cercas, roça). A arte nova é gerada por
`tools/asset-pipeline/art_extras.js`, o mesmo código usado no Godot.

## Alternativas
- Terminar o porte em Godot antes de entregar: meses de trabalho com o jogo incompleto no celular.
- PWA/site: a RF Games não tem computador e quer instalar um APK.

## Consequências
- Todos os sistemas do HTML ficam no APK no mesmo dia, offline.
- Desempenho depende do WebView do aparelho (Chrome do sistema); celulares muito antigos podem
  ficar mais lentos que no Godot.
- O salvamento fica no IndexedDB do app (não migra o save do navegador nem o do APK em Godot).
- O build do CI é Gradle puro (sem Godot); a chave e o pacote são os mesmos, então instala por cima.
