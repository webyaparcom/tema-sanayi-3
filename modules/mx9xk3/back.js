/* zaman-gantt — Zaman Gantt — yıl ekseninde üst üste binen dönem çubukları (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Her dönem bir satır: solda ikon, başlık ve metin; sağda ortak yıl ekseninde başlangıç–bitiş çubuğu (gerçek yıl oranıyla). Eş zamanlı dönemler üst üste biner, son dönem «sürüyor» olarak açık uçlu solar; yıl ekseni yapışkan, ızgara çizgileri adım adım; çubuklar görünür olunca eksenden uzar. Veride `bitis` (ya da etikette «2009–2014») yoksa dönem bir sonrakinin başlangıcına dek sürer.
   Üretici: scripts/modul-fabrika (aile timeline) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ etiket (yıl/tarih), baslik, metin?, ikon?, img?, url? }] — metinler dil sözlüğü; başlıksız satır atlanır. */
const P = "modulex-zaman-gantt";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: timeline --- */
const kayitlar = veri.map((o) => ({
  etiket: metinAl(o, ["etiket", "year", "yil", "tarih", "date"]), baslik: metinAl(o, ["baslik", "title", "name"]),
  metin: metinAl(o, ["metin", "text", "description", "aciklama"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  img: medyaUrl(ilk(o, ["img", "image"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const yH = (k, s) => (k.etiket ? `<p class="${P}-${s || "yil"}">${esc(k.etiket)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="" width="800" height="560" loading="lazy" decoding="async" />` : "");
/* --- modül: zaman-gantt --- */
const kart = () => "";
const sar = (ic, A) => {
    const R = veri.filter((o) => metinAl(o, ["baslik", "title", "name"]));
    const yy = (v) => (String(v || "").match(/\d{4}/g) || []).map(Number);
    const S = A.map((k, i) => { const y = yy(k.etiket); const b = yy(metinAl(R[i] || {}, ["bitis", "son", "end"])); return { k, s: y[0], e: y[1] || b[0], acik: false }; });
    const tam = S.every((x) => Number.isFinite(x.s));
    let lo = 0;
    let hi = A.length;
    let st = 1;
    const T = [];
    if (tam) {
      const basl = S.map((x) => x.s).sort((a, b) => a - b);
      S.forEach((x) => { if (!(x.e > x.s)) { const sonra = basl.find((v) => v > x.s); x.e = sonra; x.acik = !sonra; } });
      const bilinen = S.flatMap((x) => (x.acik ? [x.s] : [x.s, x.e]));
      lo = Math.min(...bilinen);
      const enSon = Math.max(...bilinen);
      const pay = Math.max(1, Math.round((enSon - lo) * 0.12));
      S.forEach((x) => { if (x.acik) x.e = Math.max(enSon, x.s) + pay; });
      hi = Math.max(...S.map((x) => x.e));
      st = [1, 2, 5, 10, 20, 25, 50, 100, 250, 500].find((a) => Math.ceil(hi / a) * a - Math.floor(lo / a) * a <= 8 * a) || 1000;
      lo = Math.floor(lo / st) * st;
      hi = Math.ceil(hi / st) * st;
      if (hi === lo) hi = lo + st;
      for (let t = lo; t <= hi; t += st) T.push(t);
    } else S.forEach((x, i) => { x.s = i; x.e = i + 1; });
    const W = hi - lo;
    const olcek = T.length ? `<div class="${P}-eksen" aria-hidden="true"><span class="${P}-ebos"></span><div class="${P}-olcek">${T.map((t, j) => `<span class="${P}-tik${j === 0 ? ` ${P}-tik--ilk` : j === T.length - 1 ? ` ${P}-tik--son` : ""}" style="--x: ${((t - lo) / W).toFixed(4)}"><bdi dir="ltr">${t}</bdi></span>`).join("")}</div></div>` : "";
    const satir = S.map((x) => {
      const b = (x.s - lo) / W;
      const w = (x.e - x.s) / W;
      const ar = tam ? `${x.s}${x.acik ? "" : ` – ${x.e}`}` : x.k.etiket;
      return `<li class="${P}-satir"><div class="${P}-bilgi">${ikonH(x.k.ikon, `${P}-ikon`)}<div class="${P}-yazi">${bH(x.k)}${mH(x.k)}</div></div><div class="${P}-iz" style="--b: ${b.toFixed(4)}; --w: ${w.toFixed(4)}"><span class="${P}-cubuk${x.acik ? ` ${P}-cubuk--acik` : ""}"></span>${ar ? `<span class="${P}-aralik${b > 0.5 ? ` ${P}-aralik--sondan` : ""}"><bdi dir="ltr">${esc(ar)}</bdi>${x.acik ? `<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span>` : ""}</span>` : ""}</div></li>`;
    }).join("");
    return `<div class="${P}-gantt" style="--n: ${Math.max(1, Math.round(W / st))}">${olcek}<ol class="${P}-satirlar">${satir}</ol></div>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
