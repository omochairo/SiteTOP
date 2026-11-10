# 子育ての行事カレンダー（omochairo.netlify.app）

おもちゃいろ（omcha.jp）の記事を行事ごとに集めて、月別の「子育ての行事カレンダー」を静的な HTML で書き出すサイト。

- `scripts/events.mjs` … 行事の定義（日付の決まり・説明・準備のめやす・記事を拾う語と除く語）
- `scripts/fetch-articles.mjs` … omcha.jp の WordPress REST API から記事一覧を取り、行事に当てて `data/articles.json` に書く（直列・2 秒間隔）
- `scripts/build.mjs` … `data/articles.json` から `dist/` を書き出す。「今月・来月」「あと何日」はビルドした日（日本時間）で決まる
- `.github/workflows/update.yml` … 週 1 回と毎月 1 日に記事を取り直して commit する。commit を受けて Netlify が作り直す

## 手元で

```bash
npm run fetch   # 記事を取り直す
npm run build   # dist/ を書き出す
```

依存パッケージはない（Node 20 以上）。

## 関連サイト

- 年齢から探す: https://omocha.pages.dev/
- 困りごとから探す: https://omocha.netlify.app/
