import { useState } from 'react';
import {
  ARTICLES,
  LATEST_ARTICLES,
  HERO_IMAGES,
  AGE_LABELS,
  CATEGORY_LABELS,
  getArticlesByAge,
  getArticlesByCategory,
  getFeaturedArticles,
  searchArticles,
  type Article
} from './data/articles';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAgeTab, setActiveAgeTab] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  // Get filtered articles
  const getDisplayArticles = (): Article[] => {
    if (searchQuery) {
      return searchArticles(searchQuery);
    }
    if (activeAgeTab) {
      return getArticlesByAge(activeAgeTab);
    }
    if (activeCategoryTab) {
      return getArticlesByCategory(activeCategoryTab);
    }
    return ARTICLES;
  };

  const displayArticles = getDisplayArticles();
  const featuredArticles = getFeaturedArticles();

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="app">
      {/* Hero Section with Floating Gallery */}
      <section className="hero">
        {/* Floating Article Images */}
        <div className="floating-gallery">
          {HERO_IMAGES.map((item, i) => (
            <div
              key={i}
              className="floating-image"
              onClick={() => handleCardClick(item.url)}
              title={item.title}
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/200x130/1a1a2e/6366f1?text=${encodeURIComponent(item.title.slice(0, 10))}`;
                }}
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <span className="hero-badge">
            <span>🧸</span>
            育児を楽しくするメディア
          </span>
          <h1 className="hero-title">おもちゃいろ</h1>
          <p className="hero-subtitle">
            0歳から小学生まで、お子さんの成長をサポートする<br />
            おもちゃ・育児グッズ・知育情報をお届けします
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="🔍 記事を検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveAgeTab(null);
                setActiveCategoryTab(null);
              }}
            />
          </div>
          <div className="hero-scroll">
            ↓ スクロールして記事を探す
          </div>
        </div>
      </section>

      {/* Latest Articles from RSS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="icon">🆕</span>
                最新記事
              </h2>
              <p className="section-subtitle">おもちゃいろの新着コンテンツ</p>
            </div>
          </div>
          <div className="article-grid">
            {LATEST_ARTICLES.map((article, i) => (
              <div
                key={i}
                className="article-card"
                onClick={() => handleCardClick(article.url)}
              >
                <div className="card-image">
                  {!imageErrors.has(`latest-${i}`) ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      onError={() => handleImageError(`latest-${i}`)}
                    />
                  ) : (
                    <div className="card-image-placeholder">📰</div>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-tags">
                    <span className="card-tag new">NEW</span>
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="icon">⭐</span>
                おすすめ特集
              </h2>
              <p className="section-subtitle">編集部イチオシのコンテンツ</p>
            </div>
          </div>
          <div className="article-grid">
            {featuredArticles.map(article => (
              <div
                key={article.id}
                className="article-card featured-card"
                onClick={() => handleCardClick(article.url)}
              >
                <div className="card-image">
                  {!imageErrors.has(article.id) ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      onError={() => handleImageError(article.id)}
                    />
                  ) : (
                    <div className="card-image-placeholder">{article.icon}</div>
                  )}
                </div>
                <div className="card-content">
                  <span className="featured-badge">⭐ FEATURED</span>
                  <h3 className="featured-title">{article.title}</h3>
                  {article.description && (
                    <p className="featured-desc">{article.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age-based Articles */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="icon">👶</span>
                年齢別で探す
              </h2>
              <p className="section-subtitle">お子さんの年齢に合った記事</p>
            </div>
            <div className="tabs">
              {Object.entries(AGE_LABELS).filter(([k]) => k !== 'all').map(([key, label]) => (
                <button
                  key={key}
                  className={`tab ${activeAgeTab === key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAgeTab(activeAgeTab === key ? null : key);
                    setActiveCategoryTab(null);
                    setSearchQuery('');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="article-grid">
            {(activeAgeTab ? getArticlesByAge(activeAgeTab) : ARTICLES.slice(0, 6)).map(article => (
              <div
                key={article.id}
                className="article-card compact"
                onClick={() => handleCardClick(article.url)}
              >
                {/* Image hidden via CSS in compact mode, so we can keep the DOM structure or simplify it */}
                <div className="card-image">
                  {/* Placeholder content just to keep structure valid if CSS toggles display */}
                  <div className="card-image-placeholder">{article.icon}</div>
                </div>
                <div className="card-content">
                  <div className="card-tags">
                    {article.ages.filter(a => a !== 'all').slice(0, 2).map(age => (
                      <span key={age} className="card-tag age">{AGE_LABELS[age]}</span>
                    ))}
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category-based Articles */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <span className="icon">📂</span>
                カテゴリ別で探す
              </h2>
              <p className="section-subtitle">悩みやテーマから記事を探す</p>
            </div>
            <div className="tabs">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`tab ${activeCategoryTab === key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategoryTab(activeCategoryTab === key ? null : key);
                    setActiveAgeTab(null);
                    setSearchQuery('');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="article-grid">
            {(activeCategoryTab ? getArticlesByCategory(activeCategoryTab) : ARTICLES.filter(a => a.categories.includes('toy')).slice(0, 6)).map(article => (
              <div
                key={article.id}
                className="article-card compact"
                onClick={() => handleCardClick(article.url)}
              >
                <div className="card-image">
                  <div className="card-image-placeholder">{article.icon}</div>
                </div>
                <div className="card-content">
                  <div className="card-tags">
                    {article.categories.slice(0, 1).map(cat => (
                      <span key={cat} className="card-tag category">{CATEGORY_LABELS[cat]}</span>
                    ))}
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results (when searching) */}
      {searchQuery && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <span className="icon">🔍</span>
                  「{searchQuery}」の検索結果
                </h2>
                <p className="section-subtitle">{displayArticles.length}件の記事が見つかりました</p>
              </div>
            </div>
            <div className="article-grid">
              {displayArticles.map(article => (
                <div
                  key={article.id}
                  className="article-card"
                  onClick={() => handleCardClick(article.url)}
                >
                  <div className="card-image">
                    {!imageErrors.has(article.id) ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        onError={() => handleImageError(article.id)}
                      />
                    ) : (
                      <div className="card-image-placeholder">{article.icon}</div>
                    )}
                  </div>
                  <div className="card-content">
                    <div className="card-tags">
                      {article.ages.filter(a => a !== 'all').slice(0, 1).map(age => (
                        <span key={age} className="card-tag age">{AGE_LABELS[age]}</span>
                      ))}
                      {article.categories.slice(0, 1).map(cat => (
                        <span key={cat} className="card-tag category">{CATEGORY_LABELS[cat]}</span>
                      ))}
                    </div>
                    <h3 className="card-title">{article.title}</h3>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            Powered by <a href="https://omcha.jp/" target="_blank" rel="noopener noreferrer">おもちゃいろ</a>
            {' '}| 育児を楽しくするメディア
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
