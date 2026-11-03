# Inventário por espaços, barra rápida e baús

## Overview
Mochila de 12/24/36 espaços com pilhas, barra rápida de 12 espaços (primeira fileira), baús colocáveis e o
baú fixo da casa. Substitui o limite antigo de 30 kg. Código: `web/index.html` (bagInit/bagSync/addInv/
useInv/invRoom, bagHTML, openChestUI, hotbarUpdate).

## Detailed Rules
- `S.inv` é o total de cada item (todos os sistemas continuam usando `addInv`, `useInv`, `has`).
  `S.bag.slots` guarda onde cada pilha está. `bagSync` mantém os dois iguais; `bagCommit` faz o inverso
  depois de mexer nas pilhas à mão.
- Pilhas: ferramentas, equipamentos e instrumentos 1; ração/sal (sacos), remédios, mudas e carnes 20;
  comida 30; demais 50 (`stackMax`).
- Mochila cheia: compras e coletas recusam com aviso. Itens dados por missão/sistema ("force") que não
  couberem ficam em "Excesso" até abrir espaço; nada some.
- Save antigo: se os itens não couberem em 12 espaços, o jogador recebe a mochila de 24 ou 36.
- Barra rápida: teclas 1–0, roda do mouse (Ctrl+roda = zoom), toque. Tocar de novo no item selecionado
  usa: comer/beber, equipar facão/espingarda, colocar baú; outros abrem a mochila no item. Tecla C usa.
- Mochila: arrastar e soltar (mouse e dedo), tocar item e tocar destino, dividir (metade ou quantidade
  escolhida), juntar pilhas iguais, organizar (categoria + nome), filtros por categoria, descartar com
  confirmação (ferramentas e pilhas pedem confirmação; lembranças de família não se descartam).
- Baús: item "Baú de madeira" (Casa do Agro › Ferramentas, R$ 180), 24 espaços, colocado em chão livre da
  fazenda (vira obstáculo); nome e categoria editáveis; guardar iguais, guardar tudo (menos ferramentas),
  pegar tudo, organizar, recolher quando vazio. O baú da casa (36 espaços) recebe o conteúdo do baú antigo.
- Mochilas maiores: Casa do Agro › Selaria — couro 24 espaços R$ 1.800; bornal 36 espaços R$ 6.500.
- Equipamentos: chapéu, camisa, calça, botas, acessório e especial (arma/lampião) mostrados na mochila;
  "Trocar roupa" abre o guarda-roupa, que muda o boneco.

## Acceptance Criteria (testado em `inv_test.js`)
Pegar, acumular, dividir, mochila→baú, baú→mochila, organizar, equipar ferramenta, comer, vender, salvar e
recarregar (espaços, pilhas e baús idênticos), expandir mochila, celular (toque na barra, arrastar,
tocar-tocar), mochila cheia sem perda, totais nunca negativos.
