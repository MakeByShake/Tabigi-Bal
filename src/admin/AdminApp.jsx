import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, AuthError } from './api';
import { AdminContext } from './ctx';
import { LOGO_SRC } from '../lib/config';
import { ListIcon, HexIcon, SparkIcon, ArrowRightIcon } from '../components/Icons';
import Orders from './Orders';
import ProductsAdmin from './ProductsAdmin';
import Settings from './Settings';

const TABS = [
  { id: 'orders', label: 'Заказы', icon: ListIcon },
  { id: 'products', label: 'Товары', icon: HexIcon },
  { id: 'settings', label: 'Настройки', icon: SparkIcon },
];

function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('login', { password });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img src={LOGO_SRC} alt="" />
        <h1>Tabigi <span>Bal</span></h1>
        <p className="muted">Вход в админку</p>
        <label className="field">
          <span>Пароль</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !password}>{busy ? 'Входим…' : 'Войти'}</button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [auth, setAuth] = useState('checking');
  const [tab, setTab] = useState(() => (TABS.some((t) => `#${t.id}` === location.hash) ? location.hash.slice(1) : 'orders'));
  const [toasts, setToasts] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const idRef = useRef(0);

  useEffect(() => {
    api('me').then((d) => setAuth(d.admin ? 'in' : 'out')).catch(() => setAuth('out'));
  }, []);

  useEffect(() => {
    const onHash = () => TABS.some((t) => `#${t.id}` === location.hash) && setTab(location.hash.slice(1));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const notify = useCallback((message, kind = 'ok') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 5000 : 2500);
  }, []);

  const call = useCallback(async (action, body, query) => {
    try {
      return await api(action, body, query);
    } catch (e) {
      if (e instanceof AuthError) setAuth('out');
      throw e;
    }
  }, []);

  const ctx = useMemo(() => ({ call, notify, setNewCount }), [call, notify]);

  const logout = async () => {
    await api('logout', {}).catch(() => {});
    setAuth('out');
  };

  if (auth === 'checking') return <div className="admin-loading"><span className="spinner" /></div>;
  if (auth === 'out') return <Login onDone={() => setAuth('in')} />;

  const go = (id) => { setTab(id); history.replaceState(null, '', `#${id}`); window.scrollTo(0, 0); };

  return (
    <AdminContext.Provider value={ctx}>
      <div className="admin">
        <header className="admin-top">
          <div className="admin-top-inner">
            <a className="brand" href="/" target="_blank" rel="noopener noreferrer" title="Открыть сайт">
              <img src={LOGO_SRC} alt="" width="38" height="38" />
              <span className="brand-name">Tabigi <span>Bal</span></span>
            </a>
            <nav className="admin-tabs" aria-label="Разделы">
              {TABS.map((t) => (
                <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => go(t.id)}>
                  <t.icon /> {t.label}
                  {t.id === 'orders' && newCount > 0 && <b className="tab-badge">{newCount}</b>}
                </button>
              ))}
            </nav>
            <div className="admin-top-actions">
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm site-link">Сайт <ArrowRightIcon /></a>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Выйти</button>
            </div>
          </div>
        </header>

        <main className="admin-main">
          {tab === 'orders' && <Orders />}
          {tab === 'products' && <ProductsAdmin />}
          {tab === 'settings' && <Settings onLogout={logout} />}
        </main>

        <nav className="admin-bottom" aria-label="Разделы">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => go(t.id)}>
              <span className="ab-icon"><t.icon />{t.id === 'orders' && newCount > 0 && <b className="tab-badge">{newCount}</b>}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-toasts" role="status" aria-live="polite">
          {toasts.map((t) => <div key={t.id} className={`admin-toast ${t.kind}`}>{t.message}</div>)}
        </div>
      </div>
    </AdminContext.Provider>
  );
}
