import rssData from './rss_feed.json';

export interface Article {
  id: string;
  title: string;
  url: string;
  icon: string;
  image: string;
  ages: string[];
  categories: string[];
  featured?: boolean;
  description?: string;
}

// Category labels
export const AGE_LABELS: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
  'elementary': '小学生',
  'all': '全年齢'
};

export const CATEGORY_LABELS: Record<string, string> = {
  'toy': 'おもちゃ',
  'habit': '習慣',
  'safety': '安全',
  'play': '遊び',
  'goods': 'グッズ',
  'parenting': '育児'
};

// Real images scraped from omcha.jp (converted to high-res)
const REAL_IMAGES = [
  'https://omcha.jp/wp-content/uploads/2025/08/image-21.png',
  'https://omcha.jp/wp-content/uploads/2025/06/20250430_120854591_iOS.jpg',
  'https://omcha.jp/wp-content/uploads/2025/08/image-64.png',
  'https://omcha.jp/wp-content/uploads/2025/11/image-14.png',
  'https://omcha.jp/wp-content/uploads/2025/07/image-38.png',
  'https://omcha.jp/wp-content/uploads/2025/08/image-137.png',
  'https://omcha.jp/wp-content/uploads/2025/05/image-173.png',
  'https://omcha.jp/wp-content/uploads/2025/07/image-172.png',
  'https://omcha.jp/wp-content/uploads/2025/07/image-25.png',
  'https://omcha.jp/wp-content/uploads/2025/12/image-62.png',
  'https://omcha.jp/wp-content/uploads/2025/06/20250602_012105597_iOS.jpg',
  'https://omcha.jp/wp-content/uploads/2025/02/20250225_114406702_iOS.jpg',
  'https://omcha.jp/wp-content/uploads/2025/04/image-173.png.webp',
  'https://omcha.jp/wp-content/uploads/2025/11/image-72.png',
  'https://omcha.jp/wp-content/uploads/2026/01/image-63.png',
  'https://omcha.jp/wp-content/uploads/2026/01/image-85.png',
];

const getRealImage = (index: number) => REAL_IMAGES[index % REAL_IMAGES.length];

