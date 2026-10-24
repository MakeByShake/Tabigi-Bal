import { useSite } from '../context/site';
import { ArrowRightIcon, LeafIcon, TruckIcon, WhatsAppIcon } from './Icons';

export default function Hero() {
  const { products, wa } = useSite();
  return (
    <section className="hero" id="top">
      <div className="hero-pattern" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span className="dot" /> Шамалған · 2022 жылдан бері</p>
          <h1>
            Табиғи бал — <em>тікелей омартадан</em> үйіңізге
          </h1>
          <p className="hero-lead">
            Қазақстанның түкпір-түкпірінен жиналған бал мен ара өнімдері. Қоспасыз, тексерілген, адал бағамен.
          </p>
          <div className="hero-cta">
            <a href="#products" className="btn btn-primary btn-lg">
              Каталогты көру <ArrowRightIcon />
            </a>
            <a href={wa('Сәлеметсіз бе! Бал туралы сұрағым бар.')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
              <WhatsAppIcon /> Кеңес алу
            </a>
          </div>
          <ul className="hero-stats">
            <li><strong>{products.length}</strong><span>өнім түрі</span></li>
            <li><strong>100%</strong><span>табиғи, қоспасыз</span></li>
            <li><strong>2022</strong><span>жылдан бері</span></li>
          </ul>
        </div>

        <div className="hero-visual">
          <div className="hero-photo">
            <img src="/images/Honey-Nutrition.jpg" alt="Банкаға ағып жатқан бал" fetchPriority="high" />
          </div>
          <div className="hero-chip chip-a"><LeafIcon /> Химиясыз</div>
          <div className="hero-chip chip-b"><TruckIcon /> Шамалған бойынша жеткізу</div>
        </div>
      </div>
    </section>
  );
}
