/* sss-tumu-ac — SSS Tümünü Aç — araç çubuklu çoklu akordeon (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Numara sütunlu, çizgili bir soru çizelgesi; üstünde yapışkan araç çubuğu: «Tümü» düğmesi bütün cevapları açar/kapatır (aria-pressed), soru dilimleri (01 · 02 …) tek tıkla o soruyu açıp görünür alana kaydırır ve açık olanları dolu gösterir, sayaç açık soru sayısını verir (3 / 7). Birden çok soru aynı anda açık kalabilir; kapalı/açık durumu onay kutusu gibi dolan kare işaretle görünür. JS yokken araç çubuğu gizli, akordeon yerel.
   Üretici: scripts/modul-fabrika (aile faq) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ soru (ya da question), cevap (ya da answer), kategori?, ikon?, url? }] — metinler dil sözlüğü; sorusuz satır atlanır. FAQPage JSON-LD motorda `question/answer` adlarını okur. */
const P = "modulex-sss-tumu-ac";
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
/* --- aile: faq --- */
const kayitlar = veri.map((o) => ({
  soru: metinAl(o, ["soru", "question", "q", "baslik", "title", "name"]),
  cevap: metinAl(o, ["cevap", "answer", "a", "metin", "text", "description"]),
  kategori: metinAl(o, ["kategori", "category", "grup"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.soru);
const tekAcik = dogru(des.tekAcik, true);
const ilkAcik = dogru(des.ilkAcik, true);
const cH = (k, s) => (k.cevap ? `<p class="${P}-${s || "cevap"}">${satirlar(k.cevap)}</p>` : "");
const lH = (k) => (k.url ? `<a class="${P}-bag" href="${esc(k.url)}">@read-more@<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
const yH = (k, s) => (k.cevap || k.url ? `<div class="${P}-${s || "yanit"}">${cH(k)}${lH(k)}</div>` : "");
/* yerel açılır: tekAcik → aynı name (tarayıcı diğerlerini kapatır), ilkAcik → ilk öğe açık */
const acH = (k, i, on, son) => `<details class="${P}-oge"${tekAcik ? ` name="${P}-{{id}}"` : ""}${i === 0 && ilkAcik ? " open" : ""}><summary class="${P}-ozet">${on || ""}<span class="${P}-soru">${esc(k.soru)}</span>${son === undefined ? `<span class="${P}-isaret" aria-hidden="true"></span>` : son}</summary>${yH(k)}</details>`;
const gruplar = (A) => {
  const m = new Map();
  A.forEach((k, i) => { const g = k.kategori || ""; if (!m.has(g)) m.set(g, []); m.get(g).push(Object.assign({ sira: i }, k)); });
  return [...m.entries()].map(([ad, liste]) => ({ ad, liste }));
};
/* --- modül: sss-tumu-ac --- */
const kart = (k, i) => `<details class="${P}-kalem" data-ta id="${P}-{{id}}-k${i}"${i === 0 && ilkAcik ? " open" : ""}><summary class="${P}-kozet"><span class="${P}-ksira" aria-hidden="true">${no(i)}</span><span class="${P}-kyazi">${esc(k.soru)}</span><span class="${P}-kdurum" aria-hidden="true"></span></summary>${k.cevap || k.url ? `<div class="${P}-kyanit">${cH(k)}${lH(k)}</div>` : ""}</details>`;
const sar = (ic, A) => `<div class="${P}-arac" data-ta-arac hidden><button type="button" class="${P}-hepsi" data-ta-hepsi aria-pressed="false"><span class="${P}-hac material-symbols-outlined" aria-hidden="true">unfold_more</span><span class="${P}-hkapa material-symbols-outlined" aria-hidden="true">unfold_less</span><span>@all@</span></button>`
    + `<div class="${P}-dilimler" role="group" aria-label="@faq-title@">${A.map((k, i) => `<button type="button" class="${P}-dilim" data-ta-git="${i}" aria-pressed="false" aria-label="${esc(k.soru)}" title="${esc(k.soru)}"><span aria-hidden="true">${no(i)}</span></button>`).join("")}</div>`
    + `<p class="${P}-olcer"><bdi dir="ltr"><output data-ta-say>${sayiBicim(0, 0)}</output> / ${sayiBicim(A.length, 0)}</bdi></p></div><div class="${P}-kalemler">${ic}</div>`;
const B = { ust: metinAl(des, ["ust","badge","kicker","eyebrow"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description","text"]) };
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
