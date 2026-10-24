import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from './ctx';
import { money } from './api';
import ProductEditor from './ProductEditor';
import { STOCK } from './constants';
import { CATEGORIES } from '../data/products';
import { PlusIcon, SearchIcon, ChevronDownIcon } from '../components/Icons';

const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;

export default function ProductsAdmin() {
  const { call, notify } = useAdmin();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // product | 'new' | null
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const { products } = await call('products');
      setItems(products);
    } catch (e) {
      notify(e.message, 'error');
      setItems((x) => x || []);
    }
  }, [call, notify]);

  useEffect(() => {
    const t = setTimeout(load, 0); // first load, outside the render pass
    return () => clearTimeout(t);
  }, [load]);

  const patch = async (p, change) => {
    setItems((list) => list.map((x) => (x.id === p.id ? { ...x, ...change } : x)));
    try {
      await call('productPatch', { id: p.id, ...change });
      if (change.stock) notify(`${p.name}: ${STOCK.find((s) => s.id === change.stock).said}`);
      if (change.visible !== undefined) notify(change.visible ? 'Товар показан на сайте' : 'Товар скрыт с сайта');
    } catch (e) { notify(e.message, 'error'); load(); }
  };

  const move = async (index, dir) => {
    const list = [...items];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setItems(list);
    try { await call('reorder', { ids: list.map((p) => p.id) }); } catch (e) { notify(e.message, 'error'); load(); }
  };

  const filtering = !!(query.trim() || stockFilter);
  const shown = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items
      .map((p, index) => ({ p, index }))
      .filter(({ p }) => (!q || p.name.toLowerCase().includes(q)) && (!stockFilter || p.stock === stockFilter || (stockFilter === 'hidden' && !p.visible)));
  }, [items, query, stockFilter]);

  const counts = useMemo(() => {
    const c = { in: 0, low: 0, out: 0, hidden: 0 };
    (items || []).forEach((p) => { c[p.stock]++; if (!p.visible) c.hidden++; });
    return c;
  }, [items]);

  return (
    <section className="admin-section">
      <div className="section-bar">
        <h1>Товары {items && <span className="muted">{items.length}</span>}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><PlusIcon /> Добавить</button>
      </div>

      <div className="product-tools">
        <label className="search">
          <SearchIcon />
          <input type="search" placeholder="Поиск товара" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chips filter-chips">
          {[{ id: '', label: 'Все' }, { id: 'low', label: `Мало · ${counts.low}` }, { id: 'out', label: `Нет · ${counts.out}` }, { id: 'hidden', label: `Скрытые · ${counts.hidden}` }].map((f) => (
            <button key={f.id} className={`chip ${stockFilter === f.id ? 'is-active' : ''}`} onClick={() => setStockFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      {items === null ? (
        <div className="plist">{[0, 1, 2, 3].map((i) => <div key={i} className="prow skeleton" style={{ height: 120 }} />)}</div>
      ) : shown.length === 0 ? (
        <div className="empty-panel"><p><b>Ничего не найдено</b></p></div>
      ) : (
        <ul className="plist">
          {shown.map(({ p, index }) => (
            <li key={p.id} className={`prow ${p.visible ? '' : 'is-hidden'} stock-${p.stock}`}>
              <button className="prow-main" onClick={() => setEditing(p)}>
                <img src={p.image || '/images/Honey-Nutrition.jpg'} alt="" loading="lazy" />
                <span className="prow-info">
                  <b>{p.name}</b>
                  <span className="muted small">{catLabel(p.category)}{p.unit ? ` · ${p.unit}` : ''}</span>
                  <span className="prow-price">
                    {p.price_note ? `${p.price_note} ₸` : money(p.price)}
                    {p.old_price > p.price && <s>{money(p.old_price)}</s>}
                    {!p.visible && <em className="hidden-tag">скрыт</em>}
                  </span>
                </span>
              </button>
              <div className="prow-controls">
                <div className="segmented three mini" role="group" aria-label="Наличие">
                  {STOCK.map((s) => (
                    <button key={s.id} className={`${p.stock === s.id ? 'is-active' : ''} st-${s.id}`} onClick={() => p.stock !== s.id && patch(p, { stock: s.id })}>{s.label}</button>
                  ))}
                </div>
                <label className="mini-switch" title="Показывать на сайте">
                  <input type="checkbox" className="switch" checked={p.visible} onChange={(e) => patch(p, { visible: e.target.checked })} aria-label="Показывать на сайте" />
                </label>
                {!filtering && (
                  <span className="order-btns">
                    <button className="icon-btn icon-btn-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Выше"><ChevronDownIcon style={{ transform: 'rotate(180deg)' }} /></button>
                    <button className="icon-btn icon-btn-sm" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Ниже"><ChevronDownIcon /></button>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((list) => (list.some((x) => x.id === saved.id) ? list.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...list]));
            setEditing(null);
          }}
          onDeleted={(id) => { setItems((list) => list.filter((x) => x.id !== id)); setEditing(null); }}
        />
      )}
    </section>
  );
}
