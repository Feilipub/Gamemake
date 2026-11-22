# Estúdio do Mago: repositório de animação e dublagem

O sistema que produz o **Podcast do Mago** e os cortes "Entrevistas Impossíveis" para YouTube e TikTok.
Tudo roda **em CPU, de graça**, com modelos de código aberto. Nenhuma voz ou rosto de pessoa real é usado.

## Visão geral (motor 4.0)

```
roteiro (podcast/corte4_*.py)
   │
   ├─► dublagem.py ──► vozes expressivas (Chatterbox Multilingual, PT-BR)
   │                   conferidas por reconhecimento de voz (faster-whisper), com até 4 tentativas
   │                   ──► dub_x/cache/*.npy + conversa.wav + timeline.json (falas, tempos, risadas, reações)
   │
   ├─► elenco/*.png + elenco/*.json ──► rig.py  (retrato ilustrado → personagem vivo em pixel art)
   │
   └─► corte4.py ──► vídeo vertical 1080x1920 com gancho, câmeras, legendas, fotos reais, figurinhas, CTA e loop
```

### 1. Arte: `ai/char_gen.py` e `ai/repaint.py`
- **Modelo:** LCM Dreamshaper v7 (difusão rápida, cerca de 45 s por imagem em CPU).
- **`repaint.py` (img2img):** é o segredo da consistência. Ele usa o boneco antigo do estúdio como **esboço** e a IA
  repinta por cima com detalhe profissional, mas mantendo a forma e a identidade (força 0,6).
  Funciona até para animais, que o texto sozinho não acerta.
- Todo personagem é gerado no mesmo estúdio (escuro, neon roxo e rosa), então os planos combinam entre si.

### 2. Rig: `podcast/rig.py`
A partir de **um único retrato**, o rig anima o personagem:

| Movimento | Como funciona |
|---|---|
| Boca | **Queixo que desce** (a barba ou o bico desce e abre uma fresta escura), na medida do volume real da voz |
| Piscar | A pálpebra é pintada com a cor da pele, com piscadas duplas de vez em quando |
| Respiração | O corpo sobe e desce num ciclo de 3,6 s |
| Cabeça | Leve balanço, aceno quando escuta, sacudida quando ri, inclinação quando se empolga |
| Luz | Pontos de luz (neon e vela) pulsando sobre o personagem |
| Poeira | Partículas brilhando no ar |

A animação acontece na imagem em alta resolução, e **cada quadro é pixelizado com a paleta fixa do personagem**
(270x338 pixels de arte, ampliados 4 vezes ou 5 vezes no close). Assim o movimento fica "preso" na grade de pixels, como em pixel art feita à mão.

#### Como cadastrar um personagem novo
1. Gere ou repinte o retrato (512x640) e salve em `podcast/elenco/<nome>.png`.
2. Crie `podcast/elenco/<nome>.json` com as coordenadas na imagem 512x640:
```json
{"img": "nome.png",
 "frame": [x0, y0, x1, y1],
 "eyes": [[x, y, raio_x, raio_y]],
 "mouth": [x, y, largura, altura],
 "jaw": 0.55,
 "head": [x0, y0, x1, y1],
 "neck": y,
 "lights": [[x, y, raio, "#cor"]]}
```
- `frame` é opcional e reenquadra (dá zoom).
- `eyes` pode ser uma lista vazia, por exemplo para quem usa óculos escuros.
- `jaw` é quanto o queixo desce.

### 3. Dublagem: `podcast/dublagem.py`
- **Chatterbox Multilingual** (Resemble AI, **licença MIT**), em português, com controle de emoção.
  A variação de entonação medida foi de **5,5 a 7,7 semitons**, contra 2,6 da voz antiga (Kokoro), que soava monótona.
- Cada personagem clona uma **referência sintética** da pasta `tts/refs/` (gerada por TTS, nunca de uma pessoa real).
- **Controle de qualidade automático:** cada fala é transcrita. Se as palavras não batem, ela é refeita com outra
  semente e com a emoção um pouco mais calma, e fica a melhor tentativa.
- A emoção do roteiro (`wide`, `happy`, `serious`...) vira intensidade de interpretação.
- O áudio gerado leva a marca d'água inaudível do Chatterbox (uso responsável de IA).

### 4. Vídeo: `podcast/corte4.py`
Herda tudo do motor 3.0, que é focado em retenção e inscritos:
- quadro 0 já com gancho e legenda;
- sem tempo morto;
- final em loop;
- série numerada;
- chamada para seguir específica;
- aviso do próximo convidado.

E acrescenta:
- **câmeras individuais**, como em podcast real: plano aberto e close 5x de quem fala, contraplano de reação nas falas longas e tela dividida nas risadas;
- tremor de impacto;
- figurinhas de reação ("?!", "KKKK");
- fotos reais com brilho passando;
- legenda palavra a palavra com números em destaque.


## Motor 5.0: animação solta (`podcast/rig2.py` + `podcast/corte5.py`)
- **Boneco de recorte em camadas:** o mapa de profundidade (Depth Anything V2) separa o personagem do cenário.
  - O fundo é limpo (o personagem é apagado e o buraco preenchido).
  - Corpo, cabeça e ponta do chapéu ou crista viram camadas, e a mesa fica na frente.
  - Cada camada gira e se move sozinha, então dá para fazer movimentos grandes sem entortar o cenário.
- **Molas físicas (massa-mola-amortecedor):** dão atraso, exagero e acomodação, que é o que deixa o movimento solto.
  - **Batidas da fala:** a cabeça marca as sílabas fortes, detectadas pela subida do volume da voz.
  - **Emoção:** a cabeça inclina na curiosidade e na pergunta do outro, baixa na tristeza, e o corpo se assusta e se ergue na surpresa.
  - **Quem escuta:** acena e reage.
  - **Movimento secundário:** a ponta do chapéu ou a crista balança atrasada.
  - **Risada:** o corpo pula e achata (squash).
- **Câmera:** zoom suave na imagem em alta antes de pixelizar, empurrão em cada corte e chicote (whip-pan) entre planos.
- **Personagem novo:** além do rig antigo, informe `neck`, `hip`, `tip_y`, `desk_y` e `seed`, e gere `<nome>_depth.npy` com o Depth Anything.

## Como rodar
```bash
# 1) dublagem (ambiente com torch + chatterbox)
cbenv/bin/python podcast/dublagem.py corte4_gta6
# 2) vídeo
python3 podcast/corte5.py corte4_gta6            # motor 5.0 (teste de quadros: ... test 0 5 10)
```

## Dependências e dados (não versionados)
| Item | Onde |
|---|---|
| `torch`, `chatterbox-tts`, `faster-whisper`, `num2words` | ambiente `cbenv` |
| Pesos do Chatterbox multilíngue e LCM Dreamshaper | cache do Hugging Face (`ai/hf`) |
| Fontes Bebas Neue e DejaVu | sistema |
| Trilhas (Mixkit, licença livre) e efeitos sonoros | `music_lib/`, `sfx/` |
| Fotos reais (Openverse: CC0, domínio público, CC BY e CC BY-SA, com crédito automático) | `media/` |

## Regras de conteúdo
- Fatos conferidos em fontes, e o que for estimativa é dito como estimativa.
- Sem imagens, logos ou trilhas de terceiros com direitos autorais (exemplo: GTA 6 usa só infográficos próprios e fotos reais de Miami).
- Sem clonar voz ou rosto de pessoas reais.
