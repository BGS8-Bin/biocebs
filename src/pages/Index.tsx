import { Link } from 'react-router-dom';
import { Droplet, Pill, Stethoscope, MessageCircle, RefreshCw, Dna, Zap, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/hooks/useLanguage';
import logoBlanco from '@/assets/logo-blanco.png';

export default function Index() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Dna,
      title: t('services.dermapen.title'),
      subtitle: t('home.service.stemcell.subtitle'),
      description: t('home.service.stemcell.desc'),
      bgColor: 'bg-sage-green',
    },
    {
      icon: Zap,
      title: t('services.botox.title'),
      subtitle: t('home.service.aparato.subtitle'),
      description: t('home.service.aparato.desc'),
      bgColor: 'bg-dark-green',
    },
    {
      icon: Droplet,
      title: t('services.iv.title'),
      subtitle: t('home.service.suero.subtitle'),
      description: t('home.service.suero.desc'),
      bgColor: 'bg-light-sage',
    },
    {
      icon: Pill,
      title: t('home.service.suplementos.title'),
      subtitle: t('home.service.suplementos.subtitle'),
      description: t('home.service.suplementos.desc'),
      bgColor: 'bg-sage-green',
    },
    {
      icon: Stethoscope,
      title: t('services.medical.title'),
      subtitle: t('home.service.consulta.subtitle'),
      description: t('home.service.consulta.desc'),
      bgColor: 'bg-dark-green',
    },
  ];

  const products = [
    {
      name: 'BIO-CALM',
      tagline: t('home.product.biocalm.tagline'),
      description: t('home.product.biocalm.desc'),
      price: '$750.00 MXN',
      image: '/img/BIO-CALM.png',
    },
    {
      name: 'BIO-BRAIN',
      tagline: t('home.product.bibrain.tagline'),
      description: t('home.product.bibrain.desc'),
      price: '$750.00 MXN',
      image: '/img/BIO-BRAIN.png',
    },
    {
      name: 'BIO-GASTRO',
      tagline: t('home.product.bigastro.tagline'),
      description: t('home.product.bigastro.desc'),
      price: '$750.00 MXN',
      image: '/img/BIO-GASTRO.png',
    },
  ];

  const steps = [
    {
      icon: MessageCircle,
      number: '01',
      title: t('services.process.step1.title'),
      description: t('services.process.step1.desc'),
    },
    {
      icon: Search,
      number: '02',
      title: t('services.process.step2.title'),
      description: t('services.process.step2.desc'),
    },
    {
      icon: Stethoscope,
      number: '03',
      title: t('services.process.step3.title'),
      description: t('services.process.step3.desc'),
    },
    {
      icon: RefreshCw,
      number: '04',
      title: t('services.process.step4.title'),
      description: t('services.process.step4.desc'),
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-dark-green py-24 lg:py-32">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/4 translate-x-1/4">
            <svg viewBox="0 0 200 200" className="h-full w-full text-off-white">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M100 20 Q140 60 140 100 Q140 140 100 180 Q60 140 60 100 Q60 60 100 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4">
            <svg viewBox="0 0 200 200" className="h-full w-full text-off-white">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M60 100 Q100 60 140 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className="container-app relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <img src={logoBlanco} alt="BIOCEBS" className="h-40 w-auto object-contain" />
            </div>

            <h1 className="mb-6 font-serif text-4xl font-normal italic tracking-wide text-off-white sm:text-5xl lg:text-6xl">
              Siente la transformación, regresa al origen
            </h1>
            <p className="mb-10 text-lg text-light-sage/90 sm:text-xl">
              {t('home.hero.subtitle')}
            </p>
            <Button
              className="bg-sage-green px-8 py-6 text-base font-medium text-white hover:bg-sage-green/90"
              asChild
            >
              <Link to="/servicios">
                {t('home.hero.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('home.services.title')}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.title}
                to="/servicios"
                className="group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <div className={`${service.bgColor} flex h-48 items-center justify-center`}>
                  <service.icon className="h-16 w-16 text-off-white/90" strokeWidth={1} />
                </div>
                <div className="bg-background p-5">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{service.title}</h3>
                  <p className="text-sm text-sage-green">{service.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground italic sm:text-4xl">
            {t('home.products.title')}
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.name}
                className="group flex flex-col transition-all duration-300"
              >
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                </div>
                <div className="px-2">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-serif text-lg font-medium text-foreground">{product.name}</h4>
                    <span className="text-sm font-semibold text-dark-green">{product.price}</span>
                  </div>
                  <Link
                    to="/contacto"
                    className="inline-flex items-center text-xs font-medium tracking-wide text-sage-green uppercase transition-colors hover:text-dark-green"
                  >
                    <span>{t('home.product.link')}</span>
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First Time Section */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal text-foreground italic sm:text-4xl">
              {t('home.process.title')}
            </h2>
            <p className="mb-16 text-sage-green">
              {t('home.process.subtitle')}
            </p>

            <div className="mb-12 grid gap-8 grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center">
                    <step.icon className="h-12 w-12 text-medium-green" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-medium text-foreground">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-sm text-sage-green">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <Button
              className="bg-sage-green px-8 py-6 text-base font-medium text-white hover:bg-sage-green/90"
              asChild
            >
              <Link to="/contacto">
                {t('home.process.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section - Temporarily disabled */}
    </MainLayout>
  );
}
