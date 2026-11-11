// ---------- Dades ----------
// Graus del rocòdrom per colors, de fàcil a difícil; cada color té nivell fàcil i difícil
const COLORS = { Verd: '#3fa34d', Blau: '#2f6fd6', Lila: '#8e55c9', 'Marró': '#8a5a35', Vermell: '#d63a3a', Blanc: '#f2f2f2' };
const LEVELS = ['fàcil', 'difícil'];
const GRADES = Object.keys(COLORS).flatMap(c => LEVELS.map(l => `${c} ${l}`));
const TYPES = { escalada: 'Escalada', gym: 'Gym' };
const dot = g => `<span class="dot" style="background:${COLORS[g.split(' ')[0]] || '#888'}"></span>`;
const RESULTS = { flash: 'Flash', semiflash: 'Semiflash', noflash: 'No flash' };
const STYLES = { bloc: 'Bloc', autos: 'Autos' };
const KEY = 'escalada-data-v1';
const pad2 = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;   // data local, no UTC

const blank = () => ({
  profile: { maxGrade: 'Lila fàcil', goal: 'mix', days: 3, start: today() },
  sessions: [], active: null
});
let S = load();
let tab = 'home';
let restEnd = 0, ticker = null;

function load() {
  try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY))); }
  catch { return blank(); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function today() { return ymd(new Date()); }
function gi(g) { return Math.max(0, GRADES.indexOf(g)); }
function gradeAt(i) { return GRADES[Math.min(GRADES.length - 1, Math.max(0, i))]; }
function daysAgo(d) { return (Date.now() - new Date(d + 'T00:00:00').getTime()) / 86400000; }
function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const opts = (list, sel) => list.map(v => `<option ${v === sel ? 'selected' : ''}>${v}</option>`).join('');
const optsObj = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v}</option>`).join('');

// L'ull: estrella de tinta de 8 puntes amb ull i iris. Agafa el color del text i el fons de --eye-bg.
const EYE_BODY = '<path d="M100 2Q107.3 82.4 139.6 60.4Q117.6 92.7 192 100Q117.6 107.3 139.6 139.6Q107.3 117.6 100 198Q92.7 117.6 60.4 139.6Q82.4 107.3 8 100Q82.4 92.7 60.4 60.4Q92.7 82.4 100 2Z"/><circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3" opacity=".55"/><path d="M128.3 31.6Q133.6 30.6 136.6 35.1M168.4 71.7Q172.9 74.7 171.8 80M168.4 128.3Q169.4 133.6 164.9 136.6M128.3 168.4Q125.3 172.9 120 171.8M71.7 168.4Q66.4 169.4 63.4 164.9M31.6 128.3Q27.1 125.3 28.2 120M31.6 71.7Q30.6 66.4 35.1 63.4M71.7 31.6Q74.7 27.1 80 28.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><g class="eyeball"><path d="M46 100Q100 56 154 100Q100 144 46 100Z" style="fill:var(--eye-bg,#ece4d3)" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="100" r="23" style="fill:var(--eye-bg,#ece4d3)" stroke="currentColor" stroke-width="3"/><circle cx="100" cy="100" r="15" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="100" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="100" cy="100" r="5" fill="currentColor"/></g>';
const eyeSvg = (cls = '') => `<svg class="eye ${cls}" viewBox="0 0 200 200" aria-hidden="true" fill="currentColor">${EYE_BODY}</svg>`;

// Il·lustracions de tinta, una per pestanya, amb el mateix llenguatge que l'ull (traç negre, anell de punts, ratlles de pinzell, detall vermell)
const RING = '<circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3" opacity=".55"/>';
const INK = (d, w = 1.6) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"/>`;
const ART = {
  // Sessió: muntanya de tinta amb el cim nevat i el sol vermell
  session: RING + '<circle cx="146" cy="52" r="15" style="fill:var(--accent)"/>'
    + '<path d="M8 172L78 52L108 108L130 78L194 172Z"/>'
    + '<path d="M78 52L61 82L72 76L79 88L90 74L97 86Z" style="fill:var(--eye-bg,#ece4d3)"/>',
  // Historial: pergamí penjat amb columnes d'escriptura i un segell vermell
  history: RING + '<circle cx="56" cy="29" r="5"/><circle cx="144" cy="29" r="5"/><rect x="56" y="25.5" width="88" height="7" rx="3.5"/>'
    + '<rect x="68" y="33" width="64" height="122"/><rect x="60" y="152" width="80" height="7" rx="3.5"/><circle cx="58" cy="155.5" r="5"/><circle cx="142" cy="155.5" r="5"/>'
    + '<rect x="76" y="42" width="48" height="104" style="fill:var(--eye-bg,#ece4d3)"/>'
    + '<path d="M88 52V92M88 100V124M100 52V76M100 84V112M112 52V70M112 78V100" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="9 5"/>'
    + '<rect x="106" y="114" width="12" height="12" style="fill:var(--accent)"/>',
  // Pla: torii de tinta amb la biga baixa vermella
  plan: RING + '<path d="M22 54Q100 36 178 54L172 68H28Z"/><rect x="36" y="68" width="128" height="7"/>'
    + '<rect x="56" y="75" width="14" height="97"/><rect x="130" y="75" width="14" height="97"/>'
    + '<rect x="46" y="166" width="34" height="8" rx="2"/><rect x="120" y="166" width="34" height="8" rx="2"/>'
    + '<rect x="42" y="92" width="116" height="10" style="fill:var(--accent)"/>',
  // Perfil: escalador de tinta que s'estira cap a una presa vermella
  profile: RING + '<g transform="translate(18 2) scale(.82)"><g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M96 86L92 132"/><path d="M98 86L124 62L142 44"/><path d="M96 86L72 78L60 58"/><path d="M92 132L120 148L112 176"/><path d="M92 132L70 152L78 178"/></g>'
    + '<circle cx="88" cy="62" r="13"/><circle cx="148" cy="38" r="9" style="fill:var(--accent)"/>'
    + '<circle cx="56" cy="50" r="5"/><circle cx="108" cy="182" r="5"/><circle cx="82" cy="184" r="5"/></g>',};
const artSvg = k => `<svg class="eye art" viewBox="0 0 200 200" aria-hidden="true" fill="currentColor">${ART[k]}</svg>`;
const BANNER_SEAL = { session: '山', history: '印', plan: '日', profile: '手' };

// ---------- Mètriques ----------
// Càrrega de sessió = minuts × esforç percebut (sRPE)
const loadOf = s => (s.duration || 0) * (s.rpe || 0);
function metrics() {
  const sum = days => S.sessions.filter(s => daysAgo(s.date) < days).reduce((a, s) => a + loadOf(s), 0);
  const l7 = sum(7), l28 = sum(28);
  // La ràtio aguda:crònica només té sentit amb ~3 setmanes d'historial
  const enough = S.sessions.some(s => daysAgo(s.date) >= 21);
  const acwr = enough && l28 ? l7 / (l28 / 4) : 0;
  const recent = S.sessions.filter(s => daysAgo(s.date) < 7);
  const pain = Math.max(0, ...recent.map(s => Math.max(s.pain?.dits || 0, s.pain?.espatlles || 0, s.pain?.colzes || 0)));
  const sends = S.sessions.flatMap(s => s.climbs || []).filter(c => c.result !== 'projecte'); // les vies antigues "intent" no compten
  const best = sends.length ? gradeAt(Math.max(...sends.map(c => gi(c.grade)))) : '—';
  return { l7, l28, acwr, pain, best, count7: recent.length };
}

