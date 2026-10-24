import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { SiteProvider } from './context/SiteProvider';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import HowToOrder from './components/HowToOrder';
import WhyUs from './components/WhyUs';
import Faq from './components/Faq';
import Footer from './components/Footer';
import CartPanel from './components/CartPanel';
import Notification from './components/Notification';
import FloatingActions from './components/FloatingActions';

// Fades sections in as they scroll into view.
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .section-head, .product-card, .how-card');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => { el.classList.add('will-reveal'); io.observe(el); });
    return () => io.disconnect();
  }, []);
}

export default function App() {
  useReveal();
  return (
    <SiteProvider>
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Products />
        <About />
        <HowToOrder />
        <WhyUs />
        <Faq />
      </main>
      <Footer />
      <CartPanel />
      <FloatingActions />
      <Notification />
    </CartProvider>
    </SiteProvider>
  );
}
