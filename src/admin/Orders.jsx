import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from './ctx';
import { money, when } from './api';
import { PhoneIcon, PinIcon, TrashIcon, TruckIcon, WhatsAppIcon } from '../components/Icons';

const STATUSES = [
  { id: 'new', label: 'Новый' },
  { id: 'confirmed', label: 'Подтверждён' },
  { id: 'done', label: 'Выполнен' },
  { id: 'cancelled', label: 'Отменён' },
];
const label = (id) => STATUSES.find((s) => s.id === id)?.label || id;
const PAGE = 30;

function Stats({ stats, top }) {
  if (!stats) return <div className="stats-grid">{[0, 1, 2].map((i) => <div key={i} className="stat-card skeleton" />)}</div>;
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card accent"><span>Сегодня</span><strong>{money(stats.today)}</strong><small>{stats.today_count} заказ(ов)</small></div>
        <div className="stat-card"><span>7 дней</span><strong>{money(stats.week)}</strong><small>{stats.week_count} заказ(ов)</small></div>
        <div className="stat-card"><span>30 дней</span><strong>{money(stats.month)}</strong><small>{stats.month_count} заказ(ов)</small></div>
      </div>
      {top?.length > 0 && (
        <details className="panel top-products">
          <summary>Топ товаров за 30 дней</summary>
          <ol>{top.map((t) => <li key={t.name}><span>{t.name}</span><b>{t.qty} шт · {money(t.revenue)}</b></li>)}</ol>
        </details>
      )}
    </>
  );
}

function OrderCard({ order, onStatus, onDelete }) {
  const digits = order.phone.replace(/\D/g, '').replace(/^8/, '7');
  const next = { new: 'confirmed', confirmed: 'done' }[order.status];
  return (
    <article className={`order-card status-${order.status}`}>
      <header>
        <div>
          <b className="order-code">{order.code}</b>
          <span className="muted small">{when(order.created_at)}</span>
        </div>
        <select value={order.status} onChange={(e) => onStatus(order, e.target.value)} className={`status-pill s-${order.status}`} aria-label="Статус">
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </header>

      <div className="order-customer">
        <strong>{order.name}</strong>
        <div className="order-contact">
          <a href={`tel:+${digits}`} className="chip-link"><PhoneIcon width={16} height={16} /> {order.phone}</a>
          <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="chip-link wa"><WhatsAppIcon width={16} height={16} /> WhatsApp</a>
        </div>
        <p className="order-method">
          {order.method === 'delivery'
            ? <><TruckIcon width={16} height={16} /> Доставка: {order.address || '—'}</>
            : <><PinIcon width={16} height={16} /> Самовывоз</>}
        </p>
        {order.comment && <p className="order-comment">«{order.comment}»</p>}
      </div>

      <ul className="order-items">
        {order.items.map((i, k) => (
          <li key={k}><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></li>
        ))}
      </ul>

      <footer>
        <span className="order-total">{money(order.total)}</span>
        <div className="order-actions">
          <button className="icon-btn" onClick={() => onDelete(order)} aria-label="Удалить заказ"><TrashIcon width={18} height={18} /></button>
          {order.status === 'new' && <button className="btn btn-ghost btn-sm" onClick={() => onStatus(order, 'cancelled')}>Отменить</button>}
          {next && <button className="btn btn-primary btn-sm" onClick={() => onStatus(order, next)}>{next === 'confirmed' ? 'Подтвердить' : 'Выполнен'}</button>}
        </div>
      </footer>
    </article>
  );
}

export default function Orders() {
  const { call, notify, setNewCount } = useAdmin();
  const [filter, setFilter] = useState('');
  const [orders, setOrders] = useState(null);
  const [stats, setStats] = useState(null);
  const [top, setTop] = useState([]);
  const [more, setMore] = useState(false);

  const load = useCallback(async (append = false, current = []) => {
    try {
      const [o, s] = await Promise.all([
        call('orders', undefined, { status: filter, limit: PAGE, offset: append ? current.length : 0 }),
        append ? null : call('stats'),
      ]);
      setOrders(append ? [...current, ...o.orders] : o.orders);
      setMore(o.orders.length === PAGE);
      if (s) { setStats(s.stats); setTop(s.top); setNewCount(s.stats.new_count); }
    } catch (e) {
      notify(e.message, 'error');
      setOrders((x) => x || []);
    }
  }, [call, notify, filter, setNewCount]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    // Refresh every 30s while the tab is open, so new orders show up on their own.
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [load]);

  const onStatus = async (order, status) => {
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await call('orderStatus', { id: order.id, status });
      notify(`${order.code}: ${label(status)}`);
      load();
    } catch (e) { notify(e.message, 'error'); load(); }
  };

  const onDelete = async (order) => {
    if (!confirm(`Удалить заказ ${order.code}? Это нельзя отменить.`)) return;
    try {
      await call('orderDelete', { id: order.id });
      notify('Заказ удалён');
      load();
    } catch (e) { notify(e.message, 'error'); }
  };

  return (
    <section className="admin-section">
      <div className="section-bar">
        <h1>Заказы</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => load()}>Обновить</button>
      </div>
      <Stats stats={stats} top={top} />

      <div className="chips filter-chips">
        {[{ id: '', label: 'Все' }, ...STATUSES].map((s) => (
          <button key={s.id} className={`chip ${filter === s.id ? 'is-active' : ''}`} onClick={() => setFilter(s.id)}>
            {s.label}{s.id === 'new' && stats?.new_count > 0 && <span className="chip-count">{stats.new_count}</span>}
          </button>
        ))}
      </div>

      {orders === null ? (
        <div className="order-list">{[0, 1].map((i) => <div key={i} className="order-card skeleton" style={{ height: 220 }} />)}</div>
      ) : orders.length === 0 ? (
        <div className="empty-panel">
          <p><b>Заказов пока нет</b></p>
          <p className="muted">Когда клиент оформит заказ на сайте, он появится здесь{filter ? ' (проверьте фильтр)' : ''}.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => <OrderCard key={o.id} order={o} onStatus={onStatus} onDelete={onDelete} />)}
          {more && <button className="btn btn-ghost btn-block" onClick={() => load(true, orders)}>Показать ещё</button>}
        </div>
      )}
    </section>
  );
}