// ---------- Navegació ----------
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
const TAB_ORDER = ['home', 'session', 'timer', 'history', 'plan', 'profile'];
// Animació d'entrada: només en canviar de pestanya (render() també es crida en desar o editar dades)
function animateIn(dir) {
  const v = $('view'), t = document.querySelector('.ttl');
  [...v.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 9)));
  [v, t].forEach(el => { if (el) { el.style.setProperty('--dir', dir); el.classList.remove(el === v ? 'enter' : 'swap'); void el.offsetWidth; el.classList.add(el === v ? 'enter' : 'swap'); } });
  const nav = $('tabs'), bs = [...nav.querySelectorAll('button')], a = bs.findIndex(b => b.classList.contains('on'));
  bs.forEach((b, i) => b.style.setProperty('--d', Math.abs(i - a)));
  nav.classList.remove('wave'); void nav.offsetWidth; nav.classList.add('wave');
  window.scrollTo(0, 0);
}
// Sortida: clona la vista actual, la deixa fixa on era i l'esvaeix mentre la nova ja és renderitzada
function leaveGhost(dir) {
  document.querySelectorAll('.ghost').forEach(g => g.remove());
  const v = $('view'), r = v.getBoundingClientRect();
  if (!v.children.length) return;
  const g = v.cloneNode(true);
  g.removeAttribute('id'); g.className = 'ghost'; g.setAttribute('aria-hidden', 'true');
  g.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  Object.assign(g.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0' });
  g.style.setProperty('--dir', dir);
  document.body.appendChild(g);
  setTimeout(() => g.remove(), 320);
}
function go(t) {
  const dir = TAB_ORDER.indexOf(t) >= TAB_ORDER.indexOf(tab) ? 1 : -1, same = t === tab;
  if (!same && !matchMedia('(prefers-reduced-motion: reduce)').matches) leaveGhost(dir);
  tab = t; planOff = {}; if (t !== 'history') calOpen = null;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  { const bs = [...document.querySelectorAll('#tabs button')]; $('tabs').style.setProperty('--x', ((bs.findIndex(b => b.dataset.tab === t) + .5) / bs.length * 100) + '%'); }
  $('title').textContent = { home: 'Inici', session: 'Sessió', timer: 'Temporitzador', history: 'Historial', plan: 'Pla d\'entrenament', profile: 'Perfil' }[t];
  $('jp').textContent = { home: '今日', session: '登る', timer: '時', history: '記録', plan: '計画', profile: '身体' }[t];
  render();
  if (!same) animateIn(dir);
}
// Banner de paper a la part de dalt de cada pestanya (mateix estil que l'inici): kanji vertical, ull, segell
function banner() {
  let k, label, big, sub = '';
  if (tab === 'session') {
    const a = S.active;
    k = '登る'; label = a ? (a.type === 'gym' ? 'Gym' : 'Escalada') : 'Avui';
    if (!a) big = picking ? 'Escalfament' : 'Sessió';
    else if (a.type === 'gym') { const n = (a.exercises || []).length; big = `${n} ${n === 1 ? 'exercici' : 'exercicis'}`; }
    else { const n = a.climbs.length; big = `${n} ${n === 1 ? 'via' : 'vies'}`; }
  } else if (tab === 'history') {
    const n = S.sessions.length; k = '記録'; label = 'Total'; big = `${n} ${n === 1 ? 'sessió' : 'sessions'}`; sub = metrics().best === '—' ? '' : metrics().best;
    if (calOpen) { const d = new Date(calOpen + 'T00:00:00'); label = 'Dia'; big = `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3).toLowerCase()}`; sub = `${d.getFullYear()}`; }
  } else if (tab === 'plan') {
    const st = streakStats(), n = DAY_NAMES.reduce((a, _, i) => a + planDay(i).length, 0);
    k = '計画'; label = 'Setmana'; big = `${st.planned}/7 dies`; sub = n ? `${n} exercicis` : '';
  } else if (tab === 'profile') {
    k = '身体'; label = 'Nivell'; big = S.profile.maxGrade; sub = `${{ bloc: 'Bloc', via: 'Via', mix: 'Mixt' }[S.profile.goal] || ''} · ${S.profile.days} dies`;
  } else return '';
  return `<div class="hero banner b-${tab}"><span class="vert" lang="ja">${k}</span>${tab === 'profile' ? `<div class="scene" aria-hidden="true"><svg class="ring" viewBox="0 0 200 200">${RING}</svg><img class="handimg" src="ma.png" alt=""></div>`
      : tab === 'session' && !S.active && picking ? `<div class="scene" aria-hidden="true"><svg class="ring" viewBox="0 0 200 200">${RING}</svg><img class="fist" src="art/puny.png" alt=""></div>`
      : tab === 'session' ? `<div class="scene" aria-hidden="true"><svg class="ring" viewBox="0 0 200 200">${RING}</svg><img class="sun" src="sol.png" alt=""><img class="mtn" src="muntanya.png" alt=""></div>`
      : tab === 'history' ? `<div class="scene" aria-hidden="true"><svg class="ring" viewBox="0 0 200 200">${RING}</svg><img class="cloud" src="nuvol.png" alt=""><img class="column" src="columna.png" alt=""></div>`
      : tab === 'plan' ? `<div class="scene" aria-hidden="true"><svg class="ring" viewBox="0 0 200 200">${RING}</svg><img class="torii" src="torii.png" alt=""></div>`
      : artSvg(tab)}
    <div class="date">${label}</div><div class="big">${esc(big)}</div>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}<span class="hanko" lang="ja">${BANNER_SEAL[tab]}</span></div>`;
}
// Il·lustracions de tinta com a fons suau d'algunes targetes (segons el títol)
const CARD_ART = { 'Estat': 'mussol', 'Punts febles': 'eclipsi','Escalada d\'avui': 'mans-pinca', 'Força de dits': 'mans-pinca', 'Afegir via': 'mans-roca', 'Progressió': 'catedral', 'Recordatoris': 'lluna', 'Lesions': 'espina', 'Son i recuperació': 'mussol' };
function cardArt() {
  document.querySelectorAll('#view .card h2').forEach(h => {
    const k = CARD_ART[h.textContent.trim()], c = h.closest('.card');
    if (k && c) { c.classList.add('bgart'); c.classList.toggle('wide', k === 'forat'); c.style.setProperty('--bgart', `url(art/${k}.png)`); }
  });
}
function render() {
  clearInterval(ticker);
  $('view').innerHTML = banner() + { home: viewHome, session: viewSession, timer: viewItv, history: viewHistory, plan: viewPlan, profile: viewProfile }[tab]();
  cardArt();
  if (tab === 'timer') itvSync(itvRun ? (itvRun.end - Date.now()) / 1000 : 0);
  if (tab === 'session' && S.active) ticker = setInterval(tick, 250);
}

// ---------- Inici ----------
function viewHome() {
  const m = metrics();
  const [state, cls] = m.acwr === 0 ? ['Sense dades', ''] : m.acwr > 1.5 ? ['Sobrecàrrega', 'bad'] : m.acwr > 1.3 ? ['Alerta', 'warn'] : m.acwr < 0.8 ? ['Poca càrrega', 'warn'] : ['Òptim', 'ok'];
  // Càrrega de les últimes 8 setmanes
  const weeks = [...Array(8)].map((_, i) => S.sessions.filter(s => { const d = daysAgo(s.date); return d >= (7 - i) * 7 && d < (8 - i) * 7; }).reduce((a, s) => a + loadOf(s), 0));
  const max = Math.max(1, ...weeks);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const items = planDay(todayIdx);
  const dt = new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  // Anells d'estat: setmana (dies entrenats / dies del pla), càrrega (ràtio aguda:crònica) i recuperació (son i sensació, 7 dies)
  const st = streakStats(), target = st.planned || S.profile.days || 3;
  const rv = recs().filter(r => daysAgo(r.date) < 7).flatMap(r => [r.sleep, r.feel]).filter(Boolean), rAvg = rv.length ? rv.reduce((a, b) => a + b, 0) / rv.length : null;
  const KJ = { Setmana: '週', 'Càrrega': '荷', 'Recuperació': '休' };
  const ring = (f, txt, label, color, kj = KJ[label]) => `<div class="ring"><svg viewBox="0 0 100 100" role="img" aria-label="${label}: ${txt}"><circle class="bg" cx="50" cy="50" r="40"/>${f > 0 ? `<circle class="fg" cx="50" cy="50" r="40" stroke="${color}" stroke-dasharray="${(251.3 * Math.min(1, f)).toFixed(1)} 251.3"/>` : ''}<text x="50" y="58">${txt}</text></svg><small><i lang="ja">${kj}</i>${label}</small></div>`;
  const dset = new Set(S.sessions.map(s => s.date));
  const d7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return dset.has(ymd(d)); });
  const bi = GRADES.indexOf(m.best);
  const loadColor ={ ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)' }[cls] || 'var(--muted)';
  return `
  <div class="hero">
    <span class="vert" lang="ja">登る</span>${eyeSvg()}
    <div class="date">${dt}</div>
    <div class="big">${S.active ? 'Sessió en curs' : items.length ? 'Avui toca' : 'Dia de descans'}</div>
    <p class="sub">${items.length ? `${items.length} ${items.length === 1 ? 'exercici' : 'exercicis'}` : ''}</p>
    <span class="hanko" lang="ja">目</span>
    ${S.active ? `<button class="start" onclick="go('session')">Continuar sessió ${arrow}</button>` : `<button class="start" onclick="startSession()">Començar sessió ${arrow}</button>`}
  </div>
  <div class="card day hday ${items.length ? '' : 'rest'}"><img class="lily" src="lliri.png" alt="" aria-hidden="true">
    <h2><span class="wd" lang="ja" style="margin-top:-2px">${'月火水木金土日'[todayIdx]}</span>${DAY_NAMES[todayIdx]}</h2>
    ${items.length ? `<ul>${items.map(i => `<li>${exLabel(i)}</li>`).join('')}</ul>`
      : `<button class="small" onclick="go('plan')">+ Afegir al pla</button>`}
  </div>
  ${injList().map(j => `<div class="card day"><h2>Rehab · ${injName(j)}</h2>
    ${phaseBar(j.phase)}
    <p class="muted" style="margin:8px 0">Fase ${j.phase}/${REHAB.length} · ${injChecks(j).length}/${REHAB[j.phase - 1].ex.length} fets</p>
    <button class="small" onclick="go('plan')">Obrir</button></div>`).join('')}
  <div class="card">
    <h2>Estat</h2>
    <div class="rings">${ring(st.thisWeek / target, `${st.thisWeek}/${target}`, 'Setmana', 'var(--accent-soft)')}${ring(m.acwr / 2, m.acwr ? m.acwr.toFixed(1) : '—', 'Càrrega', loadColor)}${ring(rAvg ? rAvg / 5 : 0, rAvg ? rAvg.toFixed(1) : '—', 'Recuperació', 'var(--ok)')}</div>
    <div class="stats">
      <div class="stat"><div class="g7" aria-hidden="true">${d7.map(on => `<i class="${on ? 'on' : ''}"></i>`).join('')}</div><b>${m.count7}</b><span>7 dies</span></div>
      <div class="stat"><div class="gl" aria-hidden="true">${GRADES.map((g, i) => `<i style="height:${6 + i * 1.4}px;${i <= bi ? `background:${COLORS[g.split(' ')[0]]}` : ''}"></i>`).join('')}</div><b>${m.best}</b><span>millor</span></div>
      <div class="stat"><svg class="flame${st.streak ? '' : ' off'}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="flg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d03a23"/><stop offset=".6" stop-color="#ee6a2c"/><stop offset="1" stop-color="#f2b84b"/></linearGradient></defs><path d="M12 1.5c.6 4.2 6.2 6.6 6.2 12.7a6.2 6.2 0 0 1-12.4 0c0-3 1.8-4.6 2.4-7.4 1.9 1.1 3 2.3 3.2 4.3 1.2-2.6 1.1-6.2.6-9.6z" fill="url(#flg)"/><path d="M12 22.2a3.3 3.3 0 0 1-3.3-3.3c0-2.1 1.9-3.2 3.3-5.3 1.4 2.1 3.3 3.2 3.3 5.3a3.3 3.3 0 0 1-3.3 3.3z" fill="#f7dc8a"/></svg><b>${st.streak}</b><span>ratxa</span></div>
    </div>
    <p class="muted"><span class="tag ${cls}">${state}</span>${m.pain >= 5 ? ` <span class="tag bad">Dolor ${m.pain}/10</span>` : ''}</p>
    <div class="wk${weeks.some(w => w > 0) ? '' : ' empty'}">${weeks.map((w, i) => `<i class="${i === 7 ? 'now' : ''}" style="--k:${i};height:${weeks.some(x => x > 0) ? Math.max((w / max) * 100, 7) : 7}%"></i>`).join('')}</div>
    <div class="wkl"><span>8 setmanes</span><span>ara</span></div>
  </div>`;
}

