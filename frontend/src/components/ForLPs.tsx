"use client";

import { useTranslation } from "react-i18next";

export default function ForLPs() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("landing.lpFeatures.realWorldAssets"),
      description: t("landing.lpFeatures.realWorldAssetsDesc"),
    },
    {
      title: t("landing.lpFeatures.superiorYields"),
      description: t("landing.lpFeatures.superiorYieldsDesc"),
    },
    {
      title: t("landing.lpFeatures.trustlessSettlements"),
      description: t("landing.lpFeatures.trustlessSettlementsDesc"),
    },
  ];

  return (
    <section id="for-lps" className="bg-surface-dim py-24 px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-4xl font-headline mb-6 text-foreground">
          {t("landing.forLPsTitle")}
        </h2>
        
        <ul className="grid md:grid-cols-3 gap-8 text-left mb-12">
          {features.map((feature, index) => (
            <li key={index} className="flex flex-col gap-4 p-6 bg-surface-container-highest/10 rounded-2xl border border-primary/10">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                currency_exchange
              </span>
              <div>
                <p className="font-bold text-foreground mb-2">{feature.title}</p>
                <p className="text-on-surface-variant text-sm">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="max-w-2xl p-8 bg-primary-container/20 rounded-2xl border border-primary/10">
          <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            {t("landing.lpHowItWorksTitle")}
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {t("landing.lpHowItWorksDesc")}
          </p>
        </div>
      </div>
    </section>
  );
}