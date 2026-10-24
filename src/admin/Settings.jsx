import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from './ctx';

const CONTACT_FIELDS = [
  { k: 'phone', label: 'Телефон (как показывать)', ph: '+7 700 738 0979' },
  { k: 'whatsapp', label: 'Номер WhatsApp для заказов', ph: '77007380979', hint: 'Только цифры, начиная с 7. На этот номер приходят заказы.' },
  { k: 'address', label: 'Адрес самовывоза', ph: 'Шамалған, Сауытқан 59' },
  { k: 'hours', label: 'Часы работы', ph: 'Дүйсенбі – Сенбі, 9:00 – 18:00' },
  { k: 'delivery', label: 'Текст о доставке', ph: 'Шамалған бойынша жеткіземіз…', area: true },
  { k: 'instagram', label: 'Instagram (ссылка)', ph: 'https://instagram.com/…' },
  { k: 'telegram', label: 'Telegram (ссылка)', ph: 'https://t.me/…' },
  { k: 'email', label: 'Email', ph: 'mail@example.com' },
];

function TelegramSetup({ status, reload }) {
  const { call, notify } = useAdmin();
  const [token, setToken] = useState('');
  const [chats, setChats] = useState(null);
  const [bot, setBot] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { notify(e.message, 'error'); } finally { setBusy(false); }
  };

  if (status.connected) {
    return (
      <div className="panel">
        <div className="panel-head"><h2>Telegram-уведомления</h2><span className="pill ok">Подключено</span></div>
        <p className="muted small">О каждом новом заказе бот пишет в чат <b>{status.chatId}</b> (токен {status.token}).</p>
        <div className="row-actions">
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => { await call('telegramTest', {}); notify('Тестовое сообщение отправлено'); })}>Отправить тест</button>
          <button className="btn btn-ghost btn-sm danger-text" disabled={busy} onClick={() => run(async () => {
            if (!confirm('Отключить уведомления в Telegram?')) return;
            await call('telegramSave', { disconnect: true }); notify('Отключено'); reload();
          })}>Отключить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Telegram-уведомления</h2><span className="pill">Не подключено</span></div>
      <ol className="tg-steps">
        <li>Откройте в Telegram <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a>, отправьте <code>/newbot</code>, придумайте имя. Он пришлёт <b>токен</b> — длинную строку с двоеточием.</li>
        <li>
          Вставьте токен сюда:
          <input className="tg-input" value={token} onChange={(e) => setToken(e.target.value.trim())} placeholder="123456789:AA…" />
        </li>
        <li>Откройте своего нового бота{bot && <> (<a href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer">@{bot}</a>)</>} и нажмите <b>Start</b>. Можно добавить бота в общий чат с помощником и написать там любое сообщение.</li>
        <li>
          <button className="btn btn-primary btn-sm" disabled={busy || !token} onClick={() => run(async () => {
            const d = await call('telegramDetect', { token });
            setBot(d.bot); setChats(d.chats);
            if (!d.chats.length) notify('Чат не найден. Нажмите Start у бота и попробуйте ещё раз', 'error');
          })}>Найти чат</button>
          {chats?.length > 0 && (
            <div className="tg-chats">
              {chats.map((c) => (
                <button key={c.id} className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(async () => {
                  await call('telegramSave', { token, chatId: c.id });
                  notify('Готово! Проверьте Telegram'); reload();
                })}>Подключить: {c.title}</button>
              ))}
            </div>
          )}
        </li>
      </ol>
    </div>
  );
}

export default function Settings({ onLogout }) {
  const { call, notify } = useAdmin();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await call('settings');
      setData(d); setForm(d.site);
    } catch (e) { notify(e.message, 'error'); }
  }, [call, notify]);
  useEffect(() => { load(); }, [load]);

  if (!form) return <section className="admin-section"><div className="panel skeleton" style={{ height: 300 }} /></section>;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { site } = await call('settingsSave', form);
      setForm(site); notify('Настройки сохранены');
    } catch (err) { notify(err.message, 'error'); } finally { setSaving(false); }
  };

  return (
    <section className="admin-section">
      <div className="section-bar"><h1>Настройки</h1></div>

      <form onSubmit={save} className="settings-form">
        <div className="panel">
          <div className="panel-head"><h2>Объявление на сайте</h2>
            <input type="checkbox" className="switch" checked={!!form.announcement?.enabled} onChange={(e) => set({ announcement: { ...form.announcement, enabled: e.target.checked } })} aria-label="Показывать объявление" />
          </div>
          <p className="muted small">Полоса над шапкой сайта. Например: «Жаңа бал келді! 🍯» или «Скидка 10% на гречишный мёд».</p>
          <input className="tg-input" value={form.announcement?.text || ''} maxLength={160} placeholder="Текст объявления" onChange={(e) => set({ announcement: { ...form.announcement, text: e.target.value } })} />
          {form.announcement?.enabled && form.announcement?.text && <div className="announcement preview">{form.announcement.text}</div>}
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Контакты</h2></div>
          {CONTACT_FIELDS.map((f) => (
            <label key={f.k} className="field">
              <span>{f.label}</span>
              {f.area
                ? <textarea rows="2" value={form[f.k] || ''} placeholder={f.ph} onChange={(e) => set({ [f.k]: e.target.value })} />
                : <input value={form[f.k] || ''} placeholder={f.ph} onChange={(e) => set({ [f.k]: e.target.value })} inputMode={f.k === 'whatsapp' ? 'numeric' : undefined} />}
              {f.hint && <small className="muted">{f.hint}</small>}
            </label>
          ))}
        </div>

        <div className="sticky-save">
          <button className="btn btn-primary btn-lg btn-block" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить настройки'}</button>
        </div>
      </form>

      <TelegramSetup status={data.telegram} reload={load} />

      <div className="panel">
        <div className="panel-head"><h2>Хранилище фото</h2><span className={`pill ${data.storage.blob ? 'ok' : 'warn'}`}>{data.storage.blob ? 'Подключено' : 'Не подключено'}</span></div>
        {!data.storage.blob && <p className="muted small">Чтобы загружать фото, подключите Vercel Blob (см. инструкцию ADMIN_SETUP.md).</p>}
      </div>

      <button className="btn btn-ghost btn-block" onClick={onLogout}>Выйти из админки</button>
    </section>
  );
}
