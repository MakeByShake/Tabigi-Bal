export default function Footer() {
  return (
    <footer id="contact">
      <div className="footer-container">
        <div className="footer-info">
          <div className="footer-logo">
            <img src="/images/Tabigi Bal Logo.jpg" alt="Tabigi Ball Logo" />
            <h3>Tabigi Bal</h3>
          </div>
          <p className="footer-description">
            Табиғи бал өндірісі. Көпжылдық тәжірибе мен араға деген сүйіспеншілік арқылы жұмыс істейміз. Табиғат пен оның сыйлаған байлығына сүйене отырып, біздің араларымыз ұрпақтан-ұрпаққа ең таза бал өндіруді жалғастыруда.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/tabigi_balkz" target="_blank" rel="noopener noreferrer">
              <img src="/images/instagram.png" alt="Instagram" />
            </a>
            <a href="https://t.me/+77007380979" target="_blank" rel="noopener noreferrer">
              <img src="/images/telegram.png" alt="Telegram" />
            </a>
            <a href="https://wa.me/+7007380979" target="_blank" rel="noopener noreferrer">
              <img src="/images/apple.png" alt="WhatsApp" />
            </a>
          </div>
        </div>

        <div className="footer-contact">
          <h3>Хабарласу үшін</h3>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>+7 700 738 0979</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>tabigi.ball@gmail.com</span>
          </div>
        </div>

        <div className="footer-location">
          <h3>Тікелей бізден алу үшін</h3>
          <div className="location-item">
            <span className="location-icon">📍</span>
            <span>Kazakhstan, Almaty, Shamalgan, Сауытқан 59</span>
          </div>
          <div className="location-item">
            <span className="location-icon">🕒</span>
            <span>Дүйсенбі - Сенбі: 9:00 - 18:00</span>
          </div>
        </div>
      </div>

      <div className="copyright">
        <p>© 2023 Tabigi Bal.</p>
      </div>
    </footer>
  );
}
