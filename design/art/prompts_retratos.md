# Pedidos para IA de imagem: retratos dos personagens

Copie o **estilo base** + o **pedido do personagem** num app de IA (PixelLab, Retro Diffusion, ChatGPT ou Gemini).
Os pedidos estão em inglês porque essas IAs entendem melhor; a explicação está em português.

## Como os retratos são formulados (o padrão de traço)

- **Formato:** quadrado 64x64 pixels, busto do peito para cima, cabeça grande ocupando ~60% do quadro.
- **Pose:** rosto levemente virado (3/4), olhando para quem joga.
- **Traço:** contorno escuro (quase preto, puxado para o marrom) em volta de tudo e entre cabelo, rosto e roupa.
- **Sombra:** em faixas limpas (2 a 3 tons por material), luz vindo de cima à esquerda; sombra puxada para o vinho/marrom, nunca cinza.
- **Olhos:** grandes, íris colorida, pupila escura e um ponto branco de brilho; mulheres com cílios marcados.
- **Cabelo:** mechas grossas, com faixa de brilho clara no alto da cabeça.
- **Rosto:** formato varia (oval, redondo, quadrado, fino, largo); bochechas rosadas nas mulheres e nos jovens; rugas nos idosos.
- **Identidade sertaneja:** chapéu de couro com aba em meia-lua e estrelas, chapéu de palha, gibão de couro, lenço, bata bordada.
- **Fundo:** liso, de uma cor só (eu recorto depois).

## Estilo base (cole antes de cada pedido)

```
16-bit pixel art character portrait, cozy farming-sim RPG dialogue portrait style, bust shot from chest up, head slightly turned three-quarters, large expressive eyes with white highlight, bold dark outline, clean cel shading with warm highlights and reddish-brown shadows, chunky hair locks with bright highlight strands, saturated warm colors, 64x64 pixels, plain flat single-color background, no text, original character
```

**Evitar (campo 'negative prompt', se o app tiver):**

```
blurry, photorealistic, 3d render, anti-aliasing, gradient background, text, watermark, extra fingers, copyrighted character
```

## Estilo cordel (xilogravura) — cole antes de cada pedido

O jogador escolheu o visual de capa de cordel. Desenho por código não chega na qualidade de um entalhe feito à mão, então este estilo deve ser gerado numa IA de imagem e depois ajustado e colocado no jogo.

```
Brazilian cordel literature woodcut print portrait (xilogravura nordestina), in the tradition of J. Borges, bust shot from chest up, head slightly turned three-quarters, bold black ink carved lines on aged cream paper, expressive hand-carved hatching that follows the forms of the face, strong contrast, visible gouge marks, simple sun with carved rays in the background, thick double border frame, one spot color only (dull red) used sparingly on scarf or hat band, square composition, no text, original character
```

**Evitar:** `color photo, 3d render, smooth gradients, anime, cartoon, blurry, watermark, text, signature`

Gere em 512x512 ou 1024x1024; eu reduzo para o tamanho do retrato, mantendo o traço.

## Dicas

- Gere um personagem por vez e peça 4 variações; escolha a melhor.
- Use **o mesmo estilo base em todos** para os retratos combinarem entre si.
- No PixelLab/Retro Diffusion, escolha tamanho 64x64 (ou 128x128) e fundo transparente se houver a opção.
- Mande as imagens aqui com o nome do personagem; eu recorto, ajusto as cores e coloco no jogo.

## Pedidos por personagem

### Sr. Felipe — Fazendeiro vizinho

```
adult Brazilian sertanejo man, tan brown skin, grey short hair, off-white button-up shirt, wearing a dark felt country hat, calm expression, works as fazendeiro vizinho
```

### Sr. Ryan — Criador de cavalos e muares

```
adult Brazilian sertanejo man, fair skin, auburn hair in a ponytail, blue plaid button shirt, wearing a cream rodeo cowboy hat, smiling warmly expression, works as criador de cavalos e muares
```

