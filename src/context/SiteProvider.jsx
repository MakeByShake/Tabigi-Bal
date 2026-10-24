import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteContext } from './site';
import { products as seedProducts } from '../data/products';
import { DEFAULT_SETTINGS } from '../data/settings';
import { whatsappUrl } from '../lib/config';
import { normalizeProduct } from '../lib/product';

const fallbackProducts = seedProducts.map(normalizeProduct);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', products: fallbackProducts, settings: DEFAULT_SETTINGS });

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/catalog', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => setState({
        status: 'ready',
        products: data.products.map(normalizeProduct),
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
      }))
      // No database yet or offline: keep the built-in catalog so the shop still works.
      .catch(() => setState((s) => ({ ...s, status: 'fallback' })))
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, []);

  const wa = useCallback((text) => whatsappUrl(state.settings.whatsapp, text), [state.settings.whatsapp]);
  const productById = useMemo(() => new Map(state.products.map((p) => [p.id, p])), [state.products]);

  const value = useMemo(() => ({ ...state, productById, wa }), [state, productById, wa]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
