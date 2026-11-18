// v18: modo foto (filtros, moldura, foto de verdade nos dois visuais) e retrospectiva do ano (no virar do ano, cartão e save)
module.exports = { nome: 'Modo foto e retrospectiva do ano', tempo: 300, async rodar(t) {
  for (const view of ['2d', 'hd2d']) {
    await t.abrir({ downloads: true, ajustes: { view, cenas: false } }); await t.jogoNovo();
    t.ok(await t.ev("(() => { openMenu('ini'); const ok = /data-a=.fotoAbrir./.test($('mn').innerHTML) && /data-a=.anoAbrir./.test($('mn').innerHTML); closeModal(); return ok; })()"), view + ': Início do menu tem Modo foto e Retrospectiva');
    t.ok(await t.ev("(() => { A.fotoAbrir(); return FOTO.on && paused && document.body.classList.contains('foto') && getComputedStyle($('fotobar')).display === 'flex' && getComputedStyle($('hud')).display === 'none'; })()"), view + ': o modo foto esconde a interface e pausa o tempo');
    t.ok(await t.ev("(() => { fotoFiltro('cor'); return FOTO.f === 'cor' && [...document.querySelectorAll('#wrap canvas')].some(c => /grayscale/.test(c.style.filter)); })()"), view + ': filtro Cordel aplicado na tela');
    await t.ev("FOTO.want = 'tirar'; 0"); await t.ate('!!FOTO.last', 6000);
    const r = JSON.parse(await t.ev(`(async () => { const im = new Image(); im.src = FOTO.last; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, c.width, Math.round(c.height * 0.8)).data; let mn = 255, mx = 0, cor = 0; for (let i = 0; i < d.length; i += 4 * 97) { const v = d[i]; mn = Math.min(mn, v); mx = Math.max(mx, v); if (Math.abs(d[i] - d[i + 1]) > 6 || Math.abs(d[i + 1] - d[i + 2]) > 6) cor++; }
      const b = g.getImageData(10, c.height - 6, 1, 1).data; return JSON.stringify({ w: c.width, h: c.height, var: mx - mn, cor, moldura: b[0] < 80 && b[1] < 50 }); })()`));
    t.ok(r.w >= 800 && r.var > 60, view + ': a foto tem a imagem do jogo (' + r.w + '×' + r.h + ', contraste ' + r.var + ')');
    t.ok(r.cor < 40 && r.moldura, view + ': a foto sai em preto e branco (Cordel) com a moldura da fazenda ' + JSON.stringify(r));
    t.ok(await t.ev("S.stats.fotos === 1"), view + ': a foto conta para a conquista do retratista');
    t.ok(await t.ev("(() => { const r = window.lidaVoltar(); return r && !FOTO.on && !paused && !document.body.classList.contains('foto') && ![...document.querySelectorAll('#wrap canvas')].some(c => c.style.filter); })()"), view + ': o botão voltar sai do modo foto e tira o filtro');
    await t.fechar();
  }
  // retrospectiva do ano
  await t.abrir({ ajustes: { view: '2d', cenas: false } }); await t.jogoNovo();
  const a = JSON.parse(await t.ev(`(() => { anoTick(); const y0 = S.ano.y; S.stats.sold = (S.stats.sold || 0) + 7; S.stats.peixes = (S.stats.peixes || 0) + 12; S.stats.earned = (S.stats.earned || 0) + 15000;
    let d = S.day; while (calDate(d + 1).y === y0) d++; S.day = d + 1; S.ano.d0 = S.day - 300; anoTick(); return JSON.stringify({ y0, ret: (S.retros || []).length, novo: S.ano.y, r: S.retros && S.retros[0] }); })()`));
  t.ok(a.ret === 1 && a.novo === a.y0 + 1, 'no virar do ano a retrospectiva é guardada e um ano novo começa ' + JSON.stringify([a.y0, a.ret, a.novo]));
  t.ok(a.r && a.r.L.some(x => /vendidos/.test(x[1]) && x[2] === '7') && a.r.L.some(x => /Peixes/.test(x[1]) && x[2] === '12') && a.r.L.some(x => /Dinheiro/.test(x[1])), 'o resumo conta vendas, peixes e dinheiro do ano');
  await t.espera(2200);
  t.ok(await t.ev("M.open && /Retrospectiva/.test(M.title) && /Ano " + a.y0 + "/.test($('mn').innerHTML)"), 'a retrospectiva abre sozinha');
  t.ok(await t.ev("(() => { const c = anoCartao(ANO_VER); return c.width === 1080 && c.height === 1350; })()"), 'cartão da retrospectiva (1080×1350) para guardar');
  t.ok(await t.ev("(() => { closeModal(); anoAbrir(); const ok = /até agora/.test($('mn').innerHTML) && /Anos anteriores/.test($('mn').innerHTML); A.anoVer(0); const ok2 = /Ano " + a.y0 + "/.test($('mn').innerHTML); closeModal(); return ok && ok2; })()"), 'retrospectiva do ano atual e dos anos anteriores');
  t.ok(await t.ev("(() => { const o = JSON.parse(SAVE.serialize()); SAVE.apply(o); return S.retros.length === 1 && S.ano.y === " + (a.y0 + 1) + "; })()"), 'as retrospectivas ficam no save');
  t.semErros();
} };