### Dona Zefa — Dona do Bar

```
adult Brazilian sertanejo woman, brown skin, grey hair in a bun, white embroidered peasant blouse, wearing a seed-bead necklace, calm expression, works as dona do bar
```

### Seu Tonho — Açougueiro

```
adult Brazilian sertanejo man, light tan skin, black buzz cut, off-white t-shirt, wearing a baseball cap, smiling warmly expression, works as açougueiro
```

### Mestre Chico — Pedreiro

```
adult Brazilian sertanejo man, dark brown skin, black curly hair, mustard yellow t-shirt, wearing a woven straw hat, smiling warmly expression, works as pedreiro
```

### Dona Lúcia — Gerente do Banco do Sertão

```
adult Brazilian sertanejo woman, light tan skin, dark brown long straight hair, glasses, black button-up shirt, wearing glasses, calm expression, works as gerente do banco do sertão
```

### Joana — Balconista da Casa do Agro

```
adult Brazilian sertanejo woman, tan brown skin, brown a long braid, green plaid button shirt, wearing a baseball cap, calm expression, works as balconista da casa do agro
```

### Seu Dito — Dono do Mercadinho

```
adult Brazilian sertanejo man, fair skin, white buzz cut, white dense stubble, red button-up shirt, smiling warmly expression, works as dono do mercadinho
```

### Padre Antônio — Pároco da Matriz

```
adult Brazilian sertanejo man, very fair skin, white buzz cut, white dense stubble, black t-shirt, calm expression, works as pároco da matriz
```

### Cida — Costureira

```
adult Brazilian sertanejo woman, dark brown skin, black big afro hair, white embroidered peasant blouse, wearing a seed-bead necklace, calm expression, works as costureira
```

### Seu Bené — Vaqueiro aposentado

```
adult Brazilian sertanejo man, brown skin, white buzz cut, white full beard, brown leather vaqueiro jacket (gibão) with stitching, wearing a Brazilian sertanejo leather cowboy hat with the front brim folded up in a half-moon, decorated with small stars, wearing a neckerchief, smiling warmly expression, works as vaqueiro aposentado
```

### Seu Abílio — Pecuarista da Serra Azul

```
adult Brazilian sertanejo man, fair skin, grey buzz cut, off-white button-up shirt, wearing a dark felt country hat, smiling warmly expression, works as pecuarista da serra azul
```

### Dona Graça — Criadora de cavalos

```
adult Brazilian sertanejo woman, tan brown skin, dark brown long straight hair, green button-up shirt, wearing a wide light-beige pantaneiro hat, wearing a neckerchief, calm expression, works as criadora de cavalos
```

### Seu Zé Preá — Pequeno criador de cabras

```
adult Brazilian sertanejo man, dark brown skin, black short hair, black goatee, brown t-shirt, wearing a woven straw hat, smiling warmly expression, works as pequeno criador de cabras
```

### Seu Dorival — Leiloeiro

```
adult Brazilian sertanejo man, light tan skin, grey buzz cut, off-white button-up shirt, wearing a cream rodeo cowboy hat, smiling warmly expression, works as leiloeiro
```

### Professora Rita — Professora da Escola Municipal

```
adult Brazilian sertanejo woman, brown skin, black hair in a ponytail, glasses, brown button-up shirt, wearing glasses, calm expression, works as professora da escola municipal
```

### Seu Raimundo — Ferreiro

```
adult Brazilian sertanejo man, dark brown skin, black big afro hair, black classic moustache, mustard yellow t-shirt, smiling warmly expression, works as ferreiro
```

### Seu Elias — Farmacêutico

```
adult Brazilian sertanejo man, fair skin, white buzz cut, black button-up shirt, wearing colorful Bonfim ribbons, calm expression, works as farmacêutico
```

### Dona Nena — Rezadeira e raizeira

