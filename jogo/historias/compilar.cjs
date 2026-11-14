// Recompila historias.ink e grava o resultado dentro do jogo (constante INK_BASE em ../index.html).
// Uso (na pasta jogo/historias):  npm install inkjs@2.4.0   e depois   node compilar.cjs
const fs = require('fs'), path = require('path'), ink = require('inkjs/full');
const PRELUDIO = ['dia()', 'hora()', 'nome()', 'fazenda()', 'modo()', 'pagar(v)', 'dinheiro(v)', 'item(id, n)', 'tem(id)', 'amizade(n)', 'coracoes()', 'bichos(sp)', 'avisar(t)'].map(f => 'EXTERNAL ' + f).join('\n') + '\n';
const fonte = fs.readFileSync(path.join(__dirname, 'historias.ink'), 'utf8');
const c = new ink.Compiler(PRELUDIO + fonte), json = c.Compile().ToJson();
if (c.errors && c.errors.length) { console.error('Erros:\n' + c.errors.join('\n')); process.exit(1); }
const html = path.join(__dirname, '..', 'index.html'); let s = fs.readFileSync(html, 'utf8');
const i = s.indexOf('const INK_BASE = '), j = s.indexOf(';\n', i); if (i < 0) throw new Error('INK_BASE não encontrado');
s = s.slice(0, i) + 'const INK_BASE = ' + JSON.stringify(json) + s.slice(j); fs.writeFileSync(html, s);
console.log('Histórias compiladas (' + (json.length / 1024).toFixed(1) + ' KB) e gravadas no jogo.');
