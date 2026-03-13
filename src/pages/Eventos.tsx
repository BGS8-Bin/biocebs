import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Video, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/money';

const upcomingEvents = [
  {
    id: 1,
    title: 'Webinar: Introducción a la Medicina Funcional',
    description: 'Aprende los fundamentos de la medicina funcional y cómo puede transformar tu salud.',
    date: '20 Enero 2025',
    time: '18:00 - 20:00 hrs',
    location: 'Online (Zoom)',
    type: 'webinar',
    priceAmount: 0,
    isFree: true,
    priceOnRequest: false,
    spots: 50,
    spotsLeft: 23,
  },
  {
    id: 2,
    title: 'Taller: Nutrición y Microbioma',
    description: 'Descubre cómo alimentar correctamente a tu microbioma intestinal para mejorar tu salud integral.',
    date: '27 Enero 2025',
    time: '10:00 - 14:00 hrs',
    location: 'BIOCEBS Centro - Torreón',
    type: 'workshop',
    priceAmount: 800,
    isFree: false,
    priceOnRequest: false,
    spots: 20,
    spotsLeft: 8,
  },
  {
    id: 3,
    title: 'Conferencia: Avances en Medicina Regenerativa',
    description: 'Conoce las últimas investigaciones y tratamientos en medicina regenerativa.',
    date: '10 Febrero 2025',
    time: '17:00 - 19:00 hrs',
    location: 'Hotel Marriott - CDMX',
    type: 'conference',
    priceAmount: 500,
    isFree: false,
    priceOnRequest: false,
    spots: 100,
    spotsLeft: 45,
  },
  {
    id: 4,
    title: 'Gira Médica BIOCEBS 2025',
    description: 'Únete a nuestra gira médica con consultas, tratamientos y conferencias en tu ciudad.',
    date: '15-22 Febrero 2025',
    time: 'Todo el día',
    location: 'Monterrey, NL',
    type: 'tour',
    priceAmount: 0,
    isFree: false,
    priceOnRequest: true,
    spots: null,
    spotsLeft: null,
  },
];

const pastEvents = [
  {
    title: 'Webinar: Suplementación Inteligente',
    date: '15 Dic 2024',
    attendees: 120,
  },
  {
    title: 'Taller: Manejo del Estrés',
    date: '1 Dic 2024',
    attendees: 25,
  },
  {
    title: 'Conferencia: Salud Hormonal',
    date: '15 Nov 2024',
    attendees: 85,
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'webinar': return 'bg-sage-green';
    case 'workshop': return 'bg-medium-green';
    case 'conference': return 'bg-dark-green';
    case 'tour': return 'bg-light-sage text-foreground';
    default: return 'bg-sage-green';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'webinar': return 'Webinar';
    case 'workshop': return 'Taller';
    case 'conference': return 'Conferencia';
    case 'tour': return 'Gira Médica';
    default: return type;
  }
};

export default function Eventos() {
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
              Eventos
            </h1>
            <p className="text-lg text-light-sage/90 sm:text-xl">
              Webinars, talleres, conferencias y giras médicas para tu crecimiento profesional y personal.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-16 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            Próximos Eventos
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl border border-border/30 bg-background transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6 lg:p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${getTypeColor(event.type)}`}>
                      {getTypeLabel(event.type)}
                    </span>
                    <span className="text-lg font-semibold text-sage-green">
                      {event.isFree
                        ? 'Gratuito'
                        : event.priceOnRequest
                        ? 'Consultar'
                        : formatCurrency(event.priceAmount)}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{event.title}</h3>
                  <p className="mb-6 text-muted-foreground">{event.description}</p>
                  
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-sage-green" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-sage-green" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {event.location.includes('Online') ? (
                        <Video className="h-4 w-4 text-sage-green" />
                      ) : (
                        <MapPin className="h-4 w-4 text-sage-green" />
                      )}
                      <span>{event.location}</span>
                    </div>
                    {event.spots && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-sage-green" />
                        <span>{event.spotsLeft} lugares disponibles de {event.spots}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full bg-sage-green hover:bg-sage-green/90">
                    Registrarme
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <h2 className="mb-12 text-center font-serif text-3xl font-normal text-foreground sm:text-4xl">
            Eventos Anteriores
          </h2>
          <div className="mx-auto max-w-2xl">
            <div className="space-y-4">
              {pastEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl bg-background p-4"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-sage-green">{event.attendees} asistentes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-green py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal italic text-off-white sm:text-4xl">
              ¿Quieres organizar un evento con nosotros?
            </h2>
            <p className="mb-8 text-light-sage/80">
              Llevamos conferencias, talleres y consultas a tu empresa o institución.
            </p>
            <Button
              variant="outline"
              className="border-off-white/30 bg-transparent px-8 py-6 text-base font-medium text-off-white hover:bg-off-white/10"
              asChild
            >
              <Link to="/contacto">
                Contactar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