```
adult Brazilian sertanejo woman, deep dark brown skin, white hair in a bun, white embroidered peasant blouse, wearing a seed-bead necklace, calm expression, works as rezadeira e raizeira
```

### Zé Cantador — Repentista e violeiro

```
adult Brazilian sertanejo man, tan brown skin, dark brown curly hair, dark brown short stubble beard, purple plaid button shirt, wearing a Brazilian sertanejo leather cowboy hat with the front brim folded up in a half-moon, decorated with small stars, wearing a neckerchief, smiling warmly expression, works as repentista e violeiro
```

### Seu Lourival — Carteiro e sanfoneiro

```
adult Brazilian sertanejo man, light tan skin, brown short hair, brown classic moustache, green button-up shirt, wearing a baseball cap, smiling warmly expression, works as carteiro e sanfoneiro
```

### Seu Valdomiro — Pecuarista tradicional

```
adult Brazilian sertanejo man, tan brown skin, white buzz cut, white dense stubble, brown leather vaqueiro jacket (gibão) with stitching, wearing a Brazilian sertanejo leather cowboy hat with the front brim folded up in a half-moon, decorated with small stars, wearing a neckerchief, smiling warmly expression, works as pecuarista tradicional
```

### Toinho — Peão da Riacho Doce

```
adult Brazilian sertanejo man, dark brown skin, black curly hair, black dense stubble, green plaid button shirt, wearing a woven straw hat, calm expression, works as peão da riacho doce
```

### Dra. Helena Prado — Zootecnista e criadora

```
adult Brazilian sertanejo woman, fair skin, auburn long straight hair, glasses, black button-up shirt, wearing a wide light-beige pantaneiro hat, wearing glasses, smiling warmly expression, works as zootecnista e criadora
```

### Marta — Tratadora de bezerros

```
adult Brazilian sertanejo woman, brown skin, black a long braid, green plaid button shirt, wearing a baseball cap, calm expression, works as tratadora de bezerros
```

### Seu Caetano — Produtor diversificado

```
adult Brazilian sertanejo man, light tan skin, dark brown big afro hair, dark brown short stubble beard, off-white t-shirt, wearing a baseball cap, smiling warmly expression, works as produtor diversificado
```

### Jonas — Filho do Seu Caetano

```
adult Brazilian sertanejo man, light tan skin, dark brown short hair, dark brown trimmed beard, mustard yellow plaid button shirt, smiling warmly expression, works as filho do seu caetano
```

### Dr. Otávio Sampaio — Pecuarista milionário

```
adult Brazilian sertanejo man, fair skin, white buzz cut, blue button-up shirt, wearing a wide light-beige pantaneiro hat, calm expression, works as pecuarista milionário
```

### Seu Severino — Gerente da Monte Real

```
adult Brazilian sertanejo man, brown skin, black buzz cut, black dense stubble, green button-up shirt, wearing a Brazilian sertanejo leather cowboy hat with the front brim folded up in a half-moon, decorated with small stars, wearing a neckerchief, calm expression, works as gerente da monte real
```

### Dalva — Tratadora dos cavalos de exposição

```
adult Brazilian sertanejo woman, dark brown skin, black hair in a bun, blue plaid button shirt, smiling warmly expression, works as tratadora dos cavalos de exposição
```

### Bruno — Segurança da portaria

```
adult Brazilian sertanejo man, very fair skin, black short hair, black short stubble beard, black t-shirt, wearing a cream rodeo cowboy hat, smiling warmly expression, works as segurança da portaria
```
### Seu vaqueiro (personagem do jogador)

Troque o que está entre colchetes pelo visual que você quer:

```
adult Brazilian sertanejo [man/woman], [tan brown] skin, [dark brown short hair], [classic moustache], brown leather vaqueiro jacket (gibão) with stitching, wearing a Brazilian sertanejo leather cowboy hat with the front brim folded up in a half-moon, decorated with small stars, wearing a red neckerchief, confident smiling expression, works as a cattle herder
```
