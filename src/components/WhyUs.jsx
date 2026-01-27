import { useEffect, useRef } from 'react';

export default function WhyUs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = sectionRef.current?.querySelectorAll('.animate');
    animatedElements?.forEach(element => {
      element.style.animationPlayState = 'paused';
      observer.observe(element);
    });

    return () => {
      animatedElements?.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <section id="why-us" ref={sectionRef}>
      <h2 className="section-title">Не үшін біз?</h2>

      <div className="features-container">
        <div className="feature-card animate" style={{ animationPlayState: 'paused' }}>
          <span className="feature-icon">🏆</span>
          <h3 className="feature-title">Табиғи Өндіріс пен Жоғары Сапа</h3>
          <p className="feature-description">
            Біздің бал тек табиғи гүлдерден жиналады, құрамында химиялық қоспалар жоқ. Әрбір банка бал мұқият тексеріліп, жоғары сапа стандарттарына сай ұсынылады.
          </p>
        </div>

        <div className="feature-card animate" style={{ animationPlayState: 'paused' }}>
          <span className="feature-icon">🚚</span>
          <h3 className="feature-title">Жылдам жеткізу – Шамалған бойынша</h3>
          <p className="feature-description">
            Уақытыңызды бағалаймыз, сондықтан балды үйіңіздің табалдырығына дейін тез әрі ыңғайлы жеткізіп береміз.
          </p>
        </div>

        <div className="feature-card animate" style={{ animationPlayState: 'paused' }}>
          <span className="feature-icon">🌱</span>
          <h3 className="feature-title">Түрлі Түйіндер (Әр алуандылық)</h3>
          <p className="feature-description">
            Клиенттерімізге әртүрлі бал түрлерін ұсынамыз. Әрқайсысы ерекше дәмімен және пайдалы қасиеттерімен ерекшеленеді.
          </p>
        </div>
      </div>
    </section>
  );
}
