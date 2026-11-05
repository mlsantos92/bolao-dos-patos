/*
 * Bolão dos Patos — modo demonstração
 *
 * O app original roda como página publicada no Claude (claude.ai), que entrega
 * um banco de dados compartilhado (claude.use("db")) e a conta de quem abre
 * (claude.use("user")). Fora do Claude esses recursos não existem, então este
 * arquivo cria um banco em memória com participantes, jogos e palpites
 * FICTÍCIOS, só para mostrar como o app funciona.
 *
 * Nada aqui é dado real. Recarregar a página gera tudo de novo (os seus
 * palpites de teste ficam salvos só neste navegador).
 */
(function () {
  "use strict";
  if (window.claude && window.claude.use) return; // dentro do Claude: usa o banco de verdade

  /* ---------- gerador pseudoaleatório (sempre os mesmos dados) ---------- */
  let seed = 20260;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const gols = () => { const r = rnd(); return r < 0.28 ? 0 : r < 0.62 ? 1 : r < 0.85 ? 2 : r < 0.96 ? 3 : 4; };
  const sha = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))]
    .map((x) => x.toString(16).padStart(2, "0")).join("");

  /* ---------- dados fictícios ---------- */
  const TIMES = ["Flamengo", "Palmeiras", "Cruzeiro", "Botafogo", "Fluminense", "São Paulo", "Grêmio", "Internacional",
    "Bahia", "Corinthians", "Atlético-MG", "Vasco", "Santos", "Bragantino", "Fortaleza", "Juventude",
    "Vitória", "Sport", "Ceará", "Mirassol"];
  const ESTADIOS = { "Grêmio": "Arena do Grêmio", "Internacional": "Beira-Rio", "Flamengo": "Maracanã", "Fluminense": "Maracanã",
    "Palmeiras": "Allianz Parque", "Corinthians": "Neo Química Arena", "São Paulo": "MorumBIS", "Cruzeiro": "Mineirão",
    "Atlético-MG": "Arena MRV", "Botafogo": "Nilton Santos", "Vasco": "São Januário", "Santos": "Vila Belmiro",
    "Bahia": "Fonte Nova", "Juventude": "Alfredo Jaconi" };
  const PARTICIPANTES = [
    { slug: "ana", nome: "Ana", desde: 1 },
    { slug: "bruno", nome: "Bruno", desde: 1 },
    { slug: "cintia", nome: "Cíntia", desde: 1 },
    { slug: "diego", nome: "Diego", desde: 1 },
    { slug: "elisa", nome: "Elisa", desde: 1 },
    { slug: "fabio", nome: "Fábio", desde: 1 },
    { slug: "gabi", nome: "Gabi", desde: 30 },
    { slug: "heitor", nome: "Heitor", desde: 30 },
  ];
  const EU = "ana"; // quem abre a demonstração "é" a Ana
  const TOKEN = "demo-ana-0000000001";
  const RODADA_ATUAL = 31;

  /* tabela de turno e returno (método do círculo) */
  function tabela() {
    const t = TIMES.slice(), n = t.length, rod = [];
    for (let r = 0; r < n - 1; r++) {
      const jogos = [];
      for (let i = 0; i < n / 2; i++) {
        const a = t[i], b = t[n - 1 - i];
        jogos.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
      rod.push(jogos);
      t.splice(1, 0, t.pop());
    }
    return rod.concat(rod.map((js) => js.map(([a, b]) => [b, a])));
  }

  /* datas relativas a hoje: a 31ª rodada está em andamento */
  const hoje = new Date();
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  function quando(n, i) {
    const d = new Date(base.getTime() + (n - RODADA_ATUAL) * 7 * 864e5);
    // jogos de -2 a +2 dias em volta do "domingo" da rodada, em horários variados
    d.setDate(d.getDate() + (i % 5) - 2);
    d.setHours([16, 18, 19, 21, 16][i % 5], i % 2 ? 30 : 0, 0, 0);
    return d;
  }
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 19) +
    (() => { const o = -d.getTimezoneOffset(), s = o >= 0 ? "+" : "-", a = Math.abs(o); return s + String(Math.floor(a / 60)).padStart(2, "0") + ":" + String(a % 60).padStart(2, "0"); })();

  async function montar() {
    const store = {};
    const put = (p, d) => { store[p] = JSON.parse(JSON.stringify(d)); };
    const gremistas = ["bruno", "diego", "fabio"], colorados = ["cintia", "elisa"];
    put("config/geral", {
      participantes: PARTICIPANTES, faseBetaDesde: 30,
      gremistas: gremistas.concat(["ana"]), gremistasFuturos: ["gabi"], colorados: colorados.concat(["heitor"]),
      rivalidadeFuturosDesde: hoje.getFullYear() + 1,
      hashes: { [EU]: await sha(TOKEN) },
      resHash: await sha("demo123"),
    });
    const agora = Date.now();
    tabela().forEach((js, k) => {
      const n = k + 1, nn = "r" + String(n).padStart(2, "0");
      const jogos = js.map(([m, v], i) => {
        const q = quando(n, i);
        const terminou = q.getTime() + 2 * 3600e3 < agora;
        return { m, v, quando: iso(q), local: ESTADIOS[m] || "", res: terminou ? gols() + "x" + gols() : "" };
      });
      put("rodadas/" + nn, { n, peso: Math.round((n - 1) * 5) / 100, jogos });
      // palpites dos outros participantes nos jogos que já começaram
      jogos.forEach((j, i) => {
        if (new Date(j.quando).getTime() > agora) return;
        const pal = {};
        PARTICIPANTES.forEach((p) => {
          if (p.slug === EU || n < p.desde) return;
          pal[p.slug] = rnd() < 0.06 ? "" : (rnd() < 0.3 && j.res ? j.res : gols() + "x" + gols()); // às vezes "pato"
        });
        put("revelados/" + nn + "-g" + i, { palpites: pal });
      });
      const comecou = jogos.some((j) => new Date(j.quando).getTime() <= agora);
      if (comecou) {
        const dob = {};
        PARTICIPANTES.forEach((p) => { if (p.slug !== EU && n >= p.desde) dob[p.slug] = Math.floor(rnd() * jogos.length); });
        put("revelados/" + nn + "-dobro", { dobro: dob });
      }
      // seus próprios palpites nas rodadas passadas (a "Ana")
      if (n <= RODADA_ATUAL) {
        jogos.forEach((j, i) => new Date(j.quando).getTime() <= agora && put("palpites/demo-ana/r/" + nn + "-g" + i,
          { slug: EU, rodada: n, jogo: i, palpite: rnd() < 0.3 && j.res ? j.res : gols() + "x" + gols() }));
        put("palpites/demo-ana/r/" + nn + "-dobro", { slug: EU, rodada: n, dobro: Math.floor(rnd() * jogos.length) });
      }
    });
    put("data/users/demo-ana/links", { tokens: { [EU]: TOKEN } });
    put("data/users/demo-ana/segredos", { codigoResultados: "demo123" });
    // palpites salvos por você nesta demonstração
    try { Object.assign(store, JSON.parse(localStorage.getItem("bp_demo_store") || "{}")); } catch (e) {}
    return store;
  }

  /* ---------- banco em memória com a mesma interface do Claude ---------- */
  function criarDb(store) {
    const subs = [];
    const snapDoc = (p) => ({ id: p.split("/").pop(), exists: p in store, data: () => JSON.parse(JSON.stringify(store[p] || null)) });
    const snapCol = (p) => {
      const docs = Object.keys(store).filter((k) => k.startsWith(p + "/") && !k.slice(p.length + 1).includes("/"))
        .sort().map((k) => snapDoc(k));
      return { docs, empty: !docs.length };
    };
    const notify = () => subs.forEach((s) => setTimeout(() => s.cb(s.col ? snapCol(s.p) : snapDoc(s.p)), 0));
    return {
      doc: (p) => ({
        onSnapshot(cb) { subs.push({ p, cb, col: false }); setTimeout(() => cb(snapDoc(p)), 0); return () => {}; },
        async get() { return snapDoc(p); },
        async set(d) {
          store[p] = JSON.parse(JSON.stringify(d));
          if (p.startsWith("palpites/") || p.startsWith("resultadosEnviados/")) {
            try { const mine = JSON.parse(localStorage.getItem("bp_demo_store") || "{}"); mine[p] = d; localStorage.setItem("bp_demo_store", JSON.stringify(mine)); } catch (e) {}
          }
          notify();
        },
      }),
      collection: (p) => ({
        onSnapshot(cb) { subs.push({ p, cb, col: true }); setTimeout(() => cb(snapCol(p)), 0); return () => {}; },
      }),
    };
  }

  const pronto = montar().then(criarDb);
  const user = {
    id: async () => "demo-ana",
    isOwner: async () => true,
    can: async () => true,
    profiles: async (ids) => Object.fromEntries(ids.map((i) => [i, { name: i === "demo-ana" ? "Ana (demonstração)" : "Conta de teste" }])),
  };
  window.claude = { use: async (nome) => (nome === "db" ? pronto : nome === "user" ? user : null) };
  try { if (!localStorage.getItem("bp_token")) localStorage.setItem("bp_token", TOKEN); } catch (e) {}

  document.addEventListener("DOMContentLoaded", () => {
    const aviso = document.createElement("div");
    aviso.setAttribute("role", "note");
    aviso.style.cssText = "background:#FBEBCB;color:#7A4B00;font:600 13px/1.4 system-ui,sans-serif;padding:8px 16px;text-align:center";
    aviso.textContent = "Modo demonstração: participantes, palpites e placares são fictícios. Você está como “Ana”. Código de resultados: demo123.";
    document.body.prepend(aviso);
  });
})();
