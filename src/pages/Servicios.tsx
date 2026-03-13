import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Sparkles, Syringe, Droplet, Stethoscope, Brain, Heart, Dna, Activity, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Servicios() {
  const { t } = useLanguage();

  const mainServices = [
    {
      icon: Sparkles,
      title: t('services.dermapen.title'),
      subtitle: t('services.dermapen.subtitle'),
      description: t('services.dermapen.desc'),
      treatments: ['Regeneración celular IV', 'Tratamiento articular', 'Rejuvenecimiento facial', 'Medicina regenerativa'],
      bgColor: 'bg-sage-green',
    },
    {
      icon: Syringe,
      title: t('services.botox.title'),
      subtitle: t('services.botox.subtitle'),
      description: t('services.botox.desc'),
      treatments: ['Radiofrecuencia', 'Ultrasonido terapéutico', 'Estimulación muscular', 'Fotobiomodulación'],
      bgColor: 'bg-dark-green',
    },
    {
      icon: Droplet,
      title: t('services.iv.title'),
      subtitle: t('services.iv.subtitle'),
      description: t('services.iv.desc'),
      treatments: ['Suero Energético', 'Suero Inmunológico', 'Suero Detox', 'Suero Anti-Age'],
      bgColor: 'bg-light-sage',
    },
    {
      icon: Stethoscope,
      title: t('services.medical.title'),
      subtitle: t('services.medical.subtitle'),
      description: t('services.medical.desc'),
      treatments: ['Evaluación inicial', 'Diagnóstico funcional', 'Plan de tratamiento', 'Seguimiento'],
      bgColor: 'bg-medium-green',
    },
  ];

  const specialties = [
    {
      icon: Brain,
      title: t('services.spec.neuro.title'),
      description: t('services.spec.neuro.desc'),
    },
    {
      icon: Heart,
      title: t('services.spec.cardio.title'),
      description: t('services.spec.cardio.desc'),
    },
    {
      icon: Dna,
      title: t('services.spec.genomic.title'),
      description: t('services.spec.genomic.desc'),
    },
    // { icon: Activity, title: t('services.spec.hormone.title'), description: t('services.spec.hormone.desc') }, // Temporarily disabled
  ];

  const process = [
    {
      step: '01',
      title: t('services.process.step1.title'),
      description: t('services.process.step1.desc'),
    },
    {
      step: '02',
      title: t('services.process.step2.title'),
      description: t('services.process.step2.desc'),
    },
    {
      step: '03',
      title: t('services.process.step3.title'),
      description: t('services.process.step3.desc'),
    },
    {
      step: '04',
      title: t('services.process.step4.title'),
      description: t('services.process.step4.desc'),
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-dark-green py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/4 translate-x-1/4">
            <svg viewBox="0 0 200 200" className="h-full w-full text-off-white">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className="container-app relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-serif text-4xl font-normal italic text-off-white sm:text-5xl lg:text-6xl">
              {t('services.hero.title')}
            </h1>
            <p className="text-lg text-light-sage/90 sm:text-xl">
              {t('services.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('services.main.title')}
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {mainServices.map((service) => (
              <div
                key={service.title}
                className="group overflow-hidden rounded-2xl border border-border/30 bg-background transition-all duration-300 hover:shadow-lg"
              >
                <div className={`${service.bgColor} flex h-48 items-center justify-center`}>
                  <service.icon className="h-20 w-20 text-off-white/90" strokeWidth={1} />
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="mb-1 text-xl font-semibold text-foreground">{service.title}</h3>
                  <p className="mb-4 text-sm text-sage-green">{service.subtitle}</p>
                  <p className="mb-6 text-muted-foreground">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.treatments.map((treatment) => (
                      <span
                        key={treatment}
                        className="rounded-full bg-sage-green/10 px-3 py-1 text-xs font-medium text-sage-green"
                      >
                        {treatment}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('services.specialties.title')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.title}
                className="rounded-2xl bg-background p-6 text-center transition-all duration-300 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sage-green/10">
                  <specialty.icon className="h-7 w-7 text-sage-green" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{specialty.title}</h3>
                <p className="text-sm text-muted-foreground">{specialty.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal text-foreground sm:text-4xl">
              {t('services.process.title')}
            </h2>
            <p className="mb-16 text-muted-foreground">
              {t('services.process.subtitle')}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item, index) => (
              <div key={item.step} className="relative">
                {index < process.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-green text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-green py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal italic text-off-white sm:text-4xl">
              {t('services.cta.title')}
            </h2>
            <p className="mb-8 text-light-sage/80">
              {t('services.cta.desc')}
            </p>
            <Button
              className="bg-sage-green px-8 py-6 text-base font-medium text-white hover:bg-sage-green/90"
              asChild
            >
              <Link to="/contacto">
                {t('services.cta.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
