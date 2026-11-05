/*
 * Bolão dos Patos — Firebase simulado para o modo demonstração.
 *
 * Imita as funções do Firebase que o app usa (login com Google e Firestore),
 * com um banco em memória preenchido com participantes, jogos e palpites
 * FICTÍCIOS. Nada aqui é dado real e nada sai do navegador: o que você grava
 * na demonstração fica só no localStorage deste navegador.
 */

/* ---------- dados fictícios ---------- */
let seed = 20260;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const gols = () => { const r = rnd(); return r < 0.28 ? 0 : r < 0.62 ? 1 : r < 0.85 ? 2 : r < 0.96 ? 3 : 4; };
const placar = () => gols() + "x" + gols();

const TIMES = ["Flamengo", "Palmeiras", "Cruzeiro", "Botafogo", "Fluminense", "São Paulo", "Grêmio", "Inter",
  "Bahia", "Corinthians", "Atlético-MG", "Vasco", "Santos", "Bragantino", "Fortaleza", "Juventude",
  "Vitória", "Sport", "Ceará", "Mirassol"];
const ESTADIOS = { "Grêmio": "Arena do Grêmio", "Inter": "Beira-Rio", "Flamengo": "Maracanã", "Fluminense": "Maracanã",
  "Palmeiras": "Allianz Parque", "Corinthians": "Neo Química Arena", "São Paulo": "MorumBIS", "Cruzeiro": "Mineirão",
  "Atlético-MG": "Arena MRV", "Botafogo": "Nilton Santos", "Vasco": "São Januário", "Santos": "Vila Belmiro",
  "Bahia": "Fonte Nova", "Juventude": "Alfredo Jaconi", "Mirassol": "Maião" };
const PARTICIPANTES = [
  { slug: "ana", nome: "Ana", desde: 1 }, { slug: "bruno", nome: "Bruno", desde: 1 },
  { slug: "cintia", nome: "Cíntia", desde: 1 }, { slug: "diego", nome: "Diego", desde: 1 },
  { slug: "elisa", nome: "Elisa", desde: 1 }, { slug: "fabio", nome: "Fábio", desde: 1 },
  { slug: "gabi", nome: "Gabi", desde: 30 }, { slug: "heitor", nome: "Heitor", desde: 30 },
  { slug: "teste", nome: "Teste", desde: 30, teste: true },
];
const EU = "ana", MEU_UID = "demo-ana";
const RODADA_ATUAL = 31, ULTIMA_DA_PLANILHA = 28;
const CODIGO_RES = "RES-DEMO123";

function base(bet, res) { // mesma pontuação do app
  const p = (s) => { const m = /^(\d+)x(\d+)$/.exec(s || ""); return m ? [+m[1], +m[2]] : null; };
  const g = p(bet), r = p(res); if (!g || !r) return 0;
  if (g[0] === r[0] && g[1] === r[1]) return 9;
  const sg = Math.sign(g[0] - g[1]), sr = Math.sign(r[0] - r[1]); if (sg !== sr) return 0;
  if (sr === 0) return 5; if (Math.max(...g) === Math.max(...r)) return 6;
  if (Math.min(...g) === Math.min(...r)) return 5; if (g[0] - g[1] === r[0] - r[1]) return 4; return 3;
}
function tabela() { // turno e returno pelo método do círculo
  const t = TIMES.slice(), n = t.length, rod = [];
  for (let r = 0; r < n - 1; r++) {
    const js = []; for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; js.push(r % 2 ? [b, a] : [a, b]); }
    rod.push(js); t.splice(1, 0, t.pop());
  }
  return rod.concat(rod.map((js) => js.map(([a, b]) => [b, a])));
}
const hoje = new Date(); const base0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
function quando(n, i) { // a 31ª rodada está sempre em andamento
  const d = new Date(base0.getTime() + (n - RODADA_ATUAL) * 7 * 864e5);
  d.setDate(d.getDate() + (i % 5) - 2); d.setHours([16, 18, 19, 21, 16][i % 5], i % 2 ? 30 : 0, 0, 0); return d;
}
const iso = (d) => { const o = -d.getTimezoneOffset(), a = Math.abs(o);
  return new Date(d.getTime() + o * 6e4).toISOString().slice(0, 19) + (o >= 0 ? "+" : "-") +
    String(Math.floor(a / 60)).padStart(2, "0") + ":" + String(a % 60).padStart(2, "0"); };
const nn = (n) => "r" + String(n).padStart(2, "0");

