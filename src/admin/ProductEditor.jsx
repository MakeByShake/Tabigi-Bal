import { useEffect, useRef, useState } from 'react';
import { useAdmin } from './ctx';
import { compressImage } from './api';
import { CATEGORIES } from '../data/products';
import { CloseIcon, TrashIcon } from '../components/Icons';
import { STOCK } from './constants';

const BADGES = [
  { id: '', label: 'Без метки' },
  { id: 'Жаңа', label: 'Жаңа — новинка' },
  { id: 'Хит', label: 'Хит' },
  { id: 'Сирек', label: 'Сирек — редкий' },
  { id: 'Жеңілдік', label: 'Жеңілдік — скидка' },
];
const EMPTY = { name: '', description: '', category: 'honey', price: '', old_price: '', unit: '', price_note: '', image: '', badge: '', stock: 'in', visible: true };

export default function ProductEditor({ product, onClose, onSaved, onDeleted }) {
  const { call, notify } = useAdmin();
  const [form, setForm] = useState(() => (product ? {
    ...EMPTY, ...product,
    price: product.price ?? '', old_price: product.old_price ?? '', unit: product.unit ?? '',
    price_note: product.price_note ?? '', badge: product.badge ?? '', image: product.image ?? '',
  } : EMPTY));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const isNew = !product;

  useEffect(() => {
    document.body.classList.add('no-scroll');
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('no-scroll'); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const field = (k) => ({ value: form[k], onChange: (e) => set({ [k]: e.target.value }) });

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try {
      const dataUrl = await compressImage(file);
      const { url } = await call('upload', { dataUrl });
      set({ image: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Введите название');
    if (form.price === '' || Number(form.price) < 0) return setError('Введите цену');
    if (form.old_price && Number(form.old_price) <= Number(form.price)) return setError('Старая цена должна быть больше новой');
    setSaving(true); setError('');
    try {
      const { product: saved } = await call('productSave', {
        ...form,
        id: product?.id,
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
      });
      notify(isNew ? 'Товар добавлен' : 'Сохранено');
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Удалить «${product.name}» навсегда? Если товар просто закончился — лучше поставьте «Нет в наличии».`)) return;
    try {
      await call('productDelete', { id: product.id });
      notify('Товар удалён');
      onDeleted(product.id);
    } catch (err) { setError(err.message); }
  };

  const discount = form.old_price && Number(form.old_price) > Number(form.price) ? Math.round((1 - form.price / form.old_price) * 100) : 0;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={isNew ? 'Новый товар' : 'Редактирование'}>
      <div className="sheet-backdrop" onClick={onClose} />
      <form className="sheet" onSubmit={save} noValidate>
        <div className="sheet-head">
          <h2>{isNew ? 'Новый товар' : 'Редактирование'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть"><CloseIcon /></button>
        </div>

        <div className="sheet-body">
          <div className={`photo-drop ${form.image ? 'has-photo' : ''}`}>
            {form.image && <img src={form.image} alt="" />}
            <button type="button" className="btn btn-ghost btn-sm photo-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Загружаем…' : form.image ? 'Сменить фото' : '📷 Добавить фото'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          </div>

          <label className="field"><span>Название *</span><input {...field('name')} placeholder="Например: Жантақ балы" maxLength={120} /></label>

          <div className="field-row">
            <label className="field"><span>Категория</span>
              <select {...field('category')}>{CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            </label>
            <label className="field"><span>Фасовка / вес</span><input {...field('unit')} placeholder="1 кг, 500 г, 1 л" maxLength={40} /></label>
          </div>

          <div className="field-row">
            <label className="field"><span>Цена, ₸ *</span><input {...field('price')} type="number" inputMode="numeric" min="0" placeholder="3500" /></label>
            <label className="field"><span>Старая цена, ₸</span><input {...field('old_price')} type="number" inputMode="numeric" min="0" placeholder="для скидки" /></label>
          </div>
          {discount > 0 && <p className="hint-line">На сайте будет скидка <b>−{discount}%</b> и зачёркнутая старая цена.</p>}

          <label className="field"><span>Описание</span><textarea {...field('description')} rows="4" placeholder="Вкус, цвет, польза…" maxLength={2000} /></label>

          <fieldset className="field">
            <legend>Наличие</legend>
            <div className="segmented three">
              {STOCK.map((s) => (
                <label key={s.id} className={`${form.stock === s.id ? 'is-active' : ''} st-${s.id}`}>
                  <input type="radio" name="stock" checked={form.stock === s.id} onChange={() => set({ stock: s.id })} />{s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="switch-row">
            <span><b>Показывать на сайте</b><small className="muted">Выключите, чтобы временно спрятать товар</small></span>
            <input type="checkbox" className="switch" checked={form.visible} onChange={(e) => set({ visible: e.target.checked })} />
          </label>

          <details className="more-fields" open={!!(form.badge || form.price_note)}>
            <summary>Дополнительно</summary>
            <label className="field"><span>Метка на фото</span>
              <select {...field('badge')}>{BADGES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</select>
            </label>
            <label className="field"><span>Диапазон цены (если цена «от-до»)</span><input {...field('price_note')} placeholder="1000-1400" maxLength={40} /></label>
          </details>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="sheet-foot">
          {!isNew && <button type="button" className="icon-btn danger" onClick={remove} aria-label="Удалить товар"><TrashIcon /></button>}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </form>
    </div>
  );
}
