# Relatório: sessão de gráficos e animação (v21 → v25)

## Avaliação sincera do ponto de partida

Na v20, o 3D era uma homenagem ao PlayStation 1. Mesmo assim, ficava abaixo dos bons jogos daquela época:

- tudo era cor lisa, sem textura;
- os bonecos eram de caixinha, sem joelho, rosto ou mão;
- a animação era pobre;
- o chão era plano;
- não se via o céu;
- a imagem era pequena (192 px no lado curto);
- casas e árvores não faziam sombra.

## O que mudou (tudo commitado e testado)

### v21 — 3D fase 2
- **Lugares em 3D:** casas por dentro, as 16 cenas, pesca e canoa, vaquejada.
- **Fazenda:** obras, cochos e roça.
- **Mais vida no mapa:** peões, bichos do mato, carroças e trânsito.
- **Configurações:** Ajustes do 3D.

### v22 — 3D fase 3
- **Luzes da noite:** postes, fogueira, janelas e lampião.
- **Fogueira:** chamas e fumaça.
- **Pássaros e cidade:** aves e enfeites da cidade.
- **Festa na praça:** bandeirolas e barracas.
- **Desempenho:** só desenha o que está na tela, com cerca de 3 vezes menos triângulos.

### v23 — Gráficos 2.0
- **Texturas:** 16 tipos, desenhadas pelo próprio jogo.
- **Gente nova:**
  - juntas (quadril, joelho, ombro, cotovelo) e mãos;
  - rosto com olhos que piscam, sobrancelha, barba e bigode;
  - 8 cortes de cabelo, chapéus por tipo e cada peça de roupa.
- **Animação de gente:** passada dobrando o joelho, braços ao contrário das pernas, respiração e olhar em volta.
- **Bichos novos:**
  - passo, trote e galope;
  - pescoço que abaixa para pastar, rabo espantando mosca;
  - gado com cupim, barbela e chifres por raça.
- **Câmera baixa:** mostra o horizonte e o céu, com sol, lua, estrelas, nuvens e serras.
- **Mato e terreno:** capim e flores que balançam com o vento, morros suaves.
- **Luz:** sombras pelo sol, água que reflete o céu e acabamento de cor.
- **Nitidez:** 288 px no lado curto da tela.

### v24 — Acabamento
- **Casas:** barra pintada, janelas com folhas de madeira, alpendre e chaminé na sede.
- **Cidade:** igreja com torre, prefeitura e banco com colunas, bandeira, lojas com toldo e letreiro.
- **Dentro de casa:** fogão a lenha, cama com cabeceira, mesa posta, baú, guarda-roupa, selas e quadros.
- **Árvores:** galhos e copa cheia; ipê florido, manga e caju com frutos.
- **Veículos:** carros, ônibus e caminhões com rodas e faróis que acendem.
- **Ver através do telhado:** quando uma casa tapa o vaqueiro, a parte da frente vira pontilhado.
- **Ações do vaqueiro:** laço, aboio, enxada, martelo, regar, dar comida, selar e acenar; o cavaleiro sobe e desce com o cavalo.
- **Partículas:** poeira do galope, respingos da chuva e vaga-lumes.
- **Desempenho:** montar os quadros na cidade ficou quase 2 vezes mais rápido.

### v25 — Mais vida e o 3D como padrão
- **3D padrão:** o 3D vira o visual padrão, e o jogo alivia o 3D sozinho em celular fraco.
- **Tela inicial em 3D:** a fazenda ao entardecer atrás do título.
- **Criação de personagem em 3D:** o vaqueiro aparece na criação e no guarda-roupa.
- **Pelagens:** todas as pelagens de gado, cavalo, cão e cabra.
- **Mais vida:** moradores falam com as mãos, peões fazem o gesto do trabalho e o cão senta.
- **Correção:** tecla Z/X personalizada não gira mais a câmera.

### v25.1 — Acabamento final
- **Noite de luar:** azulada, com o caminho visível.
- **Nuvens:** sombras de nuvens passando pelo campo.
- **Casas por dentro:** câmera mais perto no celular em pé.
- **Bichos:** corpo mais arredondado.
- **Testes:** o teste do fogo no pasto não depende mais da sorte.

## Como está agora, comparado a jogos atuais

- **Estilo PS1:** agora está no nível dos bons jogos de fazenda de PS1, e acima deles em luz (sombras pelo sol, água refletindo, céu dinâmico).
- **Ainda falta para jogos atuais de 2024–2026:**
  - modelos esculpidos (os nossos são feitos de blocos);
  - texturas pintadas à mão;
  - animação capturada.
- **Limitação do formato:** com um jogo em um arquivo só, desenhado pelo próprio código e leve para celular, esse é o teto realista. Chegar no nível de um jogo comercial atual exigiria modelos e animações feitos por artistas em programas como o Blender.

## Ajustes do 3D (Configurações)

Tudo o que é novo pode ser desligado para deixar o jogo mais leve em celulares fracos:

- tremidinho PS1;
- nitidez;
- cenas em 3D;
- texturas;
- câmera baixa ou alta;
- mato;
- morros;
- sombras;
- brilho e cor;
- ver através do telhado;
- árvores caprichadas;
- partículas.
