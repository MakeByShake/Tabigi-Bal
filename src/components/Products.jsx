import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function Products() {
  return (
    <section id="products">
      <h2 className="section-title">Біздің өнімдер</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
