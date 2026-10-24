import { CartIcon, ChatIcon, CheckIcon } from './Icons';

const STEPS = [
  { icon: CartIcon, title: 'Таңдаңыз', text: 'Каталогтан балды таңдап, қажет санын себетке қосыңыз.' },
  { icon: CheckIcon, title: 'Деректерді толтырыңыз', text: 'Атыңыз бен телефоныңызды жазып, жеткізу немесе өзі алып кету тәсілін таңдаңыз.' },
  { icon: ChatIcon, title: 'WhatsApp-қа жіберіңіз', text: 'Тапсырыс дайын хабарлама болып ашылады. Біз тез арада хабарласып, растаймыз.' },
];

export default function HowToOrder() {
  return (
    <section id="how" className="section how">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Оңай және жылдам</p>
          <h2 className="section-heading">Қалай тапсырыс беруге болады?</h2>
        </div>
        <ol className="how-grid">
          {STEPS.map(({ icon, title, text }, i) => { const Icon = icon; return (
            <li key={title} className="how-card">
              <span className="how-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="how-icon"><Icon width={24} height={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ); })}
        </ol>
      </div>
    </section>
  );
}