// ---------- Sessió en directe ----------
// Miniesquemes dels exercicis d'escalfament (SVG de traç simple)
const P = (d, extra = '') => `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;
const ICONS = {
  jack: P('<circle cx="24" cy="8" r="4"/><path d="M24 13V30M24 17L12 6M24 17L36 6M24 30L14 44M24 30L34 44"/>'),
  arms: P('<circle cx="24" cy="9" r="4"/><path d="M24 14V32M24 32L17 44M24 32L31 44M24 19H10M24 19H38"/>', '<circle cx="8" cy="19" r="4" stroke-dasharray="3 3"/><circle cx="40" cy="19" r="4" stroke-dasharray="3 3"/>'),
  hang: P('<path d="M4 5H44M18 5L24 22M30 5L24 22"/><circle cx="24" cy="15" r="0"/><path d="M24 22V38M24 38L19 46M24 38L29 46"/>'),
  scap: P('<path d="M4 5H44M18 5L24 22M30 5L24 22M24 22V38M24 38L19 46M24 38L29 46"/>', '<path d="M40 30V18M36 22L40 18L44 22"/>'),
  band: P('<circle cx="18" cy="8" r="4"/><path d="M18 13V32M18 32L13 44M18 32L23 44M18 19V29H30"/>', '<path d="M30 29L40 22" stroke-dasharray="3 3"/><path d="M44 22H38M44 22V28" />'),
  wrist: P('<path d="M4 30H26L36 20"/>', '<path d="M42 38L32 30" /><path d="M42 38V32M42 38H36"/>'),
  hand: P('<circle cx="24" cy="34" r="7"/><path d="M13 18L19 29M20 10L22 28M28 10L26 28M35 14L29 29M42 24L31 33"/>'),
  wall: P('<rect x="12" y="4" width="24" height="40" rx="2"/><circle cx="20" cy="14" r="2"/><circle cx="29" cy="22" r="2"/><circle cx="19" cy="31" r="2"/><circle cx="28" cy="38" r="2"/>', '<path d="M42 38V10M38 14L42 10L46 14"/>'),
  table: P('<path d="M4 38H44"/><path d="M14 38V26M22 38V20M30 38V22M38 38V28"/>', '<path d="M24 8V14M20 11L24 15L28 11"/>'),
  circ: P('<path d="M4 34H24L30 28"/>', '<circle cx="36" cy="18" r="9" stroke-dasharray="4 4"/><path d="M42 12L44 18L38 18"/>'),
  ext: P('<path d="M4 28H26"/><path d="M26 28L38 18"/>', '<path d="M40 40L30 34" stroke-dasharray="3 3"/><path d="M44 24V32M44 32H36"/>'),
};
// Escalfament únic: dits, espatlles i colze/canell (inclou prevenció de les lesions més comunes).
const WARMUP = [
  { i: 'hand', img: 'dits.png', name: 'Mobilitat de dits', sets: 2, reps: 10, t: '<strong class="wt">Mobilitat de dits</strong><small>2×10</small>' },
  { i: 'band', img: 'banda.png', name: 'Banda al pit', sets: 2, reps: 15, t: '<strong class="wt">Banda al pit</strong><small>2×15</small>' },
  { i: 'hang', img: 'penjada.png', name: 'Dominada', sets: 3, reps: 5, t: '<strong class="wt">Dominada</strong><small>3×5</small>' },
  { i: 'scap', img: 'regleta.png', name: 'Penjada a regleta', sets: 3, secs: 10, t: '<strong class="wt">Penjada a regleta</strong><small>3×10 s</small>' },
  { i: 'wrist', img: 'avantbracos.png', name: 'Estirament d\'avantbraços', sets: 2, secs: 30, t: '<strong class="wt">Estirament d\'avantbraços</strong><small>2×30 s</small>' },
];
const warmSteps = steps => `<ul class="wsteps">${steps.map(s => `<li${s.img ? ' onclick="this.classList.toggle(\'zoom\')"' : ''}><span class="wico${s.img ? ' pic' : ''}">${s.img ? `<img src="escalfament/${s.img}" alt="" loading="lazy">` : ICONS[s.i]}</span><span>${s.t}</span></li>`).join('')}</ul>`;
let picking = false;
// Iniciar sessió: primer es mostra l'escalfament
function startSession() { picking = true; wzStart(); go('session'); }
// Escalfament guiat: cada exercici comença sol (3 s de preparació), va fent les sèries i passa al següent.
// Els exercicis amb temps (s) compten enrere i avancen sols; els de repeticions esperen el "Sèrie feta".
const WZ_READY = 3, WZ_C = 2 * Math.PI * 88, WZ_RESTS_KEY = 'escalada-wzrests';
let wz = null, wzTimer = null, wzRests = {};
try { wzRests = JSON.parse(localStorage.getItem(WZ_RESTS_KEY)) || {}; } catch {}
// Cada exercici té el seu propi descans entre sèries (per defecte 10 s)
const wzRestOf = s => Math.max(5, Math.min(120, wzRests[s.name] || 10));
// So suau: sinus amb entrada i sortida progressives (sense clics) i volum baix; sense vibració
function wzTone(freq, ms, delay = 0, vol = .09) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime + delay, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000);
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + ms / 1000 + .05);
  } catch {}
}
const wzChime = notes => notes.forEach((f, k) => wzTone(f, 420, k * .13));
function wzPhase(p, sec) { wz.phase = p; wz.dur = sec; wz.end = sec ? Date.now() + sec * 1000 : 0; wz.last = null; }
function wzLoop() { clearInterval(wzTimer); wzTimer = setInterval(wzTick, 100); }
// Primer una pantalla d'inici (llista d'exercicis) on s'accepta començar; després tot va sol
function wzStart() { clearInterval(wzTimer); wz = { i: 0, set: 1, enter: true, phase: 'intro', end: 0 }; }
function wzBegin() { wz.enter = true; wzPhase('ready', WZ_READY); wzLoop(); wzDraw(); }
function wzStop() { clearInterval(wzTimer); wz = null; }
function wzAdvance() {
  wz.i++; wz.set = 1; wz.enter = true;
  if (wz.i >= WARMUP.length) { wz.phase = 'done'; wz.end = 0; clearInterval(wzTimer); wzChime([523, 659, 784, 1047]); }
  else wzPhase('ready', WZ_READY);
}
function wzSetDone() {
  if (wz.set < WARMUP[wz.i].sets) { wz.set++; wzPhase('rest', wzRestOf(WARMUP[wz.i])); wzChime([659, 523]); } else wzAdvance();
  wzDraw();
}
function wzDone() { wzSetDone(); }
function wzSkip() { wzAdvance(); wzDraw(); }
// Enrere: torna a la sèrie anterior; si és la primera sèrie, a l'exercici anterior (des del final, a l'últim)
function wzGo(i, set) { wz.i = i; wz.set = set; wz.enter = true; wzPhase('ready', WZ_READY); wzLoop(); wzDraw(); }
// Una fletxa = sèrie, dues fletxes = exercici
function wzPrevSet() {
  const n = WARMUP.length;
  if (wz.phase === 'done') return wzGo(n - 1, WARMUP[n - 1].sets);
  if (wz.set > 1) return wzGo(wz.i, wz.set - 1);
  if (wz.i > 0) return wzGo(wz.i - 1, WARMUP[wz.i - 1].sets);
  wzGo(0, 1);
}
function wzPrevEx() { wzGo(wz.phase === 'done' ? WARMUP.length - 1 : Math.max(0, wz.i - 1), 1); }
function wzNextSet() {
  if (wz.phase === 'rest') return wzNext();
  if (wz.set < WARMUP[wz.i].sets) return wzGo(wz.i, wz.set + 1);
  wzSkip();
}
// Durada del descans (es recorda); si ja estàs descansant, s'aplica al moment
function wzRestAdj(d) {
  const s = WARMUP[wz.i], r = Math.max(5, Math.min(120, wzRestOf(s) + d));
  wzRests[s.name] = r;
  try { localStorage.setItem(WZ_RESTS_KEY, JSON.stringify(wzRests)); } catch {}
  if (wz.phase === 'rest') { wz.end += (r - wz.dur) * 1000; wz.dur = r; wz.last = null; }
  wzDraw();
}
function wzNext() {
  if (wz.phase === 'work') return wzSetDone();
  if (wz.phase === 'ready') wzChime([587, 784]);
  wzPhase('work', WARMUP[wz.i].secs || 0); wzDraw();
}
function wzTick() {
  if (!wz || !wz.end) return;
  if (!$('wz')) { wz.end += 100; return; }
  const left = (wz.end - Date.now()) / 1000;
  if (left <= 0) return wzNext();
  const r = $('wzr'); if (r) r.style.strokeDashoffset = WZ_C * (1 - left / wz.dur);
  const n = Math.ceil(left);
  if (n !== wz.last) {
    wz.last = n;
    const b = $('wzn');
    if (b) { b.textContent = n; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    if (n <= 3 && wz.phase !== 'rest') wzTone(n === 1 ? 660 : 440, n === 1 ? 300 : 170);
  }
}
function wzDraw() {
  const el = $('wz'); if (!el) return;
  const enter = wz.enter; el.innerHTML = wzHtml();
  if (enter) wzCenter();
}
// Centra tota la targeta de l'exercici a la part visible (sense la barra de baix); si no hi cap, la posa a dalt
function wzCenter() {
  const el = $('wz'); if (!el) return;
  const avail = innerHeight - ($('tabs') ? $('tabs').offsetHeight : 60), r = el.getBoundingClientRect();
  scrollTo({ top: scrollY + r.top - Math.max(8, (avail - r.height) / 2), behavior: 'smooth' });
}
function wzHtml() {
  const w = wz, enter = w.enter; w.enter = false;
  if (w.phase === 'intro') return `<button class="primary" style="width:100%;margin-bottom:14px" onclick="wzBegin()">▶ Començar</button>${warmSteps(WARMUP)}`;
  const bar = `<div class="wz-bar">${WARMUP.map((_, k) => `<i class="${w.phase === 'done' || k < w.i ? 'done' : k === w.i ? 'cur' : ''}"></i>`).join('')}</div>`;
  if (w.phase === 'done') return `${bar}<div class="wz-done"><div class="wz-enso"><svg viewBox="0 0 200 200" aria-hidden="true"><path class="e1" d="M146 36A74 74 0 1 0 172 106"/><path class="e2" d="M150 32A78 78 0 1 0 176 112"/></svg>
      <img class="inkw zen" src="art/meditacio.png" alt=""><span class="wz-seal" lang="ja" aria-hidden="true">整</span><span class="wz-vert" lang="ja" aria-hidden="true">準備完了</span></div>
    <h3>Escalfament fet</h3></div>
    <button class="primary" style="width:100%" onclick="beginSession()">Començar sessió</button>`;
  const s = WARMUP[w.i], timed = w.end > 0, left = timed ? Math.max(0, (w.end - Date.now()) / 1000) : 0;
  const tag = { ready: 'Prepara\'t', work: 'Ara', rest: 'Descans' }[w.phase];
  const big = timed ? Math.ceil(left) : s.reps, unit = timed ? 's' : '×';
  const off = timed ? WZ_C * (1 - left / w.dur) : 0;
  const pips = Array.from({ length: s.sets }, (_, k) => `<i class="${k < w.set - 1 ? 'done' : k === w.set - 1 && w.phase !== 'rest' ? 'cur' : ''}"></i>`).join('');
  const btn = w.phase === 'ready' ? `<button class="primary" style="width:100%" onclick="wzNext()">Començar ara</button>`
    : w.phase === 'rest' ? `<button class="primary" style="width:100%" onclick="wzNext()">Saltar descans</button>`
    : !timed ? `<button class="primary" style="width:100%" onclick="wzDone()">Sèrie feta ✓</button>` : '';
  return `${bar}
    <div class="wz-stage${enter ? ' in' : ''}"><div class="wz-disc"></div>
      <svg class="wz-ring ${w.phase}${timed ? '' : ' full'}" viewBox="0 0 200 200" aria-hidden="true"><circle class="t" cx="100" cy="100" r="88"/><circle class="p" id="wzr" cx="100" cy="100" r="88" style="stroke-dasharray:${WZ_C};stroke-dashoffset:${off}"/></svg>
      <span class="wz-fig"><img class="wz-img" src="escalfament/${s.img}" alt=""></span></div>
    <div class="wz-info${enter ? ' in' : ''}"><span class="wz-tag ${w.phase}">${tag}</span>
      <h3 class="wz-name">${esc(s.name)}</h3>
      <div class="wz-big"><b id="wzn">${big}</b><small>${unit}</small></div>
      <div class="wz-sets" aria-label="Sèrie ${Math.min(w.set, s.sets)} de ${s.sets}">${pips}</div></div>
    <div class="wz-rest"><span>Descans</span><button aria-label="Menys descans" onclick="wzRestAdj(-5)">−</button><b>${wzRestOf(s)} s</b><button aria-label="Més descans" onclick="wzRestAdj(5)">+</button></div>
    ${btn}<div class="wz-nav"><div><button aria-label="Exercici anterior" onclick="wzPrevEx()"><svg viewBox="0 0 24 24"><path d="M12 5L5 12L12 19M19 5L12 12L19 19"/></svg></button><button aria-label="Sèrie anterior" onclick="wzPrevSet()"><svg viewBox="0 0 24 24"><path d="M15 5L8 12L15 19"/></svg></button></div>
      <div><button aria-label="Exercici següent" onclick="wzSkip()"><svg viewBox="0 0 24 24"><path d="M5 5L12 12L5 19M12 5L19 12L12 19"/></svg></button></div></div>`;
}
function beginSession() {
  wzStop();
  const color = gradeAt(gi(S.profile.maxGrade) - 1).split(' ')[0], level = 'fàcil';
  S.active = { id: Date.now(), date: today(), start: Date.now(), type: 'escalada', climbs: [], exercises: [], warmup: WARMUP.slice(), pick: { color, level } };
  picking = false; save(); go('session');
}
// Temporitzador d'intervals: temps de treball, descans, repeticions, sèries i descans entre sèries.
// En iniciar hi ha sempre 3 s de preparació. Fa un pit als últims 3 s de cada fase (l'últim segon més agut i llarg);
// quan comença el treball no sona res. Els ajustos es poden guardar amb un nom.
const ITV_KEY = 'escalada-itv';
let itv = { work: 10, rest: 20, reps: 3, sets: 1, setRest: 60 }, itvRun = null, itvDone = false, itvTimer = null, audioCtx = null;
try { Object.assign(itv, JSON.parse(localStorage.getItem(ITV_KEY))); } catch {}
function beep(freq, ms) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; g.gain.value = 0.25;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
  if (navigator.vibrate) navigator.vibrate(ms);
}
const ITV_MIN = { work: 1, rest: 0, reps: 1, sets: 1, setRest: 0 };
const PRE_KEY = 'escalada-itv-presets';
let itvPresets = [];
try { itvPresets = JSON.parse(localStorage.getItem(PRE_KEY)) || []; } catch {}
if (!Array.isArray(itvPresets)) itvPresets = [];
function saveItv() {
  try { localStorage.setItem(ITV_KEY, JSON.stringify(itv)); localStorage.setItem(PRE_KEY, JSON.stringify(itvPresets)); } catch {}
}
function setItv(k, el) {
  const v = Math.max(ITV_MIN[k], Math.min(k === 'reps' || k === 'sets' ? 99 : 3600, parseInt(el.value) || 0));
  itv[k] = v; el.value = v; saveItv();
}
// Ajustos amb nom: es guarden, es carreguen i s'esborren; el mateix nom els substitueix
function savePreset() {
  const name = $('itvName').value.trim();
  if (!name) return $('itvName').focus();
  const p = { name, ...itv }, i = itvPresets.findIndex(x => x.name === name);
  if (i >= 0) itvPresets[i] = p; else itvPresets.push(p);
  saveItv(); render();
}
function loadPreset(i) {
  if (itvRun) return;
  const { name, ...v } = itvPresets[i];
  Object.assign(itv, v); itvDone = false; saveItv(); render();
}
// Esborrar demana confirmació dins la pàgina (confirm() no es veu en tots els navegadors)
let delAsk = -1;
function delPreset(i) { if (!itvRun) { delAsk = i; render(); } }
function delCancel() { delAsk = -1; render(); }
function delConfirm(i) { itvPresets.splice(i, 1); delAsk = -1; saveItv(); render(); }
function itvStart() {
  if (itvRun) return itvStop();
  itvDone = false;
  itvRun = { phase: 'ready', rep: 1, set: 1, end: Date.now() + 3000, last: null };
  itvTimer = setInterval(itvTick, 200); itvTick();
}
function itvStop() { clearInterval(itvTimer); itvRun = null; itvSync(); }
function itvTick() {
  if (!itvRun) return;
  const r = itvRun;
  let left = (r.end - Date.now()) / 1000;
  const sec = Math.ceil(left);
  if (sec >= 1 && sec <= 3 && r.last !== sec) { r.last = sec; sec === 1 ? beep(1760, 350) : beep(880, 150); }
  if (left <= 0) {
    const rest = (phase, sec) => { r.phase = phase; r.end = Date.now() + sec * 1000; };
    const work = () => { r.phase = 'work'; r.end = Date.now() + itv.work * 1000; };
    if (r.phase === 'ready') work();
    else if (r.phase === 'rest') { r.rep++; work(); }
    else if (r.phase === 'setrest') { r.set++; r.rep = 1; work(); }
    else if (r.rep < itv.reps) { if (itv.rest > 0) rest('rest', itv.rest); else { r.rep++; work(); } }
    else if (r.set < itv.sets) { if (itv.setRest > 0) rest('setrest', itv.setRest); else { r.set++; r.rep = 1; work(); } }
    else { itvDone = true; beep(1320, 500); return itvStop(); }
    r.last = null; left = (r.end - Date.now()) / 1000;
  }
  itvSync(left);
}
function itvSync(left) {
  const d = $('itvDisp'); if (!d) return;
  const r = itvRun;
  d.className = 'timer' + (r && r.phase !== 'work' ? ' rest' : '');
  const name = r && { ready: 'Preparat', work: 'Treball', rest: 'Descans', setrest: 'Descans entre sèries' }[r.phase];
  d.innerHTML = r ? `${fmt(Math.ceil(left))}<div class="muted" style="font-size:14px;font-weight:400">${name}${r.phase === 'ready' ? '' : ` · sèrie ${r.set} de ${itv.sets} · repetició ${r.rep} de ${itv.reps}`}</div>`
    : itvDone ? 'Fet!' : fmt(itv.work);
  $('itvBtn').textContent = r ? '■ Aturar' : '▶ Iniciar';
  document.querySelectorAll('.itvin').forEach(i => i.disabled = !!r);
}
function viewItv() {
  const f = (k, lbl) => `<div><label>${lbl}</label><input class="itvin" type="number" inputmode="numeric" min="${ITV_MIN[k]}" value="${itv[k]}" onchange="setItv('${k}',this)"></div>`;
  return `<div class="card"><h2>Temporitzador</h2>
    <div class="row">${f('work', 'Treball (s)')}${f('rest', 'Descans (s)')}${f('reps', 'Repeticions')}</div>
    <div class="row">${f('sets', 'Sèries')}${f('setRest', 'Descans sèries (s)')}</div>
    <div class="timer" id="itvDisp">${fmt(itv.work)}</div>
    <button class="primary" id="itvBtn" style="width:100%" onclick="itvStart()">▶ Iniciar</button></div>
  <div class="card"><h2>Ajustos desats</h2>
    <div class="row"><input id="itvName" placeholder="Nom (ex. Penjades 7/3)" maxlength="30"><button class="small" style="flex:none" onclick="savePreset()">Desar</button></div>
    ${itvPresets.length ? `<ul class="list presets" style="margin-top:8px">${itvPresets.map((p, i) => `<li><span><b>${esc(p.name)}</b><br><span class="muted">${p.work} s treball · ${p.rest} s descans · ${p.reps} rep. · ${p.sets} sèr. · ${p.setRest} s entre sèr.</span></span>
      ${delAsk === i
        ? `<span class="pre"><button class="small" onclick="delCancel()">Cancel·lar</button><button class="small sure" onclick="delConfirm(${i})">Esborrar</button></span>`
        : `<span class="pre"><button class="small itvin" onclick="loadPreset(${i})">Carregar</button><button class="small danger itvin" aria-label="Esborrar" onclick="delPreset(${i})">✕</button></span>`}</li>`).join('')}</ul>`
    : ''}</div>`;
}
function viewWarmups() {
  if (!wz) wzStart();
  return `<div class="card wz" id="wz">${wzHtml()}</div>
  <p class="row"><button class="danger" onclick="wzStop();picking=false;go('home')">Cancel·lar</button></p>`;
}
function tick() {
  if (!S.active) return;
  const el = $('clock'); if (el) el.textContent = fmt((Date.now() - S.active.start) / 1000);
  const r = $('rest');
  if (r) {
    const left = (restEnd - Date.now()) / 1000;
    r.textContent = restEnd ? (left > 0 ? 'Descans ' + fmt(left) : 'Som-hi!') : '';
    if (restEnd && left <= 0 && left > -0.3 && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
}
function startRest(sec) { restEnd = Date.now() + sec * 1000; tick(); }

function viewSession() {
  const a = S.active;
  if (!a && picking) return viewWarmups();
  if (!a) return `<div class="card"><button class="primary" style="width:100%" onclick="startSession()">▶ Començar sessió</button></div>`;
  const pick = a.pick || (a.pick = { color: 'Verd', level: 'fàcil' });
  return `
  <div class="card">
    <div class="seg">${Object.entries(TYPES).map(([t, n]) => `<button class="${a.type === t ? 'on' : ''}" onclick="setType('${t}')">${n}</button>`).join('')}</div>
    ${Array.isArray(a.warmup) ? `<details><summary class="muted">Escalfament</summary>
      ${warmSteps(a.warmup)}</details>` : ''}
    <div class="timer" id="clock">00:00</div>
    <div class="timer rest" id="rest" style="font-size:28px"></div>
    <div class="seg">
      <button onclick="startRest(90)">1:30</button><button onclick="startRest(180)">3:00</button>
      <button onclick="startRest(300)">5:00</button><button onclick="restEnd=0;tick()">✕</button>
    </div>
  </div>
  ${a.type === 'escalada' ? `${climbToday().length ? `<div class="card"><h2>Escalada d'avui</h2>
    <ul class="list">${climbToday().map(n => `<li>${exLabel(n)}</li>`).join('')}</ul></div>` : ''}<div class="card">
    <div class="cardhead"><h2>Afegir via</h2>
      <button class="starbtn ${pick.first ? 'on' : ''}" aria-label="Primer cop" aria-pressed="${!!pick.first}" title="Primer cop" onclick="toggleFirst(this)">${ic('star')}</button></div>
    <div class="colors">${Object.entries(COLORS).map(([c, hex]) => `<button class="swatch ${pick.color === c ? 'on' : ''}" style="--c:${hex}" aria-label="${c}" title="${c}" onclick="setPick('color','${c}')"></button>`).join('')}</div>
    <div class="lvl">${LEVELS.map(l => `<button class="${pick.level === l ? 'on' : ''}" onclick="setPick('level','${l}')">${l[0].toUpperCase() + l.slice(1)}</button>`).join('')}</div>
    <div class="gradebadge" style="--c:${COLORS[pick.color]}"><i></i><b>${pick.color} ${pick.level}</b></div>
    ${tilePick('style', STYLES, pick.style || 'bloc', 'two')}
    ${tilePick('result', RESULTS, pick.result || 'flash', 'three')}
    <button class="primary" style="width:100%;margin-top:14px" onclick="addClimb()">+ Afegir</button>
    <ul class="list">${a.climbs.map((c, i) => `<li><span>${dot(c.grade)}<b>${c.grade}</b> <span class="ics">${ic(c.style)}${ic(c.result)}${c.first ? ic('star') : ''}</span></span>
      <button class="small danger" onclick="S.active.climbs.splice(${i},1);save();render()">✕</button></li>`).join('')}</ul>
  </div>` : viewGym(a)}
  <div class="card">
    <h2>Acabar sessió</h2>
    <label>Esforç (1-10)</label>${scale('rpe', a.rpe)}
    <label>Fatiga (1-10)</label>${scale('fatigue', a.fatigue)}
    ${discardAsk
      ? `<p>Descartar sessió?</p><p class="row"><button onclick="askDiscard(false)">Cancel·lar</button>
      <button class="primary" style="background:var(--bad)" onclick="cancelSession()">Descartar</button></p>`
      : `<p class="row"><button class="danger" onclick="askDiscard(true)">Descartar</button>
      <button class="primary" onclick="finishSession()">Desar sessió</button></p>`}
  </div>`;
}
// Escala de 10 punts seleccionables (esforç / fatiga)
function scale(key, val) {
  return `<div class="scale" id="sc-${key}">${[...Array(10)].map((_, i) =>
    `<button class="${val === i + 1 ? 'on' : ''}" onclick="setScale('${key}',${i + 1})">${i + 1}</button>`).join('')}</div>`;
}
function setScale(key, n) {
  S.active[key] = n; save();
  document.querySelectorAll(`#sc-${key} button`).forEach((b, i) => b.classList.toggle('on', i + 1 === n));
}
function setType(t) { S.active.type = t; save(); render(); }
// Botons de selecció (sense tornar a pintar, per no perdre el text escrit)
function segPick(key, opts, val) {
  return `<div class="seg" id="sg-${key}">${Object.entries(opts).map(([k, n]) =>
    `<button class="${val === k ? 'on' : ''}" data-v="${k}" onclick="setSeg('${key}','${k}')">${n}</button>`).join('')}</div>`;
}
// Icones de línia per a estil i resultat de la via
const BOLT = 'M13 2L5 14H11L10 22L19 9H13Z';
const IC = {
  bloc: '<path d="M3 19L5.5 9L11 5L17 7L21 14L19 19Z"/><path d="M11 5L12 12L17 7M12 12L19 19"/>',
  autos: '<path d="M12 3V6"/><rect x="7" y="6" width="10" height="15" rx="5"/><path d="M7 13H11"/>',
  flash: `<path d="${BOLT}"/>`,
  semiflash: `<path d="${BOLT}" fill="none"/><clipPath id="hb"><rect x="0" y="0" width="12" height="24"/></clipPath><path d="${BOLT}" fill="currentColor" clip-path="url(#hb)"/>`,
  noflash: `<path d="${BOLT}" opacity=".55"/><path d="M4 4L20 20"/>`,
  star: '<path d="M12 3L14.8 8.8L21 9.7L16.5 14.1L17.6 20.3L12 17.3L6.4 20.3L7.5 14.1L3 9.7L9.2 8.8Z"/>'
};
const ic = k => IC[k] ? `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>` : '';
function toggleFirst(b) { const p = S.active.pick; p.first = !p.first; save(); b.classList.toggle('on', p.first); b.setAttribute('aria-pressed', !!p.first); }
// Selecció amb icona i nom petit (mateix comportament que segPick)
function tilePick(key, opts, val, cls) {
  return `<div class="tiles ${cls}" id="sg-${key}">${Object.entries(opts).map(([k, n]) =>
    `<button class="${val === k ? 'on' : ''}" data-v="${k}" onclick="setSeg('${key}','${k}')">${ic(k)}<span>${n}</span></button>`).join('')}</div>`;
}
function setSeg(key, v) {
  S.active.pick[key] = v; save();
  document.querySelectorAll(`#sg-${key} button`).forEach(b => b.classList.toggle('on', b.dataset.v === v));
}
function setPick(k, v) { S.active.pick[k] = v; save(); render(); }
function addClimb() {
  const p = S.active.pick;
  S.active.climbs.push({ grade: `${p.color} ${p.level}`, style: p.style || 'bloc', result: p.result || 'flash', first: !!p.first });
  p.first = false;   // la casella torna a quedar desmarcada per a la via següent
  save(); render();
}
// ---------- Gym: segueix la rutina del pla ----------
// Mostra els exercicis que has posat al pla per avui, o els del proper dia que en tingui.
// Els exercicis d'escalada del pla surten a la sessió d'escalada; la resta, al gym.
const isClimbEx = name => PLAN_CATALOG['Escalada'].includes(name);
function gymRoutine() {
  const today = (new Date().getDay() + 6) % 7;
  for (let k = 0; k < 7; k++) {
    const d = (today + k) % 7, items = planDay(d).filter(n => !isClimbEx(n));
    if (items.length) return { day: d, isToday: k === 0, items: items.map(name => ({ name })) };
  }
  return null;
}
function climbToday() { return planDay((new Date().getDay() + 6) % 7).filter(isClimbEx); }
function viewGym(a) {
  const r = gymRoutine();
  if (!r) return `<div class="card"><h2>Gym</h2><button class="small" onclick="go('plan')">+ Afegir al pla</button></div>`;
  const done = a.gymDone || {}, load = a.gymLoad || {};
  return `<div class="card">
    <h2>${DAY_NAMES[r.day]}</h2>
    ${r.isToday ? '' : `<p><span class="tag warn">Proper dia</span></p>`}
    <ul class="list">${r.items.map((it, i) => `<li class="gymrow">
      <button class="check ${done[i] ? 'on' : ''}" aria-label="Fet" onclick="toggleGym(${i})">${done[i] ? '✓' : ''}</button>
      <span style="flex:1"><b>${exLabel(it.name)}</b></span>
      <input type="number" min="0" inputmode="decimal" placeholder="kg" style="width:72px" value="${load[i] || ''}" onchange="setGymLoad(${i},this.value)">
    </li>`).join('')}</ul>
    <p class="muted">${Object.values(done).filter(Boolean).length}/${r.items.length} fets</p>
  </div>`;
}
function syncGym() {
  const a = S.active, r = gymRoutine(); if (!r) return;
  a.exercises = r.items.map((it, i) => ({ name: it.name, load: +(a.gymLoad || {})[i] || 0, i }))
    .filter(e => (a.gymDone || {})[e.i]).map(({ i, ...e }) => e);
  save();
}
function toggleGym(i) {
  const a = S.active; a.gymDone = a.gymDone || {};
  a.gymDone[i] = !a.gymDone[i];
  syncGym(); render();
}
function setGymLoad(i, v) {
  const a = S.active; a.gymLoad = a.gymLoad || {};
  a.gymLoad[i] = +v || 0;
  syncGym();
}
function finishSession() {
  const a = S.active;
  S.sessions.unshift({
    id: a.id, date: a.date, type: a.type, warmup: a.warmup, climbs: a.climbs, exercises: a.exercises,
    duration: Math.max(1, Math.round((Date.now() - a.start) / 60000)),
    rpe: a.rpe || 5, fatigue: a.fatigue || 5
  });
  S.active = null; restEnd = 0; save(); go('home');
}
// Les confirmacions es fan dins la pàgina (confirm() no funciona a tots els navegadors)
let discardAsk = false;
function askDiscard(v) { discardAsk = v; render(); }
function cancelSession() { discardAsk = false; S.active = null; save(); go('home'); }