// Curated articles from omcha.jp
export const ARTICLES: Article[] = [
  // ========== Featured ==========
  {
    id: 'toy_subscription',
    title: '【おもちゃサブスク比較】トイサブ・ChaChaCha・キッズラボラトリー徹底解説',
    url: 'https://omcha.jp/toy-subscription-rental-guide/',
    icon: '🧸',
    image: 'https://omcha.jp/wp-content/uploads/2026/01/image-85.png',
    ages: ['0-1', '2-3', '4-6'],
    categories: ['toy'],
    featured: true,
    description: '月額3,000円台で15,000円相当の知育玩具が使い放題。'
  },
  {
    id: 'baby_goods',
    title: '【0歳〜2歳】育児グッズ買ってよかった決定版',
    url: 'https://omcha.jp/0-2years-parenting-goods-guide/',
    icon: '👶',
    image: 'https://omcha.jp/wp-content/uploads/2025/05/image-173.png',
    ages: ['0-1', '2-3'],
    categories: ['goods', 'parenting'],
    featured: true,
    description: 'ペットシーツ活用から抱っこ紐まで、本当に必要だったモノ。'
  },
  // ========== 0-1歳 ==========
  {
    id: 'baby_cry',
    title: '赤ちゃんの泣き声【5種類】聞き分け完全ガイド',
    url: 'https://omcha.jp/akatyan_nakigoe/',
    icon: '😭',
    image: getRealImage(2),
    ages: ['0-1'],
    categories: ['parenting']
  },
  {
    id: 'toothfixer',
    title: '【0歳〜】タコさん指遊びおもちゃレビュー',
    url: 'https://omcha.jp/takoomocha/',
    icon: '🐙',
    image: getRealImage(3),
    ages: ['0-1'],
    categories: ['toy', 'play']
  },
  {
    id: '1sai_toy',
    title: '【1歳児おもちゃ完全ガイド】発達を促す知育玩具',
    url: 'https://omcha.jp/post-2646/',
    icon: '🎁',
    image: getRealImage(4),
    ages: ['0-1'],
    categories: ['toy']
  },
  {
    id: 'corner_guard',
    title: '【コーナーガード決定版】100均は危ない？',
    url: 'https://omcha.jp/corner-guard-cushion-osusume/',
    icon: '🛡️',
    image: getRealImage(5),
    ages: ['0-1', '2-3'],
    categories: ['safety']
  },
  // ========== 2-3歳 ==========
  {
    id: 'hamigaki',
    title: '【歯磨き嫌い】アンパンマンミラーで歯磨き大好きに',
    url: 'https://omcha.jp/hamigakinakanai/',
    icon: '🪥',
    image: getRealImage(6),
    ages: ['0-1', '2-3'],
    categories: ['habit']
  },
  {
    id: 'iyaiya',
    title: '【イヤイヤ期】癇癪の原因と親ができること',
    url: 'https://omcha.jp/kosodate/',
    icon: '😤',
    image: getRealImage(7),
    ages: ['2-3'],
    categories: ['parenting']
  },
  {
    id: '2sai_toy',
    title: '【2歳・3歳】おもちゃおすすめ完全ガイド',
    url: 'https://omcha.jp/2-3years-toy-guide/',
    icon: '🧩',
    image: getRealImage(8),
    ages: ['2-3'],
    categories: ['toy', 'play']
  },
  {
    id: 'outing_toy',
    title: '【2歳と旅行】車で遊べるお出かけおもちゃ',
    url: 'https://omcha.jp/nisaijikuruma/',
    icon: '🚗',
    image: getRealImage(9),
    ages: ['2-3'],
    categories: ['toy']
  },
  {
    id: 'tomika_combo',
    title: '「片付けなさい！」不要！トミカおかたづけコンボイ',
    url: 'https://omcha.jp/tomicaokatazuke/',
    icon: '🚚',
    image: getRealImage(10),
    ages: ['2-3', '4-6'],
    categories: ['toy', 'habit']
  },
  {
    id: '2sai_drill',
    title: '【2歳ドリルおすすめ4選】くもん・アンパンマン比較',
    url: 'https://omcha.jp/2years-old-drill-recommend/',
    icon: '📝',
    image: getRealImage(11),
    ages: ['2-3'],
    categories: ['play']
  },
  // ========== 4-6歳 ==========
  {
    id: '4sai_present',
    title: '【4歳・5歳】誕生日プレゼント決定版',
    url: 'https://omcha.jp/4-5years-birthday-present-guide/',
    icon: '🎂',
    image: getRealImage(12),
    ages: ['4-6'],
    categories: ['toy']
  },
  {
    id: 'laq',
    title: '【LaQ】初めてならコレ！人気ランキング',
    url: 'https://omcha.jp/laq-osusume-boy-ranking/',
    icon: '🔷',
    image: getRealImage(13),
    ages: ['4-6', 'elementary'],
    categories: ['toy', 'play']
  },
  {
    id: 'steam',
    title: '【STEAM教育】理系脳を育てるおもちゃ完全ガイド',
    url: 'https://omcha.jp/steam-programming-science-toys/',
    icon: '🔬',
    image: getRealImage(14),
    ages: ['4-6', 'elementary'],
    categories: ['toy', 'play']
  },
  {
    id: 'kickboard',
    title: '【3歳から】マイクロスクーターが正解な理由',
    url: 'https://omcha.jp/kickboard-3years-old-micro/',
    icon: '🛴',
    image: getRealImage(0),
    ages: ['2-3', '4-6'],
    categories: ['toy', 'play']
  },
  // ========== 小学生 ==========
  {
    id: 'balance_game',
    title: '【バランスゲーム】子供も大人も夢中！人気10選',
    url: 'https://omcha.jp/balance-game-osusume-ranking/',
    icon: '🎯',
    image: getRealImage(1),
    ages: ['4-6', 'elementary'],
    categories: ['toy', 'play']
  },
  // ========== 全年齢 ==========
  {
    id: 'okatazuke',
    title: '【おもちゃ収納完全ガイド】ニトリ・無印・100均',
    url: 'https://omcha.jp/omochasyunou/',
    icon: '📦',
    image: getRealImage(2),
    ages: ['all'],
    categories: ['habit']
  },
  {
    id: 'stmark',
    title: '【STマークとは？】おもちゃの安全基準を徹底解説',
    url: 'https://omcha.jp/stmark/',
    icon: '✅',
    image: getRealImage(3),
    ages: ['all'],
    categories: ['safety']
  },
  {
    id: 'hsp',
    title: '【HSPの子育て】向いてないと泣くほど辛いあなたへ',
    url: 'https://omcha.jp/hsp-kosodate-tsurai/',
    icon: '💜',
    image: getRealImage(4),
    ages: ['all'],
    categories: ['parenting']
  },
  {
    id: 'essay',
    title: '【子育てエッセイ漫画】笑って泣ける！おすすめ5選',
    url: 'https://omcha.jp/kosodate-essay-manga-osusume/',
    icon: '📚',
    image: getRealImage(5),
    ages: ['all'],
    categories: ['parenting']
  },
  {
    id: 'naraigoto',
    title: '「習い事させない」はかわいそうじゃない',
    url: 'https://omcha.jp/naraigoto-shinai-binbou-kawaisou/',
    icon: '🏠',
    image: getRealImage(6),
    ages: ['2-3', '4-6', 'elementary'],
    categories: ['parenting']
  }
];

export interface RSSArticle {
  title: string;
  url: string;
  image: string;
  date?: string;
}

// Ensure TypeScript treats imported JSON as RSSArticle[]
export const LATEST_ARTICLES: RSSArticle[] = rssData as RSSArticle[];

// Use RSS images for hero if available, otherwise fallback
export const HERO_IMAGES = LATEST_ARTICLES.length > 5
  ? LATEST_ARTICLES.slice(0, 12).map(a => ({
    url: a.url,
    image: a.image, // Use the extracted image from RSS
    title: a.title
  }))
  : ARTICLES.slice(0, 12).map(a => ({
    url: a.url,
    image: a.image,
    title: a.title
  }));

// Filter functions
export const getArticlesByAge = (age: string): Article[] =>
  ARTICLES.filter(a => a.ages.includes(age) || a.ages.includes('all'));

export const getArticlesByCategory = (category: string): Article[] =>
  ARTICLES.filter(a => a.categories.includes(category));

export const getFeaturedArticles = (): Article[] =>
  ARTICLES.filter(a => a.featured);

export const searchArticles = (query: string): Article[] => {
  const q = query.toLowerCase();
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.categories.some(c => CATEGORY_LABELS[c]?.includes(q))
  );
};
