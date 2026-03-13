import { MainLayout } from '@/components/layout/MainLayout';
import { Users, Target, Heart, Lightbulb, Shield, Microscope, Eye } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const team = [
  { name: 'Dra. Selene', roleKey: 'about.team.role.medical_director', image: '/img/team/dra selene pagina 1.png' },
  { name: 'Samir', roleKey: 'about.team.role.director', image: '/img/team/Samir página 1.png' },
];

const values = [
  { icon: Shield, titleKey: 'about.values.ethics', descKey: 'about.values.ethics.desc' },
  { icon: Microscope, titleKey: 'about.values.science', descKey: 'about.values.science.desc' },
  { icon: Lightbulb, titleKey: 'about.values.innovation', descKey: 'about.values.innovation.desc' },
  { icon: Heart, titleKey: 'about.values.humanism', descKey: 'about.values.humanism.desc' },
  { icon: Users, titleKey: 'about.values.community', descKey: 'about.values.community.desc' },
  { icon: Eye, titleKey: 'about.values.transparency', descKey: 'about.values.transparency.desc' },
];

const departments = [
  {
    name: 'BIOMED',
    descKey: 'about.dept.biomed.desc',
    color: 'bg-dark-green',
  },
  {
    name: 'BIODESIGN',
    descKey: 'about.dept.biodesign.desc',
    color: 'bg-sage-green',
  },
  {
    name: 'BIORGANIC',
    descKey: 'about.dept.biorganic.desc',
    color: 'bg-medium-green',
  },
  {
    name: 'BIOACADEMY',
    descKey: 'about.dept.bioacademy.desc',
    color: 'bg-light-sage',
  },
];

export default function Nosotros() {
  const { t } = useLanguage();

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
              {t('about.hero.title')}
            </h1>
            <p className="text-lg text-light-sage/90 sm:text-xl">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="mb-6 font-serif text-3xl font-normal text-foreground">
                  {t('about.who.title')}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t('about.who.p1')}
                </p>
                <p className="mb-4 text-muted-foreground">
                  {t('about.who.p2')}
                </p>
                <p className="text-muted-foreground">
                  {t('about.who.p3')}
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-sage-green/10 to-dark-green/10 shadow-lg">
                  <img
                    src="/img/biocebsport.jpg"
                    alt="Biocebs Sport"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-2xl bg-background p-8 lg:p-12">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-sage-green/10">
                <Target className="h-7 w-7 text-sage-green" />
              </div>
              <h3 className="mb-4 font-serif text-2xl font-normal text-foreground">{t('about.mission.title')}</h3>
              <p className="text-muted-foreground">
                {t('about.mission.desc')}
              </p>
            </div>
            <div className="rounded-2xl bg-background p-8 lg:p-12">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-sage-green/10">
                <Users className="h-7 w-7 text-sage-green" />
              </div>
              <h3 className="mb-4 font-serif text-2xl font-normal text-foreground">{t('about.vision.title')}</h3>
              <p className="text-muted-foreground">
                {t('about.vision.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('about.values.title')}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.titleKey} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-green/10">
                  <value.icon className="h-8 w-8 text-sage-green" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{t(value.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(value.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments - Temporarily disabled */}
      <section className="hidden bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('about.departments.title')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept) => (
              <div key={dept.name} className="overflow-hidden rounded-xl bg-background">
                <div className={`${dept.color} flex h-32 items-center justify-center`}>
                  <span className="text-2xl font-bold text-off-white">{dept.name}</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">{t(dept.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            {t('about.team.title')}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 max-w-xl mx-auto w-full">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-sage-green/20 bg-gradient-to-br from-sage-green/10 to-dark-green/10 shadow-md transition-transform duration-300 hover:scale-105">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition-opacity duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-sage-green">{t(member.roleKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
