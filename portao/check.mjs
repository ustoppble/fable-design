#!/usr/bin/env node
/**
 * PORTÃO da fable-design — mede os 12 itens da doutrina e reprova com mensagem acionável.
 *
 *   node check.mjs --dir /caminho/do/projeto [--url http://127.0.0.1:5199/] [--skip-build]
 *
 * Zero dependência de npm: usa o Chrome instalado via CDP (padrão que o site do Fable 5.1
 * provou funcionar offline). Requer Node 22+ (WebSocket global).
 * Saída: relatório no terminal, evidence/portao.json e evidence/portao/*.png. Exit 1 se falhar.
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const arg = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (n) => argv.includes(`--${n}`);

const DIR = resolve(arg('dir', process.cwd()));
const PORT = Number(arg('port', 5199));
const CDP = 9334;
const results = [];
let inventarioCss = 'CSS não lido';
const ok = (n, item, detail) => results.push({ n, item, pass: true, detail });
const fail = (n, item, detail, fix) => results.push({ n, item, pass: false, detail, fix });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd, o = {}) => execSync(cmd, { cwd: DIR, encoding: 'utf8', stdio: 'pipe', ...o });

// ─── 6. build e typecheck ────────────────────────────────────────────────────

if (flag('skip-build')) ok(6, 'build e typecheck', 'pulado por --skip-build');
else {
  try {
    sh('npm run build');
    ok(6, 'build e typecheck', 'npm run build passou');
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`.trim().split('\n').slice(-6).join(' | ');
    fail(6, 'build e typecheck', out || 'npm run build falhou',
      'Conserte a compilação antes de olhar qualquer outro item: com build quebrado nada abaixo é confiável.');
  }
}

// ─── 1 e 2. paleta e escala de tipografia, no CSS buildado ───────────────────

// Cor é medida por FAMÍLIA DE MATIZ, não por hex.
// Calibrado contra o padrão-ouro: ele usa 32 hex — #000, #fff, o vermelho da marca, seis
// cinzas e as cores de status. Contar hex cru reprovaria o site que definiu a doutrina.
// Cinza não é "outra cor": tudo com saturação baixa é UMA família neutra. O que a doutrina
// proíbe é arco-íris, então a regra é: poucas famílias coloridas e UMA claramente dominante.
const toRgb = (raw) => {
  const c = raw.trim().toLowerCase();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
    if (h.length < 6) return null;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const nums = (c.match(/-?\d*\.?\d+/g) || []).map(Number);
  if (c.startsWith('rgb') && nums.length >= 3) return nums.slice(0, 3);
  if (c.startsWith('hsl') && nums.length >= 3) return null; // matiz já explícito, tratado abaixo
  return null; // rgb(from red r g b) e outras sintaxes relativas: não é cor nova
};
const familyOf = (raw) => {
  const c = raw.trim().toLowerCase();
  if (c.startsWith('hsl')) {
    const n = (c.match(/-?\d*\.?\d+/g) || []).map(Number);
    if (n.length < 3) return null;
    return n[1] < 12 ? 'neutra' : `matiz-${Math.floor(((n[0] % 360) + 360) % 360 / 30)}`;
  }
  const rgb = toRgb(raw);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b); const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (s < 0.12) return 'neutra';
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = ((h * 60) + 360) % 360;
  return `matiz-${Math.floor(h / 30)}`;
};

const distAssets = join(DIR, 'dist', 'assets');
const css = existsSync(distAssets)
  ? readdirSync(distAssets).filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(distAssets, f), 'utf8')).join('\n')
  : '';

if (!css) {
  inventarioCss = 'nenhum CSS em dist/assets (rode o build)';
} else {
  // Inventário informativo. O julgamento da paleta é feito no navegador, por ÁREA renderizada
  // (item 1): declaração de CSS não é o que o olho vê — a cor de status ocupa três linhas de
  // CSS e dois pixels de tela.
  const familias = new Set();
  for (const raw of (css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/g) || [])) {
    const f = familyOf(raw);
    if (f) familias.add(f);
  }
  inventarioCss = `${familias.size} famílias declaradas no CSS`;

}

// ─── 11. texto de enchimento ─────────────────────────────────────────────────

try {
  // Linha de comentário não conta: o padrão-ouro tem um comentário dizendo "nada de lorem
  // ipsum" e a primeira versão deste portão reprovou o site por causa da própria instrução.
  const hits = sh('grep -rniE "lorem|ipsum|sua empresa aqui|t[íi]tulo da se[çc][ãa]o|placeholder text|your text here" src | grep -vE ":[0-9]+: *(\\*|//|/\\*|#)" || true').trim();
  if (!hits) ok(11, 'sem texto de enchimento', 'nada em src/');
  else fail(11, 'sem texto de enchimento', hits.split('\n').slice(0, 4).join(' | '),
    'Troque por texto real do briefing. Faltou conteúdo? Pergunte ao humano — não preencha.');
} catch { ok(11, 'sem texto de enchimento', 'src/ ausente'); }

// ─── 12. posse de arquivo ────────────────────────────────────────────────────

try {
  const posse = JSON.parse(readFileSync(join(DIR, 'posse.json'), 'utf8'));
  const owned = new Set(Object.keys(posse).map((f) => (f.includes('/') ? f : `src/sections/${f}`)));
  const base = sh('git rev-list --max-parents=0 -n 1 HEAD').trim();
  const changed = sh(`git diff --name-only ${base} HEAD`).split('\n').filter(Boolean);
  const dirty = sh('git status --porcelain').split('\n').filter(Boolean).map((l) => l.slice(3));
  const allowed = (f) => owned.has(f) || f.startsWith('evidence/') || f.startsWith('dist/') ||
    ['package-lock.json', 'posse.json'].includes(f);
  const invaders = [...new Set([...changed, ...dirty])].filter((f) => !allowed(f));
  if (!invaders.length) ok(12, 'posse de arquivo', `${owned.size} arquivos de dono declarado, nenhuma invasão`);
  else fail(12, 'posse de arquivo', `fora da posse: ${invaders.slice(0, 6).join(', ')}`,
    'Reverta cada invasão (git checkout -- <arquivo>) e devolva a tarefa ao DONO do arquivo. Executor mexendo no contrato é a causa raiz de site que desmonta.');
} catch (e) {
  fail(12, 'posse de arquivo', `não foi possível medir: ${String(e.message).split('\n')[0]}`,
    'A fase 0 tem que rodar git init, commitar o contrato e escrever posse.json. Sem isso a posse não é verificável.');
}

// ─── 13. a cena 3D existe de fato ────────────────────────────────────────────
// O RED instalou `three` e `@react-three/fiber` e nunca importou: o package.json fica
// conforme e a doutrina fica sem cumprir. Dependência não é entrega.
try {
  const pkg = JSON.parse(readFileSync(join(DIR, 'package.json'), 'utf8'));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const declarou = Boolean(deps['@react-three/fiber'] || deps['three']);
  const importa = sh("grep -rl \"@react-three/fiber\\|from 'three'\" src || true").trim();
  const shader = sh('grep -rl "fragmentShader\\|ShaderMaterial" src || true').trim();
  if (importa && shader) ok(13, 'cena 3D de fato', `importada em ${importa.split('\n').length} arquivo(s), com shader próprio`);
  else if (declarou && !importa) fail(13, 'cena 3D de fato', 'dependência de 3D no package.json e NENHUM import em src/',
    'A doutrina pede cena 3D com shader próprio passando na frente da tipografia. Instalar a dependência e não usar deixa o artefato parecendo conforme — é o modo de falha medido no RED.');
  else if (importa && !shader) fail(13, 'cena 3D de fato', '3D importado, mas sem shader próprio',
    'A doutrina pede shader próprio com ruído sutil e leve aberração cromática, não material pronto.');
  else fail(13, 'cena 3D de fato', 'nenhum 3D no projeto',
    'A doutrina pede uma cena 3D leve. Se a placa não aguentar, degrade a qualidade — degradar não é omitir.');
} catch (e) {
  fail(13, 'cena 3D de fato', `não foi possível medir: ${String(e.message).split('\n')[0]}`, 'Confira se existe package.json na raiz do projeto.');
}

// ─── 14. seção escrevendo cor na mão ────────────────────────────────────────
try {
  const hex = sh('grep -rnE "#[0-9a-fA-F]{3,8}" src/sections | grep -vE ":[0-9]+: *(\\*|//|/\\*)" || true').trim();
  if (!hex) ok(14, 'seção usa variável do contrato', 'nenhuma cor escrita na mão em src/sections');
  else fail(14, 'seção usa variável do contrato', hex.split('\n').slice(0, 4).join(' | '),
    'Cor de seção vem de var(--…) do contrato. Hex na mão é como a paleta vaza de 4 para 32 sem ninguém decidir.');
} catch { ok(14, 'seção usa variável do contrato', 'src/sections ausente'); }

// ─── navegador (CDP puro): 3,4,5,7,8,9,10 ────────────────────────────────────

const chromeCandidates = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);
const CHROME = chromeCandidates.find((p) => existsSync(p));

let url = arg('url');
let server = null;
if (!url) {
  url = `http://localhost:${PORT}/`; // Vite 8 escuta em localhost (IPv6): 127.0.0.1 devolve 000
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: DIR, stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 40 && !up; i++) {
    try { up = (await fetch(url)).ok; } catch { await sleep(500); }
  }
  if (!up) fail(0, 'servidor', `vite preview não respondeu na ${PORT}`, 'Suba o projeto e passe --url.');
}

if (!CHROME) {
  fail(0, 'navegador', 'Chrome/Chromium não encontrado',
    'Instale o Chrome ou aponte o binário: CHROME=/caminho/do/chrome node check.mjs');
} else if (results.some((r) => r.n === 0 && !r.pass)) {
  // servidor caiu: não há o que medir no navegador
} else {
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${CDP}`, '--headless=new', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--window-size=1440,1000', '--user-data-dir=/tmp/fable-design-portao',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank',
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP}/json`);
      if (r.ok) target = (await r.json()).find((t) => t.type === 'page');
    } catch { await sleep(250); }
  }

  if (!target) {
    fail(0, 'navegador', 'o Chrome não subiu em modo debug', 'Confira o binário e se a porta de debug está livre.');
  } else {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let seq = 0;
    const pending = new Map();
    const consoleErrors = [];
    const externals = [];
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(`exceção: ${msg.params?.exceptionDetails?.exception?.description?.split('\n')[0] || 'sem descrição'}`);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
        consoleErrors.push(`console.error: ${(msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160)}`);
      }
      if (msg.method === 'Network.requestWillBeSent') {
        const u = msg.params?.request?.url || '';
        if (!u.startsWith(url) && !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('about:')) externals.push(u);
      }
    };
    const send = (method, params = {}) => new Promise((resolve) => {
      const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression, awaitPromise = false) => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
      return r.result?.result?.value;
    };
    const viewport = (width, height, mobile = false) =>
      send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    const shots = join(DIR, 'evidence', 'portao');
    mkdirSync(shots, { recursive: true });
    const shot = async (name) => {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      if (r.result?.data) writeFileSync(join(shots, name), Buffer.from(r.result.data, 'base64'));
    };

    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');

    // 3. preloader
    await viewport(1440, 1000);
    const t0 = Date.now();
    await send('Page.navigate', { url });
    await sleep(800);
    const hadPreloader = await evaluate('!!document.querySelector("[data-preloader]")');
    if (!hadPreloader) {
      fail(3, 'preloader 0→100', 'nenhum [data-preloader] no DOM',
        'O preloader é da fase 0 e precisa do atributo data-preloader no nó raiz para ser cronometrado.');
    } else {
      let gone = false;
      for (let i = 0; i < 30 && !gone; i++) {
        gone = await evaluate('!document.querySelector("[data-preloader]")');
        if (!gone) await sleep(250);
      }
      const ms = Date.now() - t0;
      if (gone && ms <= 6000) ok(3, 'preloader 0→100', `desmontou em ${ms}ms`);
      else if (gone) fail(3, 'preloader 0→100', `só desmontou em ${ms}ms`, 'Preloader não é sala de espera: conte até 100 e dissolva em ~1s.');
      else fail(3, 'preloader 0→100', 'nunca desmontou', 'Garanta que o contador chega a 100 e o nó sai do DOM.');
    }
    await sleep(1500);

    // 4. scroll virtual
    // Mede o COMPORTAMENTO, não o nome do atributo: se [data-scroll-root] não existir, procura
    // qualquer nó cujo transform mudou com a roda do mouse. O padrão-ouro tem scroll virtual de
    // verdade sob outro nome, e um portão que só entende a própria convenção reprovaria ele.
    const snapshot = `(() => { const r = document.querySelector('[data-scroll-root]');
      return JSON.stringify({ top: document.scrollingElement.scrollTop,
        ov: getComputedStyle(document.body).overflow,
        marcado: r ? getComputedStyle(r).transform : null,
        qualquer: [...document.querySelectorAll('body *')].slice(0, 400).map(e => getComputedStyle(e).transform).join('|') }); })()`;
    const b = JSON.parse((await evaluate(snapshot)) || '{}');
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 500, deltaX: 0, deltaY: 1400 });
    await sleep(700);
    const a = JSON.parse((await evaluate(snapshot)) || '{}');
    const travado = b.ov === 'hidden';
    const moveu = (b.marcado !== null && b.marcado !== a.marcado) || b.qualquer !== a.qualquer;
    const nativo = a.top > 0;
    if (travado && moveu && !nativo) {
      ok(4, 'scroll virtual', b.marcado !== null
        ? 'body travado, [data-scroll-root] interpolando, zero scroll nativo'
        : 'body travado e posição interpolada, zero scroll nativo (sem o atributo data-scroll-root)');
    } else {
      fail(4, 'scroll virtual', `body overflow=${b.ov} · algo se moveu=${moveu} · scrollTop nativo=${a.top}`,
        'Trave o body (overflow hidden), interpole a posição por frame e não use scroll nativo. Se a roda não move nada, o motor de scroll do contrato não está ligado.');
    }

    // 7. fps
    const fps = await evaluate(`(async () => { let f = 0; const t = performance.now();
      await new Promise(d => { const tick = () => { f++; performance.now() - t < 3000 ? requestAnimationFrame(tick) : d(); }; requestAnimationFrame(tick); });
      return Math.round(f / ((performance.now() - t) / 1000)); })()`, true);
    // O headless roda GL por software (SwiftShader): o padrão-ouro mede 40fps aqui e 60 na
    // máquina real. Cobrar 55 de renderização por software reprovaria o site pelo ambiente.
    const renderer = await evaluate(`(() => { try {
      const gl = document.createElement('canvas').getContext('webgl');
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'desconhecido';
    } catch { return 'desconhecido'; } })()`);
    const software = /swiftshader|software|llvmpipe/i.test(String(renderer));
    const piso = software ? 30 : 55;
    if (typeof fps === 'number' && fps >= piso) {
      ok(7, `fps ≥ ${piso}`, `${fps}fps em 3s${software ? ' (GL por software: piso 30, alvo 60 em hardware real)' : ''}`);
    } else {
      fail(7, `fps ≥ ${piso}`, `${fps}fps${software ? ' sob GL por software' : ''}`,
        'Otimize, não remova: degradar a cena 3D é o caminho que a doutrina prevê.');
    }

    // 8. screenshots por seção — precisa do gancho de navegação do contrato
    const hook = await evaluate(`(() => { const h = window.__fable || window.__overclock;
      return h && typeof h.scrollTo === 'function' ? 'ok' : null; })()`);
    const total = await evaluate('document.querySelectorAll("[data-section]").length');
    if (!total) {
      fail(8, 'screenshots por seção', 'nenhum [data-section] no DOM',
        'O registry precisa marcar cada seção com data-section="01".."06".');
    } else if (!hook) {
      fail(8, 'screenshots por seção', `${total} seções, mas sem window.__fable.scrollTo`,
        'Em scroll virtual ninguém navega por script sem gancho: o contrato precisa expor window.__fable = { scrollTo(i), total }.');
    } else {
      for (const [w, h, mob, tag] of [[1440, 1000, false, 'desktop'], [390, 844, true, 'mobile']]) {
        await viewport(w, h, mob);
        for (let i = 0; i < total; i++) {
          await evaluate(`(window.__fable || window.__overclock).scrollTo(${i})`);
          await sleep(900);
          await shot(`${tag}-${String(i + 1).padStart(2, '0')}.png`);
        }
      }
      ok(8, 'screenshots por seção', `${total * 2} imagens em evidence/portao/`);
    }

    // 2. escala de tipografia, por estilo computado. No CSS cru o valor é `var(--display)`
    // com clamp dentro: só o navegador resolve. A primeira versão media 0px e reprovava o
    // contrato justamente por ele usar variável, que é o que a receita obriga.
    {
      const e = JSON.parse((await evaluate(`(() => {
        const corpo = parseFloat(getComputedStyle(document.body).fontSize) || 16;
        const nos = [...document.querySelectorAll('h1,h2,h3,.display,[data-display]')];
        const maior = nos.reduce((m, n) => Math.max(m, parseFloat(getComputedStyle(n).fontSize) || 0), 0);
        return JSON.stringify({ corpo, maior });
      })()`)) || '{}');
      const razao = e.corpo ? (e.maior || 0) / e.corpo : 0;
      const detalhe = `${Math.round(e.maior || 0)}px / ${e.corpo}px = ${razao.toFixed(1)}:1`;
      if (razao >= 12) ok(2, 'razão display/corpo ≥ 12:1', detalhe);
      else fail(2, 'razão display/corpo ≥ 12:1', detalhe,
        'Suba o teto do display (a doutrina vai até 217px) ou baixe o corpo para 15px. Contraste fraco de escala é o que entrega "feito por IA".');
    }

    // 1. paleta, medida por ÁREA RENDERIZADA em cada posição de scroll
    {
      // Amostra o que o OLHO vê: 25 pontos da tela, e em cada um o fundo EFETIVO (subindo
      // a árvore até achar cor opaca). A versão anterior somava o fundo de html e body como
      // duas telas de área neutra, o que fazia o neutro dominar até a seção invertida.
      const medir = `(() => {
        const N = 5, acc = {};
        // elementsFromPoint (plural) e pula o overlay: o canvas 3D fica no topo de tudo e,
        // medido com elementFromPoint, devolvia CANVAS nos 25 pontos — a seção invertida
        // ficava invisível para o portão.
        const fundoEm = (x, y) => {
          for (const el of document.elementsFromPoint(x, y)) {
            if (el.tagName === 'CANVAS') continue;
            const c = getComputedStyle(el).backgroundColor;
            if (c && !/rgba\\(0, *0, *0, *0\\)|transparent/.test(c)) return c;
          }
          return getComputedStyle(document.documentElement).backgroundColor;
        };
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          acc[fundoEm((i + 0.5) * innerWidth / N, (j + 0.5) * innerHeight / N)] = (acc[fundoEm((i + 0.5) * innerWidth / N, (j + 0.5) * innerHeight / N)] || 0) + 1;
        }
        for (const e of document.querySelectorAll('h1,h2,h3,p,span,a,button')) {
          const r = e.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight) continue;
          const c = getComputedStyle(e).color;
          if (c) acc[c] = (acc[c] || 0) + 0.15; // texto pesa pouco, mas conta para a paleta
        }
        return JSON.stringify(acc); })()`;
      const areas = {};
      const dominantePorPosicao = [];
      const cobertos = [];
      const posicoes = hook ? Math.max(1, total || 1) : 1;
      for (let i = 0; i < posicoes; i++) {
        if (hook) { await evaluate(`(window.__fable || window.__overclock).scrollTo(${i})`); await sleep(700); }
        const parcial = JSON.parse((await evaluate(medir)) || '{}');
        const local = {};
        for (const [cor, area] of Object.entries(parcial)) {
          const f = familyOf(cor);
          if (!f) continue;
          areas[f] = (areas[f] || 0) + area;
          local[f] = (local[f] || 0) + area;
        }
        const top = Object.entries(local).sort((x, y) => y[1] - x[1])[0];
        if (top) dominantePorPosicao.push(top[0]);

        // 16. controle coberto: o que está no topo do ponto central de cada botão/link tem de
        // ser ele mesmo. Overlay fixo (cena 3D, gradiente, preloader que não saiu) engole o
        // clique sem dar erro nenhum — foi o bug encontrado no próprio contrato de referência.
        const maus = JSON.parse((await evaluate(`(() => { const r = [];
          for (const e of document.querySelectorAll('button, a, [role=button], input, select')) {
            const b = e.getBoundingClientRect();
            if (b.width < 4 || b.height < 4 || b.bottom < 0 || b.top > innerHeight) continue;
            const alvo = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
            if (!alvo || !(e === alvo || e.contains(alvo) || alvo.contains(e))) {
              r.push((e.tagName + (e.textContent || '').trim().slice(0, 18)) + ' coberto por ' + (alvo ? alvo.tagName : 'nada'));
            }
          }
          return JSON.stringify(r.slice(0, 4)); })()`)) || '[]');
        for (const m of maus) if (!cobertos.includes(m)) cobertos.push(m);
      }

      if (!cobertos.length) ok(16, 'controles clicáveis', 'nenhum botão coberto por overlay');
      else fail(16, 'controles clicáveis', cobertos.slice(0, 4).join(' | '),
        'Overlay em cima engole o clique sem erro de console. Ponha pointer-events: none no elemento que flutua (inclusive no canvas do R3F, que vem com pointer-events auto).');

      // 15. a VIRADA inverte de fato: em alguma posição a cor que domina a tela tem de mudar.
      if (posicoes < 2) {
        fail(15, 'uma seção inverte a tela', `só ${posicoes} posição amostrada`,
          'Sem o gancho window.__fable.scrollTo o portão não visita as seções e não tem como ver a inversão.');
      } else if (new Set(dominantePorPosicao).size >= 2) {
        ok(15, 'uma seção inverte a tela', `${new Set(dominantePorPosicao).size} dominantes distintas entre as seções`);
      } else {
        fail(15, 'uma seção inverte a tela', `a mesma família domina as ${posicoes} seções`,
          'A doutrina pede que a cor de destaque tome uma seção INTEIRA, invertendo o fundo por completo. Acento decorativo não conta.');
      }
      const totalArea = Object.values(areas).reduce((s, v) => s + v, 0) || 1;
      const coloridas = Object.entries(areas)
        .filter(([f, v]) => f !== 'neutra' && v / totalArea >= 0.005) // abaixo de 0,5% da tela ninguém vê
        .sort((x, y) => y[1] - x[1]);
      const areaColorida = coloridas.reduce((s, [, v]) => s + v, 0);
      const dominancia = areaColorida ? coloridas[0][1] / areaColorida : 1;
      const resumo = `neutra + ${coloridas.length} colorida(s) visível(is); dominante com ${Math.round(dominancia * 100)}% da área colorida · ${posicoes} posição(ões) amostrada(s) · ${inventarioCss}`;
      if (coloridas.length <= 3 && dominancia >= 0.7) ok(1, 'paleta contida', resumo);
      else fail(1, 'paleta contida', resumo,
        'Quase-preto, off-white e UMA cor de destaque. Cinza é neutro e cor de status é tolerada porque quase não tem área; o que reprova é segunda cor forte disputando a tela.');
    }

    // 10. movimento reduzido
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url });
    await sleep(3000);
    // Seletor solto de propósito: acoplar a [data-section] fazia este item falhar por
    // convenção ausente em vez de por conteúdo invisível.
    const legivel = await evaluate(`(() => {
      const n = [...document.querySelectorAll('h1,h2,h3,p')];
      return n.length ? n.some(e => Number(getComputedStyle(e).opacity) > 0.9 && getComputedStyle(e).visibility !== 'hidden' && e.textContent.trim().length > 3) : false; })()`);
    if (legivel) ok(10, 'movimento reduzido', 'o texto aparece com prefers-reduced-motion');
    else fail(10, 'movimento reduzido', 'nenhum texto visível com prefers-reduced-motion',
      'O conteúdo não pode depender da animação para existir: com movimento reduzido, entregue o texto já revelado.');

    // 5 e 9
    if (!consoleErrors.length) ok(5, 'erros de console', 'nenhum');
    else fail(5, 'erros de console', [...new Set(consoleErrors)].slice(0, 4).join(' | '),
      'Zero é o limiar. Devolva ao dono da seção que gerou o erro.');
    if (!externals.length) ok(9, 'requisições externas', 'nenhuma');
    else fail(9, 'requisições externas', [...new Set(externals)].slice(0, 4).join(' | '),
      'A peça é offline: empacote fonte e asset, remova CDN e telemetria.');

    ws.close();
  }
  try { chrome.kill(); } catch {}
}

if (server) { try { server.kill(); } catch {} }

// ─── relatório ───────────────────────────────────────────────────────────────

results.sort((x, y) => x.n - y.n);
const reprovados = results.filter((r) => !r.pass);
console.log('\n── PORTÃO fable-design ─────────────────────────────────────');
for (const r of results) {
  console.log(`${r.pass ? 'PASSA' : 'FALHA'}  ${String(r.n).padStart(2)}. ${r.item} — ${String(r.detail).split('\n')[0]}`);
  if (!r.pass && r.fix) console.log(`        → ${r.fix}`);
}
console.log(`\n${results.length - reprovados.length}/${results.length} itens passaram.`);
mkdirSync(join(DIR, 'evidence'), { recursive: true });
writeFileSync(join(DIR, 'evidence', 'portao.json'), JSON.stringify({ medidoEm: new Date().toISOString(), url, results }, null, 2));
if (reprovados.length) {
  console.log('\nCada falha volta para o pane DONO do arquivo. Não conserte no lugar dele.');
  process.exit(1);
}