// ---------- Historial ----------
// Detall d'una sessió: es mostra en tocar el dia al calendari
function sessDetail(s) {
  const i = S.sessions.indexOf(s);
  return `<div class="sess">
    <div class="row" style="justify-content:space-between"><b>${TYPES[s.type] || s.type}</b>
      ${delSessAsk === i
        ? `<span class="row" style="flex:none"><button class="small" onclick="askDelSession(-1)">Cancel·lar</button><button class="small sure" style="background:var(--bad);color:#fff" onclick="delSession(${i})">Esborrar</button></span>`
        : `<button class="small danger" style="flex:none" onclick="askDelSession(${i})">Esborrar</button>`}</div>
    <p style="margin:6px 0"><span class="tag">${s.duration} min</span> <span class="tag">esforç ${s.rpe}</span> <span class="tag">fatiga ${s.fatigue}</span>${Array.isArray(s.warmup) ? ' <span class="tag ok">escalfament ✓</span>' : ''}${Object.entries(s.pain || {}).filter(([, v]) => v > 0).map(([k, v]) => ` <span class="tag ${v >= 5 ? 'bad' : 'warn'}">${k} ${v}</span>`).join('')}</p>
    ${s.garmin ? garminRow(s, i) : ''}
    ${(s.climbs || []).length ? `<p>${s.climbs.map(c => `<span class="tag ${c.result !== 'projecte' ? 'ok' : ''}">${dot(c.grade)}${c.grade}</span>`).join(' ')}</p>` : ''}
    ${(s.exercises || []).length ? `<p class="muted">${s.exercises.map(e => `${esc(e.name)}${e.sets ? ` ${e.sets}×${e.reps}` : ''}${e.load ? ` +${e.load}kg` : ''}`).join(' · ')}</p>` : ''}
    ${s.notes ? `<p class="muted">“${esc(s.notes)}”</p>` : ''}
  </div>`;
}
function viewHistory() { return calOpen ? viewDay(calOpen) : viewCalendar() + viewProgress(); }
// Pàgina del dia: resum de tot el que vas fer aquell dia; la fletxa torna al calendari
const dayLong = ds => { const d = new Date(ds + 'T00:00:00'); return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`; };
function viewDay(ds) {
  const ss = S.sessions.filter(s => s.date === ds), wd = (new Date(ds + 'T00:00:00').getDay() + 6) % 7;
  const climbs = ss.flatMap(s => s.climbs || []), ex = ss.flatMap(s => s.exercises || []);
  const mins = ss.reduce((a, s) => a + (s.duration || 0), 0);
  const rpe = ss.length ? Math.round(ss.reduce((a, s) => a + (s.rpe || 0), 0) / ss.length * 10) / 10 : 0;
  const best = climbs.length ? GRADES[Math.max(...climbs.map(c => gi(c.grade)))] : null;
  const flash = climbs.length ? Math.round(climbs.filter(c => c.result === 'flash').length / climbs.length * 100) : null;
  const byG = {}; climbs.forEach(c => { byG[c.grade] = (byG[c.grade] || 0) + 1; });
  const grades = Object.entries(byG).sort((a, b) => gi(b[0]) - gi(a[0]));
  const back = `<button class="dayback" aria-label="Tornar al calendari" onclick="calClose()"><svg viewBox="0 0 24 24"><path d="M15 5L8 12L15 19"/></svg></button>`;
  if (!ss.length) return `<div class="card">${back}<h2 class="dayh">${dayLong(ds)}</h2>
    <p class="muted" style="margin:4px 0 0">${planDay(wd).length ? 'Planificat: ' + esc(planDay(wd).join(' · ')) : 'Descans'}</p></div>`;
  return `<div class="card">${back}<h2 class="dayh">${dayLong(ds)}</h2>
    <div class="stats">
      <div class="stat"><b>${mins}</b><span>min</span></div>
      <div class="stat"><b>${climbs.length ? climbs.length : ex.length}</b><span>${climbs.length ? 'vies' : 'exercicis'}</span></div>
      <div class="stat"><b>${rpe}</b><span>esforç</span></div>
    </div>
    ${best ? `<p style="margin:12px 0 4px">Millor: ${dot(best)}<b>${best}</b>${flash === null ? '' : ` <span class="muted">· ${flash} % flash</span>`}</p>
    <p class="chips">${grades.map(([g, n]) => `<span class="tag">${dot(g)}${g} ×${n}</span>`).join(' ')}</p>` : ''}
    ${ex.length && climbs.length ? `<p class="muted" style="margin:6px 0 0">+ ${ex.length} exercicis</p>` : ''}
  </div>
  <div class="card">${ss.map(sessDetail).join('')}</div>`;
}

// ---------- Progrés: calendari, ratxa, compliment i progressió de graus ----------
const MONTHS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
let calMonth = null, calSel = null, calOpen = null;
const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
function calMove(k) {
  const d = new Date(calMonth.y, calMonth.m + k, 1);
  calMonth = { y: d.getFullYear(), m: d.getMonth() }; calSel = null; render();
}
function calPick(ds) { calOpen = ds; render(); document.scrollingElement.scrollTop = 0; }
function calClose() { calOpen = null; render(); }
// Setmanes naturals (dilluns a diumenge): k = 0 és l'actual, 1 l'anterior…
function weekInfo(k, dates) {
  const m = mondayOf(new Date()); m.setDate(m.getDate() - 7 * k);
  const days = [...Array(7)].map((_, i) => { const d = new Date(m); d.setDate(d.getDate() + i); return ymd(d); });
  return days.filter(d => dates.has(d)).length;
}
function streakStats() {
  const dates = new Set(S.sessions.map(s => s.date));
  const planned = DAY_NAMES.filter((_, i) => planDay(i).length).length;
  const thisWeek = weekInfo(0, dates);
  // Ratxa: setmanes seguides amb alguna sessió; si encara no has entrenat aquesta setmana, no es trenca
  let k = thisWeek ? 0 : 1, streak = 0;
  while (weekInfo(k, dates) > 0 && k < 520) { streak++; k++; }
  // Compliment de les últimes 4 setmanes completes: dies entrenats (màx. els planificats) / dies planificats
  let done = 0; for (let i = 1; i <= 4; i++) done += Math.min(weekInfo(i, dates), planned);
  return { planned, thisWeek, streak, adherence: planned ? Math.round(done / (planned * 4) * 100) : null };
}
function viewCalendar() {
  if (!calMonth) { const n = new Date(); calMonth = { y: n.getFullYear(), m: n.getMonth() }; }
  const { y, m } = calMonth, st = streakStats(), todayS = today();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7, nd = new Date(y, m + 1, 0).getDate();
  const bySes = {}; S.sessions.forEach(s => (bySes[s.date] = bySes[s.date] || []).push(s));
  const cells = [...Array(lead)].map(() => '<span></span>');
  for (let d = 1; d <= nd; d++) {
    const ds = `${y}-${pad2(m + 1)}-${pad2(d)}`, wd = (lead + d - 1) % 7;
    const cls = ['cal-day', bySes[ds] ? 'done' : planDay(wd).length ? 'plan' : '', ds === todayS ? 'today' : '', calSel === ds ? 'sel' : ''].join(' ');
    cells.push(`<button class="${cls}" onclick="calPick('${ds}')">${d}</button>`);
  }
  return `<div class="card">
    <div class="stats">
      <div class="stat"><b>${st.streak}</b><span>ratxa</span></div>
      <div class="stat"><b>${st.planned ? `${st.thisWeek}/${st.planned}` : '—'}</b><span>setmana</span></div>
      <div class="stat"><b>${st.adherence === null ? '—' : st.adherence + ' %'}</b><span>compliment</span></div>
    </div>
    <div class="cal-head"><button class="small" aria-label="Mes anterior" onclick="calMove(-1)">‹</button><b>${MONTHS[m]} ${y}</b><button class="small" aria-label="Mes següent" onclick="calMove(1)">›</button></div>
    <div class="cal">${['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(n => `<small>${n}</small>`).join('')}${cells.join('')}</div>
    <p class="muted cal-key"><span class="k done"></span> entrenat <span class="k plan"></span> planificat</p>
  </div>`;
}
// Progressió: millor via encadenada i % de flash, per setmanes (últimes 8)
function viewProgress() {
  const sends = S.sessions.flatMap(s => (s.climbs || []).filter(c => c.result !== 'projecte' && GRADES.includes(c.grade)).map(c => ({ ...c, date: s.date })));
  if (!sends.length) return `<div class="card"><h2>Progressió</h2><div class="empty">${eyeSvg()}Sense vies encara</div></div>`;
  // Tota la història: de la setmana de la primera via fins ara (mínim 2 setmanes)
  const W = Math.max(2, Math.max(...sends.map(c => Math.floor(daysAgo(c.date) / 7))) + 1), weeks = [...Array(W)].map((_, i) => {
    const cs = sends.filter(c => { const d = daysAgo(c.date); return d >= (W - 1 - i) * 7 && d < (W - i) * 7; });
    return { best: cs.length ? Math.max(...cs.map(c => gi(c.grade))) : null };
  });
  const pr = W > 40 ? 2.5 : W > 20 ? 3.5 : 5;
  const vals = weeks.map(w => w.best).filter(v => v !== null);
  const lo = Math.max(0, Math.min(...vals) - 1), hi = Math.min(GRADES.length - 1, Math.max(...vals) + 1), span = Math.max(2, hi - lo);
  const X = i => 14 + i * (272 / (W - 1)), Y = v => 22 + (1 - (v - lo) / span) * 74;
  const pts = weeks.map((w, i) => w.best === null ? null : [X(i), Y(w.best), w.best]).filter(Boolean);
  const best = GRADES[Math.max(...sends.map(c => gi(c.grade)))];
  return `<div class="card"><h2>Progressió</h2>
    <p class="muted" style="margin:0 0 6px">Millor: ${dot(best)}<b style="color:var(--text)">${best}</b></p>
    <svg viewBox="0 0 300 126" width="100%" role="img" aria-label="Millor via encadenada per setmana">
      <text x="2" y="${Y(hi) - 4}" class="axis">${GRADES[hi]}</text>
      <text x="2" y="${Y(lo) - 4}" class="axis">${GRADES[lo]}</text>
      <line x1="2" x2="298" y1="${Y(hi)}" y2="${Y(hi)}" class="grid"/><line x1="2" x2="298" y1="${Y(lo)}" y2="${Y(lo)}" class="grid"/>
      <polyline points="${pts.map(p => p[0] + ',' + p[1]).join(' ')}" fill="none" stroke="var(--accent-soft)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${pr}" fill="${COLORS[GRADES[p[2]].split(' ')[0]]}" stroke="var(--card)" stroke-width="${pr > 4 ? 2 : 1}"/>`).join('')}
      <line x1="${X(0)}" x2="${X(W - 1)}" y1="112" y2="112" stroke="var(--line)" stroke-width="1" stroke-dasharray="1.5 3"/>
      ${W <= 30 ? weeks.slice(0, -1).map((_, i) => `<circle cx="${X(i)}" cy="112" r="2.2" fill="var(--muted)"/>`).join('') : ''}
      <circle cx="${X(W - 1)}" cy="112" r="4" fill="var(--accent)"/>
    </svg>
  </div>`;
}
let delSessAsk = -1;
function askDelSession(i) { delSessAsk = i; render(); }
function delSession(i) { S.sessions.splice(i, 1); delSessAsk = -1; save(); render(); }

// ---------- Pla d'entrenament ----------
// Cicle de 4 setmanes: base → força → potència/resistència → descàrrega.
// Es força descàrrega si la càrrega aguda puja massa o hi ha dolor alt.
const DAY_SLOTS = { 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5] };
const DAY_NAMES = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

function buildPlan() {
  const p = S.profile, m = metrics();
  const week = Math.floor(Math.max(0, daysAgo(p.start)) / 7);
  let phase = ['base', 'forca', 'potencia', 'descarrega'][week % 4];
  let reason = '';
  if (m.pain >= 6) { phase = 'descarrega'; reason = `Dolor alt (${m.pain}/10) aquesta setmana: prioritza recuperar. Si persisteix, consulta un fisio.`; }
  else if (m.acwr > 1.5) { phase = 'descarrega'; reason = `Has pujat la càrrega massa ràpid (ràtio ${m.acwr.toFixed(2)}).`; }

  const g = gi(p.maxGrade);
  const proj = gradeAt(g + 1), hard = gradeAt(g), mid = gradeAt(g - 2), easy = gradeAt(g - 4);
  const bloc = p.goal !== 'via', via = p.goal !== 'bloc';
  const warm = `Escalfament 15 min: mobilitat + 4-6 vies/blocs fàcils (${easy})`;

  const T = {
    base: [
      ['Volum tècnic', [warm, bloc ? `4×4: 4 blocs de ${mid} seguits, 4 rondes, 4 min descans` : `ARC: 2×20 min escalant continu a ${easy}`, 'Exercicis de peus silenciosos', 'Antagonistes 15 min']],
      ['Resistència aeròbica', [warm, via ? `3-4 vies de ${mid} amb poc descans` : `Circuit de 8 blocs ${easy}-${mid}`, 'Core 3×10']],
    ],
    forca: [
      ['Força de dits + bloc dur', [warm, 'Suspensions màximes: 6×10 s, 3 min descans (regleta 20 mm, afegeix llast si cal)', `Bloc límit: 5-6 problemes de ${hard}-${proj}, 3-4 intents, 3 min descans`, 'Dominades 4×5 amb llast']],
      ['Projecte', [warm, `Projecte a ${proj}: treballa seccions, descansos llargs`, 'Antagonistes 15 min']],
    ],
    potencia: [
      ['Potència', [warm, bloc ? 'Campus: 5×3 moviments, 3 min descans (només si fa >1 any que entrenes)' : 'Suspensions repetidores 7s/3s ×6, 3 sèries', `Blocs dinàmics de ${hard}`, 'Core 3×12']],
      [via ? 'Resistència de força' : 'Rendiment', [warm, via ? `Intervals: 4×(via de ${mid} 2 cops seguits), 6 min descans` : `Intents a ${proj}`, 'Estiraments 10 min']],
    ],
    descarrega: [
      ['Escalada suau', [warm, `30-40 min escalada lliure a ${easy}-${mid}, sense apretar`, 'Mobilitat 15 min']],
      ['Recuperació activa', ['Caminar / bici suau 30 min', 'Antagonistes lleugers', 'Mobilitat d\'espatlles i dits']],
    ],
  };
  const slots = DAY_SLOTS[p.days] || DAY_SLOTS[3];
  let k = 0;
  const days = DAY_NAMES.map((name, i) => {
    if (!slots.includes(i)) return { name, rest: true, title: 'Descans', items: ['Descans o activitat suau. Dorm bé i hidrata\'t.'] };
    const [title, items] = T[phase][k++ % T[phase].length];
    return { name, rest: false, title, items };
  });
  return { phase, week: week + 1, reason, days };
}

// Pla manual: S.plan[dia] = llista d'exercicis triats per l'usuari (0 = dilluns … 6 = diumenge).
// Un apartat per cada grup muscular (de més a menys prioritat) + Escalada i Recuperació. Els exercicis són xips.
const PLAN_CATALOG = {
  'Escalada': ['Kilter board', 'Autos', 'Bloc límit', 'Resistència', 'Lliure', 'Volum fàcil', 'Tècnica de peus', '4×4'],
  'Dits i antebraços': ['Suspensions màximes al llistó', 'Dits 5×10', 'Campus', 'Wrist roller', 'Pinça amb disc', 'Curl de canell invers', 'Curl de canell',
    'Repeaters 7/3', 'Penjades a regleta 20 mm', 'Penjades a mà oberta', 'Massilla per als dits'],
  'Esquena': ['Dominades', 'Sèries de dominades', 'Dominades excèntriques', 'Dominades amb llast', 'Remada amb manuelles', 'Remada invertida', 'Lock-off a 90°'],
  'Braços': ['Curl de bíceps amb manuelles', 'Curl martell', 'Curl amb goma', 'Fons de tríceps al banc', 'Extensions de tríceps amb goma'],
  'Core': ['Abdominals', 'Planxa', 'Planxa lateral', 'Hollow body', 'Elevacions de cames penjat', 'Toes to bar'],
  'Cames i malucs': ['Esquats', 'Correr', 'Pistol squats', 'Zancades', 'Pont de glutis', 'Elevacions de bessons', 'Mobilitat de malucs', 'Passos alts a l\'esglaó'],
  'Espatlles i estabilitzadors': ['Rotació externa amb goma', 'Face pull amb goma', 'Flexions escapulars', 'Mobilitat d\'espatlles i dits', 'Rotació interna amb goma', 'Y-T-W amb manuelles', 'Push-up plus'],
  'Antagonistes': ['Flexions o fons', 'Press banca', 'Extensions de canell amb manuelles', 'Pronació i supinació amb martell', 'Obrir els dits contra una goma',
    'Press d\'espatlles amb manuelles', 'Flexions en pica'],
  'Recuperació': ['Estiraments 10 min', 'Foam roller 10 min', 'Estiraments d\'avantbraços', 'Mobilitat de canells', 'Passejar 30 min'],
};
// Imatges dels exercicis (silueta): nom del pla -> fitxer a exercicis/
const EXIMG = {
  'Kilter board': 'kilter-board.png',
  'Autos': 'autos.png',
  'Bloc límit': 'bloc-limit.png',
  'Resistència': 'resistencia.png',
  'Lliure': 'lliure.png',
  'Volum fàcil': 'volum-facil.png',
  'Tècnica de peus': 'tecnica-peus.png',
  '4×4': '4x4.png',
  'Suspensions màximes al llistó': 'suspensions-maximes.png',
  'Dits 5×10': 'dits-5x10.png',
  'Campus': 'campus.png',
  'Wrist roller': 'wrist-roller.png',
  'Pinça amb disc': 'pinca-disc.png',
  'Curl de canell invers': 'curl-canell-invers.png',
  'Curl de canell': 'curl-canell.png',
  'Repeaters 7/3': 'repeaters.png',
  'Penjades a regleta 20 mm': 'penjades-regleta-20.png',
  'Penjades a mà oberta': 'penjades-ma-oberta.png',
  'Massilla per als dits': 'massilla.png',
  'Dominades': 'dominades.png',
  'Sèries de dominades': 'series-dominades.png',
  'Dominades excèntriques': 'dominades-excentriques.png',
  'Dominades amb llast': 'dominades-llast.png',
  'Remada amb manuelles': 'remada-manuelles.png',
  'Remada invertida': 'remada-invertida.png',
  'Lock-off a 90°': 'lock-off.png',
  'Curl de bíceps amb manuelles': 'curl-biceps.png',
  'Curl martell': 'curl-martell.png',
  'Curl amb goma': 'curl-goma.png',
  'Fons de tríceps al banc': 'fons-triceps.png',
  'Extensions de tríceps amb goma': 'extensions-triceps-goma.png',
  'Abdominals': 'abdominals.png',
  'Planxa': 'planxa.png',
  'Planxa lateral': 'planxa-lateral.png',
  'Hollow body': 'hollow-body.png',
  'Elevacions de cames penjat': 'elevacions-cames.png',
  'Pistol squats': 'pistol-squats.png',
  'Face pull amb goma': 'face-pull-goma.png',
  'Press banca': 'press-banca.png',
  'Foam roller 10 min': 'foam-roller.png'
};
let planAdd = -1, planClearAsk = false;
const planDay = i => ((S.plan = S.plan || {})[i] = S.plan[i] || []);
function togglePlanAdd(i) { planAdd = planAdd === i ? -1 : i; render(); }
function addPlanItem(i, name) {
  name = (name || '').trim(); if (!name) return;
  const l = planDay(i), k = l.indexOf(name);
  if (k >= 0) l.splice(k, 1); else l.push(name);   // tocar-lo un altre cop el treu
  save(); render();
}
function addCatalog(i, g, k) { addPlanItem(i, PLAN_CATALOG[g][k]); }
function addCustom(i) { addPlanItem(i, $('plancustom').value); }
// Els exercicis del dia són xips: marcat = es manté. En tocar-lo es treu del pla però el xip es queda
// ratllat per poder tornar-lo a marcar (fins que canvies d'apartat).
let planOff = {};
function togglePlanChip(i, k) {
  const on = planDay(i), off = (planOff[i] = planOff[i] || []);
  if (k < on.length) off.push(on.splice(k, 1)[0]); else on.push(off.splice(k - on.length, 1)[0]);
  save(); render();
}
function askClearPlan(v) { planClearAsk = v; render(); }
function clearPlan() { S.plan = {}; planClearAsk = false; planAdd = -1; save(); render(); }

// ---------- Lesions: protocol de rehabilitació de politja ----------
// Mentre hi ha una lesió activa, el protocol surt a Pla i a Inici. Quan es completa l'última fase, la lesió
// s'esborra sola i es mostra un avís amb consells per no recaure. És orientatiu: no substitueix un fisioterapeuta.
const INJ_ZONES = ['A2', 'A3', 'A4'], INJ_FINGERS = ['Índex', 'Mig', 'Anular', 'Menut'], INJ_HANDS = ['dreta', 'esquerra'];
const REHAB = [
  { t: 'Calma', w: '1-2 setmanes',
    ex: ['Obrir i tancar la mà · 3×10, 3 cops al dia', 'Moure el dit: flexió i extensió · 3×10', 'Fred 10 min si hi ha inflor', 'Cardio i cames, sense agafar amb els dits'],
    avoid: ['Escalar', 'Penjar-se', 'Dominades', 'Agafar fort'],
    pass: ['Sense dolor en repòs', 'Sense inflor'] },
  { t: 'Mobilitat', w: '2-3 setmanes',
    ex: ['Massilla tova: flexió del dit · 3×12', 'Pilota tova: prémer 5 s · 10×', 'Canell i rotació externa amb goma · 3×12', 'Massatge suau · 2 min'],
    avoid: ['Escalar', 'Penjar-se', 'Crimp i pinça forta'],
    pass: ['Dolor ≤ 2/10 en prémer', 'Flexió completa sense dolor', 'Força gairebé igual que l\'altra mà'] },
  { t: 'Càrrega', w: '3-4 setmanes',
    ex: ['Massilla dura · 3×12', 'Penjades a mà oberta amb pes reduït · 5×10 s', 'Escalada fàcil, agafades grans, amb cinta · 20-30 min, 2×/setmana', 'Dominades amb agafades grans, sense crimp'],
    avoid: ['Full crimp', 'Blocs al límit', 'Campus', 'Regletes'],
    pass: ['30 min fàcils sense dolor (ni 24 h després)', 'Penjada de 10 s sense dolor'] },
  { t: 'Tornada', w: '3-4 setmanes',
    ex: ['Puja el nivell un 10% per setmana', 'Mitja crimp 20 mm: llast +5% per setmana', 'Escalfament complet cada sessió', 'Cinta en sessions de projecte'],
    avoid: ['Full crimp i límit fins a 2 setmanes sense dolor', 'Pujar la càrrega de cop'],
    pass: ['2 setmanes al teu nivell sense dolor', 'Mitja crimp sense dolor'] },
];
const REHAB_PREVENT = ['Escalfa sempre: dits, espatlles, colze', 'Càrrega: màxim +10% per setmana', '48 h entre sessions fortes de dits', 'Evita el full crimp amb dits freds o cansats', 'Primer dolor: para', 'Antagonistes 2-3×/setmana', 'Dorm bé'];
const phaseBar = n => `<div class="phases">${REHAB.map((_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;
const HARD_FINGER = ['Kilter board', 'Bloc límit', 'Campus', 'Suspensions màximes al llistó', 'Dits 5×10', 'Repeaters 7/3', 'Penjades a regleta 20 mm', '4×4'];
// Avantbraç sense càrrega de politja: no se senyala amb ⚠ encara que sigui del grup de dits
const FOREARM_OK = ['Wrist roller', 'Curl de canell invers', 'Curl de canell', 'Massilla per als dits'];
const injList = () => (S.injuries = S.injuries || []);
const injById = id => injList().find(j => j.id === id);
const injName = j => `${j.zone} · ${j.finger.toLowerCase()} ${j.hand}`;
// Exercicis del pla que poden carregar el dit lesionat (es marquen amb ⚠)
function injRisk(name) {
  return injList().some(j => j.phase <= 2 ? PLAN_CATALOG['Escalada'].concat(PLAN_CATALOG['Dits i antebraços'], PLAN_CATALOG['Esquena']).includes(name) && !FOREARM_OK.includes(name)
    : j.phase === 3 ? HARD_FINGER.includes(name) : false);
}
const exIcon = n => EXIMG[n] ? `<img class="exi" src="exercicis/${EXIMG[n]}" alt="" loading="lazy">` : '';
const exLabel = n => exIcon(n) + (injRisk(n) ? '⚠ ' : '') + esc(n);
function injChecks(j) { if (!j.checks || j.checks.date !== today()) j.checks = { date: today(), set: [] }; return j.checks.set; }
const injPain = j => (j.pain && j.pain.date === today() ? j.pain.v : null);
let injAdd = false, injAsk = '';
function toggleInjAdd() { injAdd = !injAdd; render(); }
function addInjury() {
  injList().push({ id: Date.now(), zone: $('injzone').value, finger: $('injfinger').value, hand: $('injhand').value, start: today(), phase: 1, phaseStart: today(), pain: null, checks: null });
  injAdd = false; S.injNotice = null; save(); render();
}
function askInj(v) { injAsk = v; render(); }
function injStep(id, d) {
  const j = injById(id); if (!j) return;
  injAsk = '';
  if (j.phase + d > REHAB.length) return finishInjury(id);
  j.phase = Math.max(1, j.phase + d); j.phaseStart = today(); j.checks = null; save(); render();
}
function finishInjury(id) {
  const j = injById(id); if (!j) return;
  S.injuries = injList().filter(x => x.id !== id);
  S.injNotice = { name: injName(j), date: today() };
  injAsk = ''; save(); render();
}
function delInjury(id) { S.injuries = injList().filter(x => x.id !== id); injAsk = ''; save(); render(); }
function dismissInjNotice() { S.injNotice = null; save(); render(); }
function setInjPain(id, v) { injById(id).pain = { date: today(), v }; save(); render(); }
function toggleInjEx(id, k) {
  const s = injChecks(injById(id)), i = s.indexOf(k);
  if (i >= 0) s.splice(i, 1); else s.push(k);
  save(); render();
}
// Targeta de rehabilitació a la pestanya Pla: exercicis d'avui, dolor i què evitar
function viewRehab() {
  return injList().map(j => {
    const ph = REHAB[j.phase - 1], done = injChecks(j), p = injPain(j);
    return `<div class="card rehab"><h2>Rehab · ${injName(j)}</h2>
    ${phaseBar(j.phase)}
    <p class="muted" style="margin:8px 0">Fase ${j.phase}/${REHAB.length} · ${ph.t}</p>
    <ul class="list">${ph.ex.map((e, k) => `<li class="gymrow"><button class="check ${done.includes(k) ? 'on' : ''}" aria-label="Fet" onclick="toggleInjEx(${j.id},${k})">${done.includes(k) ? '✓' : ''}</button><span style="flex:1">${e}</span></li>`).join('')}</ul>
    <label>Dolor avui (0-10)</label>
    <div class="scale" style="grid-template-columns:repeat(11,1fr);gap:3px">${[...Array(11)].map((_, v) => `<button style="font-size:13px" class="${p === v ? 'on' : ''}" onclick="setInjPain(${j.id},${v})">${v}</button>`).join('')}</div>
    ${p !== null && p >= 4 ? `<p><span class="tag bad">Dolor alt</span> <span class="muted">Avui sense càrrega al dit</span></p>` : ''}
    <p class="muted" style="margin:10px 0 4px">Evita ara</p><div class="chips">${ph.avoid.map(a => `<span class="tag bad">${a}</span>`).join('')}</div>
    <p class="muted" style="margin:10px 0 0">⚠ = carrega el dit</p></div>`;
  }).join('');
}
// Apartat Lesions del Perfil: afegir, veure la fase, passar de fase i acabar
function viewInjuries() {
  const l = injList(), n = S.injNotice;
  const sel = (id, arr, def) => `<select id="${id}">${arr.map(v => `<option ${v === def ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
  const form = `<div class="row"><div><label>Politja</label>${sel('injzone', INJ_ZONES, 'A4')}</div>
    <div><label>Dit</label>${sel('injfinger', INJ_FINGERS, 'Anular')}</div><div><label>Mà</label>${sel('injhand', INJ_HANDS, 'dreta')}</div></div>
    <p class="row"><button onclick="toggleInjAdd()">Cancel·lar</button><button class="primary" onclick="addInjury()">Començar</button></p>`;
  return `<div class="card"><h2>Lesions</h2>
    ${n ? `<div class="stat" style="text-align:left;margin-bottom:10px"><b style="font-size:16px">Rehab completada ✓</b>
      <p class="muted" style="margin:4px 0">${esc(n.name)} · per no recaure:</p>
      <ul style="margin:0 0 8px;padding-left:18px">${REHAB_PREVENT.map(t => `<li>${t}</li>`).join('')}</ul>
      <button class="small" onclick="dismissInjNotice()">Entesos</button></div>` : ''}
    ${l.map(j => {
      const ph = REHAB[j.phase - 1], last = j.phase === REHAB.length, days = Math.max(0, Math.floor(daysAgo(j.phaseStart)));
      return `<div class="stat" style="text-align:left;margin-bottom:10px"><b style="font-size:16px">${injName(j)}</b>
        ${phaseBar(j.phase)}
        <p class="muted" style="margin:6px 0">Fase ${j.phase}/${REHAB.length} · ${ph.t} · ${ph.w} · dia ${days + 1}</p>
        <p class="muted" style="margin:6px 0 2px">Per avançar:</p>
        <ul style="margin:0 0 8px;padding-left:18px">${ph.pass.map(t => `<li>${t}</li>`).join('')}</ul>
        ${injAsk === 'f' + j.id
          ? `<p>Recuperat? S'esborrarà del pla.</p><p class="row"><button onclick="askInj('')">Cancel·lar</button><button class="primary" onclick="injStep(${j.id},1)">Sí, acabar</button></p>`
          : injAsk === 'd' + j.id
            ? `<p>Esborrar lesió?</p><p class="row"><button onclick="askInj('')">Cancel·lar</button><button class="primary" style="background:var(--bad)" onclick="delInjury(${j.id})">Esborrar</button></p>`
            : `<p class="row">${j.phase > 1 ? `<button onclick="injStep(${j.id},-1)">← Anterior</button>` : ''}
              <button class="primary" onclick="${last ? `askInj('f${j.id}')` : `injStep(${j.id},1)`}">${last ? 'Finalitzar' : 'Següent →'}</button></p>
              <p style="margin:0"><button class="danger small" onclick="askInj('d${j.id}')">Esborrar lesió</button></p>`}
      </div>`;
    }).join('')}
    ${injAdd || !l.length ? (injAdd ? form : `<button class="primary" style="width:100%" onclick="toggleInjAdd()">+ Afegir lesió de politja</button>`)
      : `<button class="small" onclick="toggleInjAdd()">+ Altra lesió</button>`}
  </div>`;
}

// Punts febles: només una llista per apuntar-los, no afecta cap càlcul ni el pla.
const weaks = () => (S.weak = S.weak || []);
let weakAsk = -1;
function addWeak() {
  const t = $('weaktxt').value.trim(); if (!t) return $('weaktxt').focus();
  weaks().push({ date: today(), text: t.slice(0, 80) }); save(); render();
}
function askDelWeak(i) { weakAsk = i; render(); }
function delWeak(i) { weaks().splice(i, 1); weakAsk = -1; save(); render(); }
function viewWeak() {
  const l = weaks();
  return `<div class="card"><h2>Punts febles</h2>
    <p class="muted" style="margin:0 0 8px">Només un apunt: no afecta el pla</p>
    <div class="row"><input id="weaktxt" placeholder="Ex. peus en desploms" maxlength="80" onkeydown="if(event.key==='Enter')addWeak()"><button class="small" style="flex:none" onclick="addWeak()">Afegir</button></div>
    ${l.length ? `<ul class="list presets" style="margin-top:8px">${l.map((w, i) => `<li><span>${esc(w.text)}<br><span class="muted">${dmy(w.date)}</span></span>
      ${weakAsk === i
        ? `<span class="pre"><button class="small" onclick="askDelWeak(-1)">Cancel·lar</button><button class="small sure" onclick="delWeak(${i})">Esborrar</button></span>`
        : `<span class="pre"><button class="small danger" aria-label="Esborrar" onclick="askDelWeak(${i})">✕</button></span>`}</li>`).join('')}</ul>` : ''}
  </div>`;
}

function viewPlan() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  const empty = !DAY_NAMES.some((_, i) => planDay(i).length);
  const picker = i => `<div class="picker">
    ${Object.entries(PLAN_CATALOG).map(([g, list]) => `<p class="muted" style="margin:10px 0 4px">${g}</p>
      <div class="chips">${list.length ? list.map((x, k) => `<button class="chip ${planDay(i).includes(x) ? 'on' : ''}" onclick="addCatalog(${i},'${g}',${k})">${exIcon(x)}${esc(x)}</button>`).join('') : '<span class="muted">—</span>'}</div>`).join('')}
    <p class="muted" style="margin:10px 0 4px">Altre</p>
    <div class="row"><input id="plancustom" placeholder="Escriu…" maxlength="60" onkeydown="if(event.key==='Enter')addCustom(${i})"><button class="small" style="flex:none" onclick="addCustom(${i})">Afegir</button></div>
    <button class="primary" style="width:100%;margin-top:10px" onclick="togglePlanAdd(${i})">Fet</button></div>`;
  return `
  ${viewRehab()}
  ${DAY_NAMES.map((name, i) => {
    const list = planDay(i);
    return `<div class="card day ${list.length ? '' : 'rest'}" ${i === todayIdx ? 'style="border-color:var(--warn)"' : ''}>
    <span class="wd" lang="ja">${'月火水木金土日'[i]}</span><b>${name}${i === todayIdx ? ' (avui)' : ''}</b>${list.length ? '' : ' · <span class="muted">Descans</span>'}
    ${list.length || (planOff[i] || []).length ? `<div class="chips planchips">${[...list, ...(planOff[i] || [])].map((x, k) => `<button class="chip ${k < list.length ? 'on' : ''}" onclick="togglePlanChip(${i},${k})">${exLabel(x)}</button>`).join('')}</div>` : ''}
    ${planAdd === i ? picker(i) : `<button class="small" style="margin-top:8px" onclick="togglePlanAdd(${i})">+ Afegir</button>`}
  </div>`; }).join('')}
  ${empty ? '' : planClearAsk
    ? `<div class="card"><p>Esborrar tot el pla?</p><div class="row"><button onclick="askClearPlan(false)">Cancel·lar</button><button class="primary" style="background:var(--bad)" onclick="clearPlan()">Esborrar tot</button></div></div>`
    : `<p><button class="danger" onclick="askClearPlan(true)">Esborrar tot el pla</button></p>`}
  ${viewWeak()}`;
}// ---------- Perfil ----------
function viewProfile() {
  const p = S.profile;
  return `
  <div class="card">
    <label>Grau màxim</label><select id="pg">${opts(GRADES, p.maxGrade)}</select>
    <label>Objectiu</label><select id="po">${optsObj({ bloc: 'Bloc', via: 'Via', mix: 'Mixt' }, p.goal)}</select>
    <label>Dies per setmana</label><select id="pdays">${opts(['2', '3', '4', '5', '6'], String(p.days))}</select>
    <label>Inici del cicle</label><input id="pstart" type="date" value="${p.start}">
    <p><button class="primary" style="width:100%" onclick="saveProfile()">Desar</button></p>
  </div>
  ${viewInjuries()}
  ${viewGarmin()}
  ${viewFingers()}
  ${viewWeight()}
  ${viewRecovery()}
  ${viewRemind()}
  <div class="card">
    <h2>Dades</h2>
    <p class="muted">Es desa només al mòbil</p>
    <div class="row"><button onclick="exportData()">Exportar</button>
      <button onclick="$('imp').click()">Importar</button></div>
    <input id="imp" type="file" accept=".json" style="display:none" onchange="importData(this.files[0])">
  </div>`;
}
// ---------- Recordatoris ----------
// Notificació els dies que el pla té exercicis (només si l'app és oberta) i fitxer .ics per al calendari del mòbil.
const rem = () => (S.remind = Object.assign({ on: false, time: '18:00', last: '' }, S.remind));
const notifSupported = () => 'Notification' in window;
function setRemind(on) {
  rem().on = on; save();
  if (on && notifSupported() && Notification.permission === 'default') Notification.requestPermission().then(render);
  render();
}
function setRemindTime(v) { rem().time = v || '18:00'; rem().last = ''; save(); }
function notifyNow(title, body) {
  if (!notifSupported() || Notification.permission !== 'granted') return false;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, { body, icon: 'icon.svg', tag: 'escalada' }));
    else new Notification(title, { body, icon: 'icon.svg' });
    return true;
  } catch { return false; }
}
function testNotif() {
  const send = () => { notifyNow('Recordatori de prova', 'Així et sortirà l\'avís.'); render(); };
  if (notifSupported() && Notification.permission === 'default') Notification.requestPermission().then(send); else send();
}
function remindCheck() {
  const r = rem(); if (!r.on) return;
  const n = new Date(), items = planDay((n.getDay() + 6) % 7);
  if (!items.length || r.last === ymd(n) || S.active || S.sessions.some(s => s.date === ymd(n))) return;
  if (`${pad2(n.getHours())}:${pad2(n.getMinutes())}` < r.time) return;
  if (notifyNow('Avui toca entrenar', items.slice(0, 3).join(' · '))) { r.last = ymd(n); save(); }
}
function exportIcs() {
  const [hh, mm] = rem().time.split(':').map(Number), BY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const tx = s => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const mon = mondayOf(new Date()), L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Climb//CA', 'CALSCALE:GREGORIAN'];
  DAY_NAMES.forEach((_, i) => {
    const items = planDay(i); if (!items.length) return;
    const d = new Date(mon); d.setDate(d.getDate() + i);
    const start = ymd(d).replace(/-/g, '') + 'T' + pad2(hh) + pad2(mm) + '00';
    L.push('BEGIN:VEVENT', `UID:escalada-${BY[i]}@escalada.local`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, 'DURATION:PT1H30M',
      `RRULE:FREQ=WEEKLY;BYDAY=${BY[i]}`, `SUMMARY:${tx('Entrenament d\'escalada')}`, `DESCRIPTION:${tx(items.join('\n'))}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Entrenament', 'TRIGGER:PT0S', 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([L.join('\r\n')], { type: 'text/calendar' }));
  a.download = 'entrenaments.ics'; a.click();
}
function viewRemind() {
  const r = rem(), planned = DAY_NAMES.some((_, i) => planDay(i).length);
  const perm = !notifSupported() ? '<span class="tag bad">Sense suport</span>' : Notification.permission === 'granted' ? '<span class="tag ok">Permeses</span>'
    : Notification.permission === 'denied' ? '<span class="tag bad">Bloquejades</span>' : '<span class="tag warn">Cal permetre</span>';
  return `<div class="card"><h2>Recordatoris</h2>
    <div class="seg"><button class="${r.on ? '' : 'on'}" onclick="setRemind(false)">No</button><button class="${r.on ? 'on' : ''}" onclick="setRemind(true)">Sí</button></div>
    <label>Hora d'avís</label><input type="time" value="${r.time}" onchange="setRemindTime(this.value)">
    <p class="muted">${perm}</p>
    <div class="row"><button onclick="testNotif()">Provar</button>
      <button ${planned ? '' : 'disabled'} onclick="exportIcs()">Afegir al calendari</button></div>
  </div>`;
}
// Gràfica de línia per a registres {date, kg}, amb l'eix horitzontal proporcional a les dates (cal ≥ 2 registres)
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const dmy = d => d.split('-').reverse().join('/');
function trendChart(l, f, aria) {
  if (l.length < 2) return '';
  const t = l.map(r => new Date(r.date + 'T00:00:00').getTime()), t0 = t[0], span = (t[t.length - 1] - t0) || 1;
  const lo = Math.min(...l.map(r => r.kg)), hi = Math.max(...l.map(r => r.kg)), vr = (hi - lo) || 1;
  const X = i => 14 + (t[i] - t0) / span * 272, Y = v => 22 + (1 - (v - lo) / vr) * 74;
  return `<svg viewBox="0 0 300 126" width="100%" role="img" aria-label="${aria}">
    <text x="2" y="${Y(hi) - 6}" class="axis">${f(hi)} kg</text><text x="2" y="${Y(lo) - 6}" class="axis">${f(lo)} kg</text>
    <line x1="2" x2="298" y1="${Y(hi)}" y2="${Y(hi)}" class="grid"/><line x1="2" x2="298" y1="${Y(lo)}" y2="${Y(lo)}" class="grid"/>
    <polyline points="${l.map((r, i) => `${X(i)},${Y(r.kg)}`).join(' ')}" fill="none" stroke="var(--accent-soft)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${l.map((r, i) => `<circle cx="${X(i)}" cy="${Y(r.kg)}" r="4.5" fill="var(--accent-soft)" stroke="var(--card)" stroke-width="2"/>`).join('')}
    <text x="14" y="120" text-anchor="start" class="axis">${dmy(l[0].date)}</text>
    <text x="286" y="120" text-anchor="end" class="axis">${dmy(l[l.length - 1].date)}</text></svg>`;
}

// ---------- Pes corporal (un registre per dia) ----------
const wts = () => (S.weight = S.weight || []);
let wAsk = -1;
function addWeight() {
  const kg = parseFloat($('wkg').value.replace(',', '.'));
  if (isNaN(kg) || kg <= 0) return $('wkg').focus();
  const l = wts(), i = l.findIndex(r => r.date === today());
  if (i >= 0) l[i].kg = kg; else l.push({ date: today(), kg });
  l.sort(byDate); save(); render();
}
function askDelWeight(i) { wAsk = i; render(); }
function delWeight(i) { wts().splice(i, 1); wAsk = -1; save(); render(); }
function viewWeight() {
  const l = wts(), last = l[l.length - 1], diff = l.length > 1 ? Math.round((last.kg - l[0].kg) * 10) / 10 : null;
  const f1 = v => String(Math.round(v * 10) / 10);
  return `<div class="card"><h2>Pes corporal</h2>
    ${l.length ? `<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><b>${f1(last.kg)} kg</b><span>actual</span></div>
      <div class="stat"><b>${diff === null ? '—' : (diff > 0 ? '+' : '') + f1(diff) + ' kg'}</b><span>des de l'inici</span></div></div>` : ''}
    ${trendChart(l, f1, 'Pes corporal al llarg del temps')}
    <div class="row"><input id="wkg" type="number" inputmode="decimal" step="0.1" min="0" placeholder="kg" value="${last && last.date === today() ? last.kg : ''}" onkeydown="if(event.key==='Enter')addWeight()">
      <button class="primary" style="flex:none" onclick="addWeight()">Desar pes</button></div>
    ${l.length ? `<ul class="list presets" style="margin-top:8px">${l.map((r, i) => ({ r, i })).reverse().slice(0, 5).map(({ r, i }) => `<li><span><b>${f1(r.kg)} kg</b><br><span class="muted">${dmy(r.date)}</span></span>
      ${wAsk === i
        ? `<span class="pre"><button class="small" onclick="askDelWeight(-1)">Cancel·lar</button><button class="small sure" onclick="delWeight(${i})">Esborrar</button></span>`
        : `<span class="pre"><button class="small danger" aria-label="Esborrar" onclick="askDelWeight(${i})">✕</button></span>`}</li>`).join('')}</ul>` : ''}
  </div>`;
}

// ---------- Son i recuperació: dues puntuacions d'1 a 5 per dia (es desen en tocar) ----------
const recs = () => (S.rec = S.rec || []);
function setRec(k, v) {
  const l = recs();
  let r = l.find(x => x.date === today());
  if (!r) { r = { date: today() }; l.push(r); l.sort(byDate); }
  r[k] = r[k] === v ? undefined : v;   // tocar la mateixa nota un altre cop la treu
  if (r.sleep === undefined && r.feel === undefined) l.splice(l.indexOf(r), 1);
  save(); render();
}
function viewRecovery() {
  const l = recs(), td = l.find(r => r.date === today()) || {};
  const avg = k => { const v = l.filter(r => daysAgo(r.date) < 7 && r[k]).map(r => r[k]); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '—'; };
  const sc = (k, val) => `<div class="scale" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5].map(n => `<button class="${val === n ? 'on' : ''}" onclick="setRec('${k}',${n})">${n}</button>`).join('')}</div>`;
  const tag = v => `<span class="tag ${v >= 4 ? 'ok' : v === 3 ? 'warn' : 'bad'}">${v}</span>`;
  return `<div class="card"><h2>Son i recuperació</h2>
    <label>Son (1 pitjor · 5 millor)</label>${sc('sleep', td.sleep)}
    <label>Sensació</label>${sc('feel', td.feel)}
    <div class="stats" style="grid-template-columns:repeat(2,1fr);margin-top:10px"><div class="stat"><b>${avg('sleep')}</b><span>son · 7 dies</span></div>
      <div class="stat"><b>${avg('feel')}</b><span>sensació · 7 dies</span></div></div>
    ${l.length ? `<ul class="list" style="margin-top:8px">${l.slice().reverse().slice(0, 5).map(r => `<li><span class="muted">${dmy(r.date)}</span>
      <span>${r.sleep ? `son ${tag(r.sleep)}` : ''} ${r.feel ? `sensació ${tag(r.feel)}` : ''}</span></li>`).join('')}</ul>` : ''}
  </div>`;
}

// ---------- Importar activitats de Garmin (.fit, o el .zip de "Exportar original") ----------
// Llegeix el resum de la sessió (durada, pulsacions, calories) i les pulsacions durant l'activitat.
const FIT_EPOCH = 631065600;   // els FIT compten els segons des del 31/12/1989
const FIT_TYPES = { 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 8: 4, 10: 1, 11: 2, 12: 4, 13: 1 };
function fitRead(v, p, f, le) {
  const sz = FIT_TYPES[f.type];
  if (!sz || f.size < sz || p + sz > v.byteLength) return null;
  let x, bad;
  switch (f.type) {
    case 1: x = v.getInt8(p); bad = 0x7F; break;
    case 3: x = v.getInt16(p, le); bad = 0x7FFF; break;
    case 5: x = v.getInt32(p, le); bad = 0x7FFFFFFF; break;
    case 4: x = v.getUint16(p, le); bad = 0xFFFF; break;
    case 6: x = v.getUint32(p, le); bad = 0xFFFFFFFF; break;
    case 11: x = v.getUint16(p, le); bad = 0; break;
    case 12: x = v.getUint32(p, le); bad = 0; break;
    case 10: x = v.getUint8(p); bad = 0; break;
    case 8: return v.getFloat32(p, le);
    default: x = v.getUint8(p); bad = 0xFF;
  }
  return x === bad ? null : x;
}
function fitParse(buf) {
  const v = new DataView(buf);
  if (buf.byteLength < 14 || v.getUint32(8, true) !== 0x5449462E) throw new Error('No és un fitxer FIT');
  const hs = v.getUint8(0), end = Math.min(buf.byteLength - 2, hs + v.getUint32(4, true)), defs = {}, out = { sessions: [], hr: [] };
  let pos = hs;
  while (pos < end) {
    const h = v.getUint8(pos++);
    let def;
    if (h & 0x80) def = defs[(h >> 5) & 3];
    else if (h & 0x40) {
      const dev = h & 0x20; pos++;
      const le = v.getUint8(pos++) === 0, gnum = v.getUint16(pos, le), n = v.getUint8(pos + 2); pos += 3;
      const fields = [];
      for (let i = 0; i < n; i++, pos += 3) fields.push({ num: v.getUint8(pos), size: v.getUint8(pos + 1), type: v.getUint8(pos + 2) & 0x1F });
      let devSize = 0;
      if (dev) { const dn = v.getUint8(pos++); for (let i = 0; i < dn; i++, pos += 3) devSize += v.getUint8(pos + 1); }
      defs[h & 0x0F] = { le, gnum, fields, devSize };
      continue;
    } else def = defs[h & 0x0F];
    if (!def) break;
    const msg = {};
    for (const f of def.fields) { msg[f.num] = fitRead(v, pos, f, def.le); pos += f.size; }
    pos += def.devSize;
    if (def.gnum === 18) out.sessions.push(msg);
    else if (def.gnum === 20 && msg[3] != null && msg[253] != null) out.hr.push([msg[253], msg[3]]);
  }
  return out;
}
// Una sessió de l'app a partir d'una sessió del FIT. Esport 31 = escalada de roca, 28 = alpinisme.
function fitSessions(buf) {
  const { sessions, hr } = fitParse(buf);
  return sessions.map(s => {
    const t0 = s[2] != null ? s[2] : s[253]; if (t0 == null) return null;
    const secs = (s[7] != null ? s[7] : s[8] || 0) / 1000, mins = Math.max(1, Math.round(secs / 60));
    const pts = hr.filter(([t]) => t >= t0 && t <= t0 + secs), B = Math.min(60, pts.length), hrs = [];
    for (let i = 0; i < B; i++) { const sl = pts.slice(Math.floor(i * pts.length / B), Math.floor((i + 1) * pts.length / B)); hrs.push(Math.round(sl.reduce((a, p) => a + p[1], 0) / sl.length)); }
    return {
      id: Date.now() + Math.floor(Math.random() * 1e6), fitId: t0, date: ymd(new Date((t0 + FIT_EPOCH) * 1000)),
      type: s[5] === 31 || s[5] === 28 ? 'escalada' : 'gym', climbs: [], exercises: [], duration: mins, rpe: 5, fatigue: 5,
      garmin: { avg: s[16] || null, max: s[17] || null, kcal: s[11] || null, hrs }
    };
  }).filter(Boolean);
}
async function inflateRaw(data) {
  const r = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(r).arrayBuffer();
}
// Extreu els .fit d'un zip (només el que fa servir Garmin: mètode 0 o deflate, sense zip64)
async function unzipFit(buf) {
  const v = new DataView(buf), u8 = new Uint8Array(buf), out = [];
  let e = -1;
  for (let i = buf.byteLength - 22; i >= 0; i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('Zip no vàlid');
  const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true);
  for (let k = 0; k < n && v.getUint32(p, true) === 0x02014b50; k++) {
    const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
    if (!/\.fit$/i.test(name)) continue;
    const start = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true), data = u8.subarray(start, start + csize);
    out.push(method === 0 ? data.slice().buffer : await inflateRaw(data));
  }
  return out;
}
let impMsg = '';
async function importFit(files) {
  let added = 0, dup = 0, bad = 0;
  for (const f of files) {
    try {
      const buf = await f.arrayBuffer(), isZip = new Uint8Array(buf, 0, 2).join() === '80,75';
      for (const b of isZip ? await unzipFit(buf) : [buf])
        for (const s of fitSessions(b)) {
          if (S.sessions.some(x => x.fitId === s.fitId)) dup++;
          else { S.sessions.push(s); added++; }
        }
    } catch { bad++; }
  }
  S.sessions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  save();
  impMsg = `${added} ${added === 1 ? 'sessió importada' : 'sessions importades'}` + (dup ? ` · ${dup} ja hi eren` : '') + (bad ? ` · ${bad} ${bad === 1 ? 'fitxer no vàlid' : 'fitxers no vàlids'}` : '');
  render();
}
function setSessRpe(i, n) { S.sessions[i].rpe = n; save(); render(); }
function viewGarmin() {
  return `<div class="card"><h2>Garmin</h2>
    <p class="muted" style="margin:0 0 8px">Garmin Connect web → activitat → ⋯ → Exportar original → tria el .zip o .fit</p>
    <button class="primary" style="width:100%" onclick="$('fitfile').click()">Importar activitats</button>
    <input id="fitfile" type="file" accept=".fit,.zip" multiple style="display:none" onchange="importFit(this.files)">
    ${impMsg ? `<p class="imp">${impMsg}</p>` : ''}
  </div>`;
}
// Fila de dades de Garmin a l'historial: pulsacions, calories, gràfica i esforç editable
function garminRow(s, i) {
  const g = s.garmin, h = g.hrs || [];
  let spark = '';
  if (h.length > 1) {
    const lo = Math.min(...h), hi = Math.max(...h), vr = hi - lo || 1;
    spark = `<svg class="hrchart" viewBox="0 0 300 46" preserveAspectRatio="none" role="img" aria-label="Pulsacions durant la sessió"><polyline points="${h.map((x, k) => `${(k / (h.length - 1) * 300).toFixed(1)},${(42 - (x - lo) / vr * 38).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--accent-soft)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
  }
  return `<p style="margin:0"><span class="tag">Garmin</span> ${g.avg ? `<span class="tag warn">♥ ${g.avg}${g.max ? ` / ${g.max}` : ''}</span> ` : ''}${g.kcal ? `<span class="tag">${g.kcal} kcal</span>` : ''}</p>${spark}
    <label style="margin-top:8px">Esforç (1-10)</label><div class="scale">${[...Array(10)].map((_, k) => `<button class="${s.rpe === k + 1 ? 'on' : ''}" onclick="setSessRpe(${i},${k + 1})">${k + 1}</button>`).join('')}</div>`;
}

