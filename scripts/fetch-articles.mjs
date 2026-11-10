// omcha.jp の記事一覧を WordPress REST API から取り、行事ごとに当てて data/articles.json に書く
// omcha.jp は共有サーバなので、リクエストは直列・間隔 2 秒にする
import { writeFileSync, mkdirSync } from 'node:fs';
import { EVENTS, BIRTHDAY, MAX_PER_EVENT } from './events.mjs';

const API = 'https://omcha.jp/wp-json/wp/v2';
const UA = 'omochairo-gyoji-calendar/1.0 (+https://omochairo.netlify.app/)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return { data: await res.json(), headers: res.headers };
    console.error(`HTTP ${res.status} ${url}（${i + 1} 回目）`);
    await sleep(5000 * (i + 1));
  }
  throw new Error(`取得できませんでした: ${url}`);
}

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

async function fetchAllPosts() {
  const fields = 'id,title,link,date,modified,featured_media';
  const first = await getJson(`${API}/posts?per_page=100&page=1&_fields=${fields}`);
  const pages = Number(first.headers.get('x-wp-totalpages') || 1);
  let posts = first.data;
  for (let p = 2; p <= pages; p++) {
    await sleep(2000);
    posts = posts.concat((await getJson(`${API}/posts?per_page=100&page=${p}&_fields=${fields}`)).data);
  }
  return posts.map((p) => ({
    id: p.id, title: decode(p.title.rendered), url: p.link,
    date: p.date.slice(0, 10), modified: p.modified.slice(0, 10), media: p.featured_media,
  }));
}

function match(posts, ev) {
  return posts
    .filter((p) => ev.include.some((k) => p.title.includes(k)) && !ev.exclude.some((k) => p.title.includes(k)))
    .sort((a, b) => b.modified.localeCompare(a.modified))
    .slice(0, MAX_PER_EVENT);
}

async function fetchMedia(ids) {
  const map = {};
  const list = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < list.length; i += 100) {
    await sleep(2000);
    const chunk = list.slice(i, i + 100).join(',');
    const { data } = await getJson(`${API}/media?per_page=100&include=${chunk}&_fields=id,source_url,media_details`);
    for (const m of data) {
      const s = m.media_details?.sizes || {};
      const pick = s.medium_large || s.medium || s.large || null;
      map[m.id] = pick ? pick.source_url : m.source_url;
    }
  }
  return map;
}

const posts = await fetchAllPosts();
console.log(`記事 ${posts.length} 件を取得`);
if (posts.length < 100) throw new Error('記事数が少なすぎます。取得に失敗した可能性があるので書き出しません');

const events = {};
for (const ev of [...EVENTS, BIRTHDAY]) events[ev.id] = match(posts, ev);
const media = await fetchMedia(Object.values(events).flat().map((p) => p.media));

for (const id of Object.keys(events)) {
  events[id] = events[id].map(({ media: m, ...p }) => ({ ...p, image: media[m] || null }));
  console.log(`${id}: ${events[id].length} 件`);
}

const jst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(
  new URL('../data/articles.json', import.meta.url),
  JSON.stringify({ updatedAt: jst, totalPosts: posts.length, events }, null, 2) + '\n',
);
console.log(`data/articles.json を書きました（${jst}）`);
