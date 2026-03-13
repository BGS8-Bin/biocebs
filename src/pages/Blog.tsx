import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const categories = [
  'Todos',
  'Medicina Funcional',
  'Medicina Regenerativa',
  'Salud Mental',
  'Nutrición',
  'Suplementos',
];

const posts = [
  {
    id: 1,
    category: 'Medicina Funcional',
    title: 'Adaptógenos: ¿Qué son y cómo funcionan?',
    excerpt: 'Descubre cómo estos compuestos naturales pueden ayudar a tu cuerpo a adaptarse al estrés y mejorar tu bienestar general.',
    date: '15 Dic 2024',
    readTime: '5 min',
    isNew: true,
  },
  {
    id: 2,
    category: 'Medicina Regenerativa',
    title: 'Células Madre: La medicina del futuro',
    excerpt: 'Conoce cómo las terapias con células madre están revolucionando el tratamiento de enfermedades crónicas.',
    date: '12 Dic 2024',
    readTime: '8 min',
    isNew: false,
  },
  {
    id: 3,
    category: 'Salud Mental',
    title: 'La conexión entre tu intestino y tu estado de ánimo',
    excerpt: 'Explora la fascinante relación entre el microbioma intestinal y la salud mental.',
    date: '10 Dic 2024',
    readTime: '6 min',
    isNew: false,
  },
  {
    id: 4,
    category: 'Nutrición',
    title: 'Los beneficios de los hongos funcionales',
    excerpt: 'Reishi, Chaga, Lion\'s Mane: descubre el poder de los hongos medicinales para tu salud.',
    date: '8 Dic 2024',
    readTime: '7 min',
    isNew: false,
  },
  {
    id: 5,
    category: 'Suplementos',
    title: 'Guía completa de vitamina D',
    excerpt: 'Todo lo que necesitas saber sobre la vitamina del sol y cómo optimizar tus niveles.',
    date: '5 Dic 2024',
    readTime: '10 min',
    isNew: false,
  },
  {
    id: 6,
    category: 'Medicina Funcional',
    title: 'El poder del ayuno intermitente',
    excerpt: 'Beneficios, tipos y cómo implementar el ayuno intermitente de forma segura.',
    date: '1 Dic 2024',
    readTime: '9 min',
    isNew: false,
  },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Blog
            </h1>
            <p className="text-lg text-light-sage/90 sm:text-xl">
              Artículos, recursos y conocimiento sobre salud funcional y bienestar integral.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="border-b border-border bg-background py-8">
        <div className="container-app">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-sage-green hover:bg-sage-green/90' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="bg-background py-16 lg:py-24">
        <div className="container-app">
          {filteredPosts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-xl bg-background transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden rounded-xl bg-gradient-to-br from-sage-green/20 to-dark-green/30">
                    {post.isNew && (
                      <span className="absolute right-4 top-4 rounded-full bg-sage-green px-3 py-1 text-xs font-medium text-white">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-sage-green">
                      {post.category}
                    </span>
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-dark-green">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {post.date} · {post.readTime} lectura
                      </span>
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-sage-green"
                      >
                        Leer más <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No se encontraron artículos.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-off-white py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-normal text-foreground sm:text-4xl">
              Suscríbete a nuestro Newsletter
            </h2>
            <p className="mb-8 text-muted-foreground">
              Recibe artículos exclusivos, consejos de salud y promociones especiales directamente en tu correo.
            </p>
            <div className="mx-auto flex max-w-md gap-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1"
              />
              <Button className="bg-sage-green hover:bg-sage-green/90">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
