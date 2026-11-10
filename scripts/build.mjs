// data/articles.json と行事の定義から、静的な dist/index.html を書き出す
// 「今月・来月」はビルドした日（日本時間）で決まる。週 1 回の自動更新で作り直される
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { EVENTS, BIRTHDAY } from './events.mjs';

const SITE = 'https://omochairo.netlify.app/';
const data = JSON.parse(readFileSync(new URL('../data/articles.json', import.meta.url), 'utf8'));
const now = new Date(Date.now() + 9 * 3600 * 1000); // 日本時間を UTC のつもりで扱う
const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const thisMonth = today.getUTCMonth() + 1;
const nextMonth = (thisMonth % 12) + 1;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const fmt = (d) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WD[d.getUTCDay()]}）`;
const nextDate = (ev) => {
  if (!ev.date) return null;
  const y = today.getUTCFullYear();
  const d = ev.date(y);
  return d >= today ? d : ev.date(y + 1);
};
const daysUntil = (d) => Math.round((d - today) / 86400000);

function articleCards(ev) {
  const list = data.events[ev.id] || [];
  const cards = list.map((a) => `
          <a class="card" href="${esc(a.url)}" target="_blank" rel="noopener">
            ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy" decoding="async" width="320" height="180">` : '<span class="noimg" aria-hidden="true">🧸</span>'}
            <span class="ct">${esc(a.title)}</span>
          </a>`).join('');
  const extra = (ev.extra || []).map((x) => `
          <a class="card card-extra" href="${esc(x.url)}" target="_blank" rel="noopener">
            <span class="noimg" aria-hidden="true">✨</span>
            <span class="ct">${esc(x.title)}</span>
          </a>`).join('');
  if (!cards && !extra) return '';
  return `<div class="grid">${cards}${extra}
        </div>`;
}

function eventBlock(ev) {
  const d = nextDate(ev);
  const when = d ? `次は <b>${fmt(d)}</b>（あと <span data-until="${d.toISOString().slice(0, 10)}">${daysUntil(d)}</span> 日）・${esc(ev.dateNote)}` : esc(ev.dateNote);
  return `
      <article class="event" id="${ev.id}">
        <h3>${esc(ev.name)}</h3>
        <p class="when">📅 ${when}</p>
        <p>${esc(ev.lead)}</p>
        <p class="prep"><span>準備のめやす</span>${esc(ev.prep)}</p>
        ${articleCards(ev)}
      </article>`;
}

const months = Array.from({ length: 12 }, (_, i) => ((thisMonth - 1 + i) % 12) + 1);
const monthSections = months.map((m) => {
  const evs = EVENTS.filter((e) => e.month === m);
  const names = evs.map((e) => e.name).join('・');
  const badge = m === thisMonth ? '<span class="now">今月</span>' : m === nextMonth ? '<span class="soon">来月</span>' : '';
  return `
    <section class="month" id="m${m}">
      <h2>${m}月の子育て行事｜${esc(names)}${badge}</h2>
      ${evs.map(eventBlock).join('')}
    </section>`;
}).join('');

const upcoming = EVENTS.filter((e) => e.month === thisMonth || e.month === nextMonth)
  .sort((a, b) => ((a.month - thisMonth + 12) % 12) - ((b.month - thisMonth + 12) % 12));
const upcomingCards = upcoming.map((ev) => {
  const d = nextDate(ev);
  const n = (data.events[ev.id] || []).length + (ev.extra || []).length;
  return `
        <a class="up" href="#${ev.id}">
          <span class="up-m">${ev.month}月</span>
          <span class="up-n">${esc(ev.name)}</span>
          <span class="up-d">${d ? `${fmt(d)}・あと <span data-until="${d.toISOString().slice(0, 10)}">${daysUntil(d)}</span> 日` : esc(ev.dateNote)}</span>
          <span class="up-p">${esc(ev.prep)}</span>
          <span class="up-c">関連 ${n} 件を見る →</span>
        </a>`;
}).join('');

const allArticles = [...new Map(Object.values(data.events).flat().map((a) => [a.url, a])).values()];
const ldjson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage', '@id': `${SITE}#page`, url: SITE, inLanguage: 'ja',
      name: '子育ての行事カレンダー｜月別の季節イベントと準備のめやす',
      dateModified: data.updatedAt,
      publisher: { '@type': 'Organization', name: 'おもちゃいろ', url: 'https://omcha.jp/' },
      mainEntity: { '@id': `${SITE}#list` },
    },
    {
      '@type': 'ItemList', '@id': `${SITE}#list`, name: '行事ごとのおもちゃいろの記事',
      itemListElement: allArticles.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.title, url: a.url })),
    },
  ],
};

