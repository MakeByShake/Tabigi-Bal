export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container about-inner">
        <div className="about-photo">
          <img src="/images/photo_2025-09-01_15-40-41.jpg" alt="Хамза — Tabigi Bal негізін қалаушы" loading="lazy" />
          <div className="about-since">
            <strong>2022</strong>
            <span>12 жасымнан бастап</span>
          </div>
        </div>
        <div className="about-text">
          <p className="eyebrow">Біз туралы</p>
          <h2 className="section-heading">Сәлем! Менің атым — Хамза</h2>
          <p>
            Бал саласындағы жолымды 2022 жылы, 12 жасымда бастадым. Осы уақыт ішінде Қазақстанның
            түкпір-түкпірінен түрлі бал жинап, оны тиімді бағада ұсынып келемін.
          </p>
          <p>
            Менің мақсатым — өз кәсібімді дамытып қана қоймай, сіздерге зиянды қанттың орнын сапалы әрі
            табиғи балмен алмастыруға көмектесу.
          </p>
          <ul className="about-points">
            <li>Әр банка бал мұқият тексеріледі</li>
            <li>Тиімді әрі адал баға</li>
            <li>Кез келген сұраққа WhatsApp арқылы жауап беремін</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
