import { useCallback, useMemo, useState } from 'react';
import { CATEGORIES } from '../data/products';
import { useSite } from '../context/site';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { SearchIcon, CloseIcon } from './Icons';

const SORTS = [
  { id: 'default', label: 'Ұсынылған' },
  { id: 'asc', label: 'Арзанынан' },
  { id: 'desc', label: 'Қымбатынан' },
];

export default function Products() {
  const { products, status } = useSite();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedId, setSelectedId] = useState(null);
  const closeModal = useCallback(() => setSelectedId(null), []);
  const openProduct = useCallback((p) => setSelectedId(p.id), []);
  const selected = selectedId ? products.find((p) => p.id === selectedId) : null;

  const counts = useMemo(() => {
    const c = { all: products.length };
    products.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('kk');
    let list = products.filter((p) =>
      (category === 'all' || p.category === category) &&
      (!q || `${p.name} ${p.description}`.toLocaleLowerCase('kk').includes(q)),
    );
    if (sort !== 'default') {
      list = [...list].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price));
    }
    // Out-of-stock items always go to the end.
    return [...list].sort((a, b) => (a.stock === 'out') - (b.stock === 'out'));
  }, [products, category, query, sort]);

  const reset = () => { setCategory('all'); setQuery(''); setSort('default'); };

  return (
    <section id="products" className="section products">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Каталог</p>
          <h2 className="section-heading">Біздің өнімдер</h2>
          <p className="section-sub">Өнімді басып, толық сипаттамасын оқыңыз. Таңдағаныңызды себетке қосып, WhatsApp арқылы тапсырыс беріңіз.</p>
        </div>

        <div className="catalog-toolbar">
          <div className="chips" role="tablist" aria-label="Санаттар">
            {CATEGORIES.filter((c) => c.id === 'all' || counts[c.id]).map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                className={`chip ${category === c.id ? 'is-active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label} <span className="chip-count">{counts[c.id] || 0}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Іздеу: жантақ, перга…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Өнімді іздеу"
              />
              {query && (
                <button className="search-clear" onClick={() => setQuery('')} aria-label="Тазалау"><CloseIcon /></button>
              )}
            </label>
            <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сұрыптау">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="products-grid" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="product-card skeleton" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="products-grid">
            {visible.map((p) => <ProductCard key={p.id} product={p} onOpen={openProduct} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>Ештеңе табылмады</p>
            <button className="btn btn-ghost" onClick={reset}>Сүзгіні тазалау</button>
          </div>
        )}
      </div>
      <ProductModal product={selected} onClose={closeModal} />
    </section>
  );
}