const chips = months.map((m) => `<a href="#m${m}">${m}月</a>`).join('') + '<a href="#birthday">誕生日</a>';
const [uy, um, ud] = data.updatedAt.split('-').map(Number);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>子育ての行事カレンダー｜月別の季節イベントと準備のめやす・プレゼント選び【おもちゃいろ】</title>
<meta name="description" content="節分・ひな祭り・こどもの日・七夕・ハロウィン・七五三・クリスマスまで、子育て家庭の年間行事を月別にまとめたカレンダー。次の行事まであと何日か、いつから何を準備するか、おもちゃいろの関連記事とあわせて確かめられます。">
<link rel="canonical" href="${SITE}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#e8576b">
<meta property="og:type" content="website">
<meta property="og:locale" content="ja_JP">
<meta property="og:site_name" content="おもちゃいろ 子育ての行事カレンダー">
<meta property="og:title" content="子育ての行事カレンダー｜月別の季節イベントと準備のめやす">
<meta property="og:description" content="次の行事まであと何日？ 子育て家庭の年間行事と準備のめやすを月別に。">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="https://omcha.jp/wp-content/uploads/2025/11/Generated-Image-September-09-2025-9_42AM.png">
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>">
<script type="application/ld+json">${JSON.stringify(ldjson).replace(/</g, '\\u003c')}</script>
<style>
:root{--bg:#fffaf6;--surface:#fff;--surface-2:#fff1ec;--text:#2d2724;--muted:#76695f;--line:#f1e3da;--accent:#e8576b;--accent-2:#f29b38;--soft:#fde8ea;--shadow:0 4px 16px rgba(120,60,40,.08);--r:14px}
@media (prefers-color-scheme:dark){:root{--bg:#1a1716;--surface:#24201e;--surface-2:#2c2623;--text:#f3ebe6;--muted:#b9aca3;--line:#3a322e;--accent:#ff8a9b;--accent-2:#ffb35c;--soft:#3a2328;--shadow:0 4px 16px rgba(0,0,0,.35)}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic UI",Meiryo,sans-serif;line-height:1.75;-webkit-text-size-adjust:100%}
a{color:var(--accent)}
.wrap{max-width:920px;margin:0 auto;padding:0 16px 40px}
header.hero{background:linear-gradient(135deg,var(--soft),var(--surface-2));border-bottom:1px solid var(--line)}
.hero .wrap{padding-top:28px;padding-bottom:22px}
.eyebrow{margin:0 0 4px;font-size:13px;color:var(--muted)}
h1{margin:0 0 10px;font-size:clamp(24px,6vw,32px);line-height:1.35}
.lead{margin:0 0 8px;font-size:15px}
.updated{margin:0;font-size:12px;color:var(--muted)}
h2.sec{font-size:20px;margin:26px 0 10px}
.ups{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.up{display:flex;flex-direction:column;gap:2px;text-decoration:none;color:inherit;background:var(--surface);border:2px solid var(--accent);border-radius:var(--r);padding:14px 16px;box-shadow:var(--shadow)}
.up-m{font-size:12px;color:var(--accent);font-weight:700}.up-n{font-size:19px;font-weight:800}
.up-d{font-size:13px;color:var(--muted)}.up-p{font-size:13px;margin-top:4px}.up-c{font-size:13px;color:var(--accent);font-weight:700;margin-top:6px}
nav.months{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);margin:20px -16px 0;padding:10px 16px}
.chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}
.chips a{flex:0 0 auto;text-decoration:none;color:var(--text);background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:13px}
.chips a:hover{border-color:var(--accent);color:var(--accent)}
section.month{scroll-margin-top:64px}
.month h2{font-size:20px;line-height:1.45;margin:30px 0 4px;padding-left:10px;border-left:5px solid var(--accent)}
.now,.soon{display:inline-block;margin-left:8px;font-size:12px;vertical-align:middle;border-radius:999px;padding:1px 9px;color:#fff;background:var(--accent)}.soon{background:var(--accent-2)}
.event{scroll-margin-top:64px;margin-top:14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px;box-shadow:var(--shadow)}
.event h3{margin:0 0 4px;font-size:18px}
.event p{margin:6px 0;font-size:14.5px}
.when{color:var(--muted);font-size:13.5px!important}
.prep{background:var(--surface-2);border-radius:10px;padding:8px 12px}
.prep span{display:inline-block;font-size:12px;font-weight:700;color:var(--accent);margin-right:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:10px}
.card{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:var(--bg);border:1px solid var(--line);border-radius:12px;overflow:hidden;transition:transform .15s,border-color .15s}
.card:hover{transform:translateY(-2px);border-color:var(--accent)}
.card img{width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;display:block;background:var(--surface-2)}
.noimg{display:grid;place-items:center;aspect-ratio:16/9;background:var(--surface-2);font-size:34px}
.card-extra .noimg{aspect-ratio:auto;padding:10px 0;font-size:22px}
.ct{padding:8px 10px 10px;font-size:13px;line-height:1.55;font-weight:600}
.more{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.more a{display:block;text-decoration:none;color:inherit;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.more a b{display:block;color:var(--accent)}.more a span{font-size:13px;color:var(--muted)}
.sns{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.sns a{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text);background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:14px;font-weight:600}
.sns i{font-style:normal;width:26px;height:26px;border-radius:7px;display:grid;place-items:center;color:#fff;font-size:13px;font-weight:800;flex:0 0 26px}
footer{margin-top:36px;padding-top:14px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);text-align:center}
footer a{color:var(--muted)}
</style>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <p class="eyebrow">🧸 おもちゃいろ</p>
    <h1>子育ての行事カレンダー</h1>
    <p class="lead">節分・ひな祭り・こどもの日・七夕・ハロウィン・七五三・クリスマスまで。子育て家庭の1年の行事を月ごとに並べ、<b>次の行事まであと何日か</b>と<b>いつから何を準備するか</b>、おもちゃいろの関連記事をまとめました。</p>
    <p class="updated">最終更新：${uy}年${um}月${ud}日（おもちゃいろの記事から週1回、自動で集めています）</p>
  </div>
</header>
<main class="wrap">
  <h2 class="sec">📌 今月と来月の行事（${thisMonth}月・${nextMonth}月）</h2>
  <div class="ups">${upcomingCards}
  </div>

  <nav class="months" aria-label="月から選ぶ"><div class="chips">${chips}</div></nav>
${monthSections}

  <section class="month" id="birthday-sec">
    <h2>毎月どこかで：誕生日のプレゼント選び</h2>
    ${eventBlock(BIRTHDAY)}
  </section>

  <section>
    <h2 class="sec">🔗 ほかの探し方</h2>
    <div class="more">
      <a href="https://omocha.pages.dev/" target="_blank" rel="noopener"><b>年齢から探す</b><span>いろパパ＆いろママ公式ポータル</span></a>
      <a href="https://omocha.netlify.app/" target="_blank" rel="noopener"><b>困りごとから探す</b><span>いろパパの開発ラボ（無料ゲーム・診断）</span></a>
      <a href="https://navi.omcha.jp/" target="_blank" rel="noopener"><b>おもちゃの値段を比べる</b><span>おもちゃいろ 比較ナビ</span></a>
      <a href="https://omcha.jp/games/" target="_blank" rel="noopener"><b>無料ゲームで遊ぶ</b><span>ダウンロードなしの子ども向けゲーム</span></a>
      <a href="https://home.omcha.jp/" target="_blank" rel="noopener"><b>家・家電のこと</b><span>おうちいろ</span></a>
      <a href="https://omcha.jp/" target="_blank" rel="noopener"><b>おもちゃのレビュー</b><span>おもちゃいろ</span></a>
    </div>
  </section>

  <section>
    <h2 class="sec">📱 季節の新しい記事は SNS でお知らせ</h2>
    <div class="sns">
      <a href="https://x.com/omochairo" target="_blank" rel="noopener me"><i style="background:#111">X</i>X</a>
      <a href="https://www.instagram.com/omochairo" target="_blank" rel="noopener me"><i style="background:#d62976">IG</i>Instagram</a>
      <a href="https://www.threads.com/@omochairo" target="_blank" rel="noopener me"><i style="background:#333">@</i>Threads</a>
      <a href="https://www.youtube.com/@omochairo" target="_blank" rel="noopener me"><i style="background:#e62117">▶</i>YouTube</a>
      <a href="https://bsky.app/profile/omochairo.bsky.social" target="_blank" rel="noopener me"><i style="background:#1185fe">B</i>Bluesky</a>
      <a href="https://room.rakuten.co.jp/omochairo/items" target="_blank" rel="noopener me"><i style="background:#bf0000">R</i>楽天ROOM</a>
    </div>
  </section>

  <footer>
    <p>運営：<a href="https://omcha.jp/" target="_blank" rel="noopener">おもちゃいろ</a>（元ソニーエンジニアのパパと医療従事者のママ）　<a href="https://omcha.jp/contact/" target="_blank" rel="noopener">お問い合わせ</a></p>
    <p>行事の日付は一般的な目安です。地域・園・学校によって異なることがあります。</p>
  </footer>
</main>
<script>
// 週 1 回の作り直しの間も「あと何日」がずれないよう、見ている日（日本時間）で数え直す
(function () {
  var n = new Date(Date.now() + 9 * 3600 * 1000);
  var t = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  document.querySelectorAll('[data-until]').forEach(function (el) {
    var p = el.getAttribute('data-until').split('-');
    var d = Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - t) / 86400000);
    if (d >= 0) el.textContent = d;
  });
})();
</script>
</body>
</html>
`;

const out = new URL('../dist/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL('index.html', out), html);
writeFileSync(new URL('robots.txt', out), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(new URL('sitemap.xml', out), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE}</loc>\n    <lastmod>${data.updatedAt}</lastmod>\n  </url>\n</urlset>\n`);
console.log(`dist/ を書きました（今月 ${thisMonth} 月・記事 ${allArticles.length} 件・${html.length} 文字）`);
