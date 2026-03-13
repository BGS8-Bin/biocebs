import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Users, Award, Plus, Edit, Eye } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  enrollments: { count: number }[];
}

export default function InstructorPanel() {
  const { user, isInstructor, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (isInstructor() || isAdmin())) {
      fetchInstructorCourses();
    }
  }, [user]);

  const fetchInstructorCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          slug,
          description,
          thumbnail_url,
          is_published,
          is_featured,
          created_at,
          enrollments (count)
        `)
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data as unknown as Course[] || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (!isInstructor() && !isAdmin())) {
    return (
      <MainLayout>
        <div className="container-app py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
          <p className="text-muted-foreground mb-6">Solo los instructores pueden acceder a este panel.</p>
          <Button asChild>
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const publishedCourses = courses.filter(c => c.is_published);
  const draftCourses = courses.filter(c => !c.is_published);
  const totalStudents = courses.reduce((acc, course) => acc + (course.enrollments?.[0]?.count || 0), 0);

  return (
    <MainLayout>
      <div className="bg-dark-green py-12">
        <div className="container-app">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif text-off-white mb-2">Panel de Instructor</h1>
              <p className="text-light-sage/80">Gestiona tus cursos y estudiantes</p>
            </div>
            <Button className="bg-sage-green hover:bg-sage-green/90" asChild>
              <Link to="/admin/academia">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-sage-green/10">
                  <BookOpen className="h-6 w-6 text-sage-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Cursos Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-medium-green/10">
                  <Users className="h-6 w-6 text-medium-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Estudiantes Inscritos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-dark-green/10">
                  <Award className="h-6 w-6 text-dark-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Cursos Publicados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos ({courses.length})</TabsTrigger>
            <TabsTrigger value="published">Publicados ({publishedCourses.length})</TabsTrigger>
            <TabsTrigger value="drafts">Borradores ({draftCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">Cargando...</p>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">Aún no has creado ningún curso</p>
                  <Button asChild>
                    <Link to="/admin/academia">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Curso
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <InstructorCourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published">
            {publishedCourses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No tienes cursos publicados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedCourses.map((course) => (
                  <InstructorCourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts">
            {draftCourses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Edit className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No tienes borradores</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftCourses.map((course) => (
                  <InstructorCourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function InstructorCourseCard({ course }: { course: Course }) {
  const studentCount = course.enrollments?.[0]?.count || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gradient-to-br from-dark-green to-medium-green relative">
        {course.thumbnail_url && (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={course.is_published ? "default" : "secondary"}>
            {course.is_published ? 'Publicado' : 'Borrador'}
          </Badge>
          {course.is_featured && (
            <Badge className="bg-amber-500">Destacado</Badge>
          )}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{studentCount} estudiantes inscritos</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/academia/curso/${course.slug}`}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link to={`/admin/academia?edit=${course.id}`}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
