import { useSite } from '../context/site';
import { ChevronDownIcon, WhatsAppIcon } from './Icons';

const buildFaq = (s) => [
  {
    q: 'Бал неге қатайып қалды? Бұл қалыпты ма?',
    a: 'Иә. Кристалдану — табиғи балдың қалыпты қасиеті, ол балдың сапасы мен пайдасын төмендетпейді. Сұйық күйге келтіру үшін банканы 40°C-тан аспайтын жылы суға қойыңыз.',
  },
  {
    q: 'Балды қалай дұрыс сақтау керек?',
    a: 'Қақпағы жабық ыдыста, күн сәулесі түспейтін салқын жерде сақтаңыз. Ылғал мен иісі күшті заттардан алыс ұстаңыз, балға ылғал қасық салмаңыз.',
  },
  {
    q: 'Жеткізу бар ма?',
    a: `Иә. ${s.delivery} Толығырақ WhatsApp арқылы жазыңыз.`,
  },
  {
    q: 'Өзім келіп алуыма бола ма?',
    a: `Әрине. Мекенжай: ${s.address}. Жұмыс уақыты: ${s.hours}. Келер алдында қоңырау шалуды ұсынамыз.`,
  },
  {
    q: 'Қай балды таңдаған дұрыс?',
    a: 'Дәмі нәзік бал ұнаса — жантақ немесе ақ акация. Қанық дәм ұнаса — гречиха. Иммунитет үшін — разнотравие мен ара өнімдері. Күмәндансаңыз, WhatsApp-қа жазыңыз — кеңес береміз.',
  },
];

export default function Faq() {
  const { settings, wa } = useSite();
  const faq = buildFaq(settings);
  return (
    <section id="faq" className="section faq">
      <div className="container faq-inner">
        <div className="faq-intro">
          <p className="eyebrow">Сұрақ-жауап</p>
          <h2 className="section-heading">Жиі қойылатын сұрақтар</h2>
          <p className="section-sub">Жауап таппадыңыз ба? Бізге тікелей жазыңыз — қуана жауап береміз.</p>
          <a href={wa('Сәлеметсіз бе! Сұрағым бар.')} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <WhatsAppIcon /> Сұрақ қою
          </a>
        </div>
        <div className="faq-list">
          {faq.map((item, i) => (
            <details key={item.q} className="faq-item" open={i === 0}>
              <summary>
                {item.q}
                <ChevronDownIcon />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