function montar() {
  const st = {}; const put = (p, d) => { st[p] = JSON.parse(JSON.stringify(d)); };
  const agora = Date.now();
  put("config/geral", {
    participantes: PARTICIPANTES, faseBetaDesde: 30,
    gremistas: ["ana", "bruno", "diego", "fabio"], gremistasFuturos: ["gabi"], colorados: ["cintia", "elisa", "heitor"],
    rivalidadeFuturosDesde: hoje.getFullYear() + 1,
  });
  const acum = {};
  tabela().forEach((js, k) => {
    const n = k + 1, id = nn(n), peso = Math.round((n - 1) * 5) / 100;
    const jogos = js.map(([m, v], i) => {
      const q = quando(n, i), fim = q.getTime() + 2 * 3600e3 < agora;
      return { m, v, quando: iso(q), local: ESTADIOS[m] || "", res: fim ? placar() : "" };
    });
    if (n === 30) { // um jogo adiado e remarcado para depois de amanhã
      const q = new Date(base0.getTime() + 2 * 864e5); q.setHours(20, 0, 0, 0);
      Object.assign(jogos[9], { res: "Adiado", remarcado: true, quando: iso(q) });
    }
    put("rodadas/" + id, { n, peso, jogos });
    const ativos = PARTICIPANTES.filter((p) => n >= p.desde);
    const palpite = (j) => (rnd() < 0.05 ? "" : rnd() < 0.25 && /x/.test(j.res) ? j.res : placar());
    if (n <= ULTIMA_DA_PLANILHA) { // rodadas antigas: vieram da planilha (histórico fechado)
      const H = { n, palpites: {}, pts: {}, dobro: {}, tot: {}, acum: {}, pg: {}, pb: {} };
      ativos.forEach((p) => {
        const pal = jogos.map(palpite), dob = Math.floor(rnd() * 10);
        const pts = jogos.map((j, i) => (pal[i] ? base(pal[i], j.res) * (dob === i ? 2 : 1) : 0));
        const raw = pts.reduce((a, b) => a + b, 0), tot = Math.floor(raw * (1 + peso) + 1e-9);
        acum[p.slug] = (acum[p.slug] || 0) + tot;
        H.palpites[p.slug] = pal.map((x) => x || "PATO"); H.pts[p.slug] = pts;
        H.dobro[p.slug] = dob; H.tot[p.slug] = tot; H.acum[p.slug] = acum[p.slug]; H.pg[p.slug] = raw;
      });
      const ord = Object.values(H.acum).sort((a, b) => b - a); for (const s in H.acum) H.pb[s] = ord.indexOf(H.acum[s]) + 1;
      put("historico/" + id, H);
      return;
    }
    // rodadas no app: cada palpite é um documento próprio, lido só depois do início do jogo
    const comecou = jogos.some((j) => new Date(j.quando).getTime() <= agora);
    jogos.forEach((j, i) => {
      const gid = id + "-g" + i, ini = new Date(j.quando).getTime();
      put("jogos/" + gid, { n, i, inicio: j.quando });
      if (ini > agora) return;
      ativos.forEach((p) => {
        const pal = palpite(j);
        put(`apostas/${gid}/p/${p.slug}`, { palpite: pal, em: j.quando });
        if (p.slug === EU) put(`meus/${MEU_UID}/p/${gid}`, { palpite: pal });
      });
    });
    if (comecou) ativos.forEach((p) => {
      const jg = Math.floor(rnd() * 10);
      put(`dobros/${id}/p/${p.slug}`, { jogo: jg });
      if (p.slug === EU) put(`meus/${MEU_UID}/p/${id}-dobro`, { dobro: jg });
    });
  });
  const tokens = {}; PARTICIPANTES.forEach((p, i) => { tokens[p.slug] = p.slug + "-demo" + String(100000000 + i * 7919).slice(1); });
  put("privado/links", { tokens, codigoResultados: CODIGO_RES });
  put("codigosResultado/" + CODIGO_RES, { em: iso(hoje) });
  put("admins/" + MEU_UID, { em: iso(hoje) });
  PARTICIPANTES.forEach((p, i) => { if (i < 6 || p.slug === "gabi")
    put("vinculos/" + p.slug, { uid: p.slug === EU ? MEU_UID : "demo-" + p.slug, email: p.slug + "@exemplo.com", em: iso(hoje) }); });
  return st;
}

const store = montar();
const SALVOS = "bp_demo_firestore";
try { Object.assign(store, JSON.parse(localStorage.getItem(SALVOS) || "{}")); } catch (e) {}
const meus = () => { try { return JSON.parse(localStorage.getItem(SALVOS) || "{}"); } catch (e) { return {}; } };
function guardar(path, data) { // só o que você grava na demonstração vai para o localStorage
  try { const m = meus(); if (data === undefined) delete m[path]; else m[path] = data; localStorage.setItem(SALVOS, JSON.stringify(m)); } catch (e) {}
}

