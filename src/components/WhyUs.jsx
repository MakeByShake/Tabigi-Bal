import { HexIcon, LeafIcon, SparkIcon, TruckIcon } from './Icons';

const FEATURES = [
  {
    icon: LeafIcon,
    title: 'Табиғи өндіріс',
    text: 'Бал тек табиғи гүлдерден жиналады, құрамында химиялық қоспалар жоқ.',
  },
  {
    icon: SparkIcon,
    title: 'Жоғары сапа',
    text: 'Әрбір банка бал мұқият тексеріліп, жоғары сапа стандарттарына сай ұсынылады.',
  },
  {
    icon: TruckIcon,
    title: 'Жылдам жеткізу',
    text: 'Шамалған бойынша балды үйіңіздің табалдырығына дейін тез әрі ыңғайлы жеткіземіз.',
  },
  {
    icon: HexIcon,
    title: 'Әр алуан түрлер',
    text: 'Жантақтан бастап ара сүтіне дейін — әрқайсысы өз дәмімен және пайдасымен ерекше.',
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="section why">
      <div className="container">
        <div className="section-head on-dark">
          <p className="eyebrow">Не үшін біз?</p>
          <h2 className="section-heading">Таза бал — адал жұмыстан басталады</h2>
        </div>
        <div className="why-grid">
          {FEATURES.map(({ icon, title, text }) => { const Icon = icon; return (
            <div key={title} className="why-card reveal">
              <span className="why-icon"><Icon width={26} height={26} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ); })}
        </div>
      </div>
    </section>
  );
}
