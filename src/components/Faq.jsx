import { CONTACTS, whatsappUrl } from '../lib/config';
import { ChevronDownIcon, WhatsAppIcon } from './Icons';

const FAQ = [
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
    a: 'Иә, Шамалған бойынша жеткізіп береміз. Басқа елді мекендерге жеткізу жөнінде WhatsApp арқылы жазыңыз — келісеміз.',
  },
  {
    q: 'Өзім келіп алуыма бола ма?',
    a: `Әрине. Мекенжай: ${CONTACTS.address}. Жұмыс уақыты: ${CONTACTS.hours}. Келер алдында қоңырау шалуды ұсынамыз.`,
  },
  {
    q: 'Қай балды таңдаған дұрыс?',
    a: 'Дәмі нәзік бал ұнаса — жантақ немесе ақ акация. Қанық дәм ұнаса — гречиха. Иммунитет үшін — разнотравие мен ара өнімдері. Күмәндансаңыз, WhatsApp-қа жазыңыз — кеңес береміз.',
  },
];

export default function Faq() {
  return (
    <section id="faq" className="section faq">
      <div className="container faq-inner">
        <div className="faq-intro">
          <p className="eyebrow">Сұрақ-жауап</p>
          <h2 className="section-heading">Жиі қойылатын сұрақтар</h2>
          <p className="section-sub">Жауап таппадыңыз ба? Бізге тікелей жазыңыз — қуана жауап береміз.</p>
          <a href={whatsappUrl('Сәлеметсіз бе! Сұрағым бар.')} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <WhatsAppIcon /> Сұрақ қою
          </a>
        </div>
        <div className="faq-list">
          {FAQ.map((item, i) => (
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