// ---------- Força de dits: test de suspensió màxima (llast afegit, kg) ----------
const fing = () => (S.fingers = S.fingers || []);
let fingAsk = -1;
function addFinger() {
  const kg = parseFloat($('fkg').value.replace(',', '.')), mm = parseInt($('fmm').value) || 20;
  if (isNaN(kg)) return $('fkg').focus();
  fing().push({ date: today(), kg, mm });
  fing().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  save(); render();
}
function askDelFinger(i) { fingAsk = i; render(); }
function delFinger(i) { fing().splice(i, 1); fingAsk = -1; save(); render(); }
function viewFingers() {
  const l = fing(), last = l[l.length - 1], best = l.length ? Math.max(...l.map(r => r.kg)) : null;
  const sgn = v => (v > 0 ? '+' : '') + v;
  const chart = trendChart(l, sgn, 'Llast de la suspensió màxima al llarg del temps');
  return `<div class="card"><h2>Força de dits</h2>
    <p class="muted" style="margin:0 0 6px">Penjada màxima 10 s · llast en kg (− si t'ajudes)</p>
    ${l.length ? `<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><b>${sgn(last.kg)} kg</b><span>últim</span></div><div class="stat"><b>${sgn(best)} kg</b><span>millor</span></div></div>` : ''}
    ${chart}
    <div class="row"><div><label>Llast (kg)</label><input id="fkg" type="number" inputmode="decimal" step="0.5" placeholder="0"></div>
      <div><label>Vora (mm)</label><input id="fmm" type="number" inputmode="numeric" min="1" value="${last ? last.mm : 20}"></div></div>
    <p><button class="primary" style="width:100%" onclick="addFinger()">Desar test</button></p>
    ${l.length ? `<ul class="list presets">${l.map((r, i) => ({ r, i })).reverse().slice(0, 6).map(({ r, i }) => `<li><span><b>${sgn(r.kg)} kg</b> · ${r.mm} mm<br><span class="muted">${r.date.split('-').reverse().join('/')}</span></span>
      ${fingAsk === i
        ? `<span class="pre"><button class="small" onclick="askDelFinger(-1)">Cancel·lar</button><button class="small sure" onclick="delFinger(${i})">Esborrar</button></span>`
        : `<span class="pre"><button class="small danger" aria-label="Esborrar" onclick="askDelFinger(${i})">✕</button></span>`}</li>`).join('')}</ul>` : ''}
  </div>`;
}
function saveProfile() {
  S.profile = { maxGrade: $('pg').value, goal: $('po').value, days: +$('pdays').value, start: $('pstart').value || today() };
  save(); alert('Perfil desat'); go('plan');
}
function exportData() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
  a.download = `escalada-${today()}.json`; a.click();
}
function importData(f) {
  if (!f) return;
  f.text().then(t => { S = Object.assign(blank(), JSON.parse(t)); save(); alert('Dades importades'); go('home'); })
    .catch(() => alert('Fitxer no vàlid'));
}

// Actualització automàtica: busca una versió nova en obrir l'app, en tornar-hi i cada 30 min; quan n'hi ha, recarrega
// sola (però mai enmig d'una sessió o de l'escalfament: espera que acabis)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = !!navigator.serviceWorker.controller;
  let updatePending = false;
  const idle = () => !S.active && !picking && !wz;
  const tryReload = () => { if (updatePending && idle()) location.reload(); };
  navigator.serviceWorker.register('sw.js').then(reg => {
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { check(); tryReload(); } });
    setInterval(() => { check(); tryReload(); }, 30 * 60 * 1000);
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) { updatePending = true; tryReload(); } });
  setInterval(tryReload, 60 * 1000);
}
go(S.active ? 'session' : 'home');
setInterval(remindCheck, 30000); remindCheck();
