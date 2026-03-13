import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

export default function Contacto() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      titleKey: 'contact.label.address',
      details: [
        'Plaza Almanara, Torreón, Coah.',
        'Periférico Raúl López Sánchez 5000, Local 39',
        '27018, Col. El Fresno, Torreón, Coahuila, México',
      ],
    },
    {
      icon: Phone,
      titleKey: 'contact.label.phone',
      details: ['870 146 7617'],
    },
    {
      icon: Mail,
      titleKey: 'contact.label.email',
      details: ['contacto@bio-cebs.com'],
    },
    {
      icon: Clock,
      titleKey: 'contact.label.hours',
      details: [
        'Lunes a Viernes: 9:00 – 02:30 / 4:00 – 06:30',
        'Sábado: 10:00 – 02:30',
      ],
    },
  ];

  const subjectKeys = [
    'contact.subject.medical',
    'contact.subject.services',
    'contact.subject.products',
    'contact.subject.events',
    'contact.subject.lms',
    'contact.subject.partnerships',
    'contact.subject.other',
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('contact.toast.title'),
      description: t('contact.toast.desc'),
    });

    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

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
              {t('contact.hero.title')}
            </h1>
            <p className="text-lg text-light-sage/90 sm:text-xl">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="mb-2 font-serif text-2xl font-normal text-foreground">
                {t('contact.form.title')}
              </h2>
              <p className="mb-8 text-muted-foreground">
                {t('contact.form.subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.form.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.form.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('contact.form.subject.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectKeys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {t(key)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.form.message')} *</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sage-green py-6 hover:bg-sage-green/90 sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    t('contact.form.sending')
                  ) : (
                    <>
                      {t('contact.form.send')}
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="mb-2 font-serif text-2xl font-normal text-foreground">
                {t('contact.info.title')}
              </h2>
              <p className="mb-8 text-muted-foreground">
                {t('contact.info.subtitle')}
              </p>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.titleKey} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-green/10">
                      <info.icon className="h-5 w-5 text-sage-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t(info.titleKey)}</h3>
                      {info.details.map((detail, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp Button */}
              <div className="mt-8 rounded-2xl bg-sage-green/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{t('contact.whatsapp.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('contact.whatsapp.subtitle')}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-sage-green text-sage-green hover:bg-sage-green hover:text-white"
                    asChild
                  >
                    <a
                      href="https://wa.me/528701467617"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('contact.whatsapp.button')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal text-foreground">
              {t('contact.map.title')}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {t('contact.map.subtitle')}
            </p>
            <div className="aspect-video overflow-hidden rounded-2xl shadow-lg border border-border/30">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d591.8413262196952!2d-103.41007290185759!3d25.583879672863702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x868fdb004e339345%3A0xf5bd05db6d3a17aa!2sBIOCEBS!5e0!3m2!1sen!2smx!4v1773442008554!5m2!1sen!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