/* ---------- Firestore simulado ---------- */
const subs = new Set();
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
const docSnap = (path) => ({ id: path.split("/").pop(), ref: { path, kind: "doc" }, exists: () => path in store, data: () => clone(store[path]) });
function colSnap(path, filtros = []) {
  const docs = Object.keys(store).filter((k) => k.startsWith(path + "/") && !k.slice(path.length + 1).includes("/")).sort()
    .map(docSnap).filter((d) => filtros.every(([f, op, v]) => op === "==" && (d.data() || {})[f] === v));
  return { docs, empty: !docs.length, size: docs.length, forEach: (cb) => docs.forEach(cb) };
}
const avisar = () => subs.forEach((s) => setTimeout(() => { try { s.cb(s.ref.kind === "doc" ? docSnap(s.ref.path) : colSnap(s.ref.path, s.ref.filtros)); } catch (e) {} }, 0));
const negar = () => Object.assign(new Error("Sem permissão"), { code: "permission-denied" });
function checar(path, data) { // as regras que o servidor real garante e que importam na demonstração
  const [c, id] = path.split("/");
  if (c === "papeis" && !(("codigosResultado/" + (data && data.codigo)) in store)) throw negar();
  if (c === "vinculos" && store[path] && store[path].uid !== (auth.currentUser || {}).uid) throw negar();
  if (c === "apostas" || c === "dobros") {
    const jogo = c === "apostas" ? store["jogos/" + id] : null;
    if (jogo && Date.now() >= new Date(jogo.inicio).getTime()) throw negar();
  }
}
function gravar(path, data, merge) {
  checar(path, data);
  store[path] = merge ? { ...(store[path] || {}), ...clone(data) } : clone(data);
  guardar(path, store[path]);
}

export const getFirestore = () => ({ demo: true });
export const doc = (_db, ...seg) => ({ path: seg.join("/"), kind: "doc" });
export const collection = (_db, ...seg) => ({ path: seg.join("/"), kind: "col", filtros: [] });
export const where = (campo, op, valor) => [campo, op, valor];
export const query = (col, ...filtros) => ({ ...col, filtros: [...(col.filtros || []), ...filtros] });
export const getDoc = async (ref) => docSnap(ref.path);
export const getDocs = async (ref) => colSnap(ref.path, ref.filtros);
export async function setDoc(ref, data) { gravar(ref.path, data); avisar(); }
export async function updateDoc(ref, data) { gravar(ref.path, data, true); avisar(); }
export async function deleteDoc(ref) { delete store[ref.path]; guardar(ref.path, undefined); avisar(); }
export function writeBatch() {
  const ops = [];
  return { set(ref, data) { ops.push([ref.path, data]); return this; },
    async commit() { ops.forEach(([p, d]) => checar(p, d)); ops.forEach(([p, d]) => gravar(p, d)); avisar(); } };
}
export function onSnapshot(ref, cb) {
  const s = { ref, cb }; subs.add(s);
  setTimeout(() => cb(ref.kind === "doc" ? docSnap(ref.path) : colSnap(ref.path, ref.filtros)), 0);
  return () => subs.delete(s);
}
export const serverTimestamp = () => new Date().toISOString();
export const Timestamp = { fromDate: (d) => d.toISOString() };

/* ---------- login simulado ---------- */
export const initializeApp = () => ({ demo: true });
const LOGIN = "bp_demo_login";
const auth = { currentUser: null, ouvintes: new Set() };
try { if (localStorage.getItem(LOGIN)) auth.currentUser = { uid: MEU_UID, email: "ana@exemplo.com", displayName: "Ana" }; } catch (e) {}
const mudouLogin = () => auth.ouvintes.forEach((cb) => setTimeout(() => cb(auth.currentUser), 0));
export const getAuth = () => auth;
export class GoogleAuthProvider { setCustomParameters() {} }
export async function signInWithPopup() {
  auth.currentUser = { uid: MEU_UID, email: "ana@exemplo.com", displayName: "Ana" };
  try { localStorage.setItem(LOGIN, "1"); } catch (e) {}
  mudouLogin(); return { user: auth.currentUser };
}
export const signInWithRedirect = signInWithPopup;
export async function signOut() { auth.currentUser = null; try { localStorage.removeItem(LOGIN); } catch (e) {} mudouLogin(); }
export function onAuthStateChanged(_a, cb) { auth.ouvintes.add(cb); setTimeout(() => cb(auth.currentUser), 0); return () => auth.ouvintes.delete(cb); }

/* ---------- aviso na tela ---------- */
const aviso = () => {
  const el = document.createElement("div"); el.setAttribute("role", "note");
  el.style.cssText = "background:#FBEBCB;color:#7A4B00;font:600 13px/1.4 system-ui,sans-serif;padding:8px 16px;text-align:center";
  el.innerHTML = `Modo demonstração: participantes, palpites e placares são fictícios. “Entrar com Google” entra como <b>Ana</b>. Código de resultados: <b>${CODIGO_RES}</b>. <a href="#" style="color:inherit">Recomeçar</a>`;
  el.querySelector("a").onclick = (e) => { e.preventDefault(); try { localStorage.removeItem(SALVOS); localStorage.removeItem(LOGIN); } catch (_) {} location.reload(); };
  document.body.prepend(el);
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aviso); else aviso();
