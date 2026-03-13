import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, Clock, BookOpen, PlayCircle, FileText, CheckCircle2, Lock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Lesson {
    id: string;
    title: string;
    description: string | null;
    content_type: 'video' | 'pdf' | 'text' | 'quiz';
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_free_preview: boolean;
    completed?: boolean;
}

interface CourseModule {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    level: string | null;
    duration_hours: number | null;
    price: number;
}

export default function CursoDetalle() {
    const { slug } = useParams<{ slug: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (slug) fetchCourse();
    }, [slug, user]);

    const fetchCourse = async () => {
        try {
            // Fetch curso
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('slug', slug)
                .single();

            if (courseError || !courseData) {
                navigate('/academia');
                return;
            }
            setCourse(courseData as Course);

            // Fetch módulos con lecciones
            const { data: modulesData } = await supabase
                .from('course_modules')
                .select(`
          id, title, description, order_index,
          lessons (
            id, title, description, content_type,
            content_url, duration_minutes, order_index, is_free_preview
          )
        `)
                .eq('course_id', courseData.id)
                .order('order_index');

            // Fetch progreso del usuario
            let completedLessonIds: string[] = [];
            if (user) {
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('id, progress_percentage')
                    .eq('user_id', user.id)
                    .eq('course_id', courseData.id)
                    .single();

                if (enrollment) {
                    setIsEnrolled(true);
                    setEnrollmentId(enrollment.id);
                    setProgressPercent(enrollment.progress_percentage || 0);
                }

                const { data: progressData } = await supabase
                    .from('lesson_progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .not('completed_at', 'is', null);

                completedLessonIds = (progressData || []).map((p: { lesson_id: string }) => p.lesson_id);
            }

            // Marcar lecciones completadas
            const enriched = (modulesData || []).map((mod: CourseModule) => ({
                ...mod,
                lessons: (mod.lessons || [])
                    .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
                    .map((l: Lesson) => ({ ...l, completed: completedLessonIds.includes(l.id) })),
            })).sort((a: CourseModule, b: CourseModule) => a.order_index - b.order_index);

            setModules(enriched);
        } catch (err) {
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            toast.error('Inicia sesión para inscribirte');
            navigate('/auth');
            return;
        }
        setEnrolling(true);
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .insert({ user_id: user.id, course_id: course!.id, progress_percentage: 0 })
                .select('id')
                .single();

            if (error) throw error;
            setIsEnrolled(true);
            setEnrollmentId(data.id);
            toast.success('¡Te has inscrito al curso!');
        } catch {
            toast.error('Error al inscribirse. Intenta de nuevo.');
        } finally {
            setEnrolling(false);
        }
    };

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = modules.reduce(
        (sum, m) => sum + m.lessons.filter((l) => l.completed).length, 0
    );

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="h-4 w-4 text-primary" />;
            case 'pdf': return <FileText className="h-4 w-4 text-orange-500" />;
            case 'quiz': return <Award className="h-4 w-4 text-purple-500" />;
            default: return <BookOpen className="h-4 w-4 text-muted-foreground" />;
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="container-app py-16 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                </div>
            </MainLayout>
        );
    }

    if (!course) return null;

    return (
        <MainLayout>
            {/* Header del curso */}
            <div className="bg-gradient-to-br from-dark-green via-medium-green to-sage-green text-white">
                <div className="container-app py-12">
                    <Link
                        to="/academia"
                        className="mb-6 inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Volver al catálogo
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            {course.level && (
                                <Badge className="mb-4 bg-white/20 text-white border-white/30 capitalize">
                                    {course.level}
                                </Badge>
                            )}
                            <h1 className="text-3xl font-bold leading-tight mb-4">{course.title}</h1>
                            {course.description && (
                                <p className="text-white/80 text-lg leading-relaxed mb-6">{course.description}</p>
                            )}
                            <div className="flex flex-wrap gap-6 text-sm text-white/70">
                                {course.duration_hours && (
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {course.duration_hours} horas
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {totalLessons} lecciones
                                </span>
                            </div>
                        </div>

                        {/* Card de acceso */}
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 h-fit">
                            {course.thumbnail_url && (
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="w-full rounded-lg mb-4 aspect-video object-cover"
                                />
                            )}

                            {isEnrolled ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Tu progreso</span>
                                            <span className="font-semibold">{progressPercent}%</span>
                                        </div>
                                        <Progress value={progressPercent} className="h-2 bg-white/20" />
                                        <p className="text-xs text-white/60 mt-1">
                                            {completedLessons} de {totalLessons} lecciones completadas
                                        </p>
                                    </div>
                                    {modules.length > 0 && modules[0].lessons.length > 0 && (
                                        <Button
                                            className="w-full bg-white text-dark-green hover:bg-white/90 font-semibold"
                                            asChild
                                        >
                                            <Link to={`/academia/curso/${slug}/leccion/${modules[0].lessons[0].id}`}>
                                                {progressPercent > 0 ? 'Continuar curso' : 'Comenzar curso'}
                                                <PlayCircle className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-2xl font-bold">
                                        {course.price > 0 ? `$${course.price} MXN` : 'Gratuito'}
                                    </p>
                                    <Button
                                        className="w-full bg-white text-dark-green hover:bg-white/90 font-semibold"
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? 'Inscribiendo...' : 'Inscribirme al curso'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido del curso */}
            <div className="container-app py-12">
                <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Contenido del curso</h2>

                    {modules.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p>El contenido del curso está siendo preparado.</p>
                        </div>
                    ) : (
                        <Accordion type="multiple" defaultValue={modules.map((m) => m.id)}>
                            {modules.map((mod) => (
                                <AccordionItem key={mod.id} value={mod.id} className="border border-border/50 rounded-xl mb-3 px-1">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3 text-left">
                                            <span className="font-semibold">{mod.title}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {mod.lessons.length} lección{mod.lessons.length !== 1 ? 'es' : ''}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        {mod.description && (
                                            <p className="text-sm text-muted-foreground mb-3">{mod.description}</p>
                                        )}
                                        <div className="space-y-2">
                                            {mod.lessons.map((lesson) => {
                                                const canAccess = isEnrolled || lesson.is_free_preview;
                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${canAccess
                                                                ? 'hover:bg-muted/50 cursor-pointer'
                                                                : 'opacity-60 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {lesson.completed ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                        ) : canAccess ? (
                                                            getLessonIcon(lesson.content_type)
                                                        ) : (
                                                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        )}

                                                        {canAccess ? (
                                                            <Link
                                                                to={`/academia/curso/${slug}/leccion/${lesson.id}`}
                                                                className="flex-1 text-sm font-medium hover:text-primary transition-colors"
                                                            >
                                                                {lesson.title}
                                                            </Link>
                                                        ) : (
                                                            <span className="flex-1 text-sm">{lesson.title}</span>
                                                        )}

                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                                            {lesson.is_free_preview && !isEnrolled && (
                                                                <Badge variant="outline" className="text-xs py-0">Preview</Badge>
                                                            )}
                                                            {lesson.duration_minutes > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {lesson.duration_minutes} min
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
