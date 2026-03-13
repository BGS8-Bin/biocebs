import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, Award, PlayCircle, CheckCircle2 } from 'lucide-react';

interface Enrollment {
  id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    duration_hours: number | null;
    level: string | null;
  };
}

export default function Aula() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress_percentage,
          enrolled_at,
          completed_at,
          course:courses (
            id,
            title,
            slug,
            description,
            thumbnail_url,
            duration_hours,
            level
          )
        `)
        .eq('user_id', user?.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data as unknown as Enrollment[] || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = enrollments.filter(e => !e.completed_at);
  const completedCourses = enrollments.filter(e => e.completed_at);

  if (!user) {
    return (
      <MainLayout>
        <div className="container-app py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
          <p className="text-muted-foreground mb-6">Debes iniciar sesión para acceder a tu aula.</p>
          <Button asChild>
            <Link to="/auth">Iniciar Sesión</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-dark-green py-12">
        <div className="container-app">
          <h1 className="text-3xl font-serif text-off-white mb-2">Mi Aula Virtual</h1>
          <p className="text-light-sage/80">Bienvenido a tu espacio de aprendizaje</p>
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
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Cursos Inscritos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-medium-green/10">
                  <PlayCircle className="h-6 w-6 text-medium-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
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
                  <p className="text-2xl font-bold">{completedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="in-progress">En Progreso ({inProgressCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completados ({completedCourses.length})</TabsTrigger>
            <TabsTrigger value="all">Todos ({enrollments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">Cargando...</p>
            ) : inProgressCourses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes cursos en progreso</p>
                  <Button asChild>
                    <Link to="/academia">Explorar Cursos</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressCourses.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedCourses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aún no has completado ningún curso</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedCourses.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} completed />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No estás inscrito en ningún curso</p>
                  <Button asChild>
                    <Link to="/academia">Explorar Cursos</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} completed={!!enrollment.completed_at} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function CourseCard({ enrollment, completed = false }: { enrollment: Enrollment; completed?: boolean }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gradient-to-br from-dark-green to-medium-green relative">
        {enrollment.course.thumbnail_url && (
          <img 
            src={enrollment.course.thumbnail_url} 
            alt={enrollment.course.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        {completed && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-sage-green">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completado
            </Badge>
          </div>
        )}
        {enrollment.course.level && (
          <Badge variant="outline" className="absolute bottom-3 left-3 text-off-white border-off-white/50">
            {enrollment.course.level}
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{enrollment.course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
            </div>
            <Progress value={enrollment.progress_percentage || 0} className="h-2" />
          </div>
          {enrollment.course.duration_hours && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{enrollment.course.duration_hours} horas</span>
            </div>
          )}
          <Button className="w-full" asChild>
            <Link to={`/academia/curso/${enrollment.course.slug}`}>
              {completed ? 'Revisar Curso' : 'Continuar'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
