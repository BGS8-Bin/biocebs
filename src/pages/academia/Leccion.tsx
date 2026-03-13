import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
    FileText,
    BookOpen,
    Award,
    Clock,
    Menu,
    X,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface LessonData {
    id: string;
    title: string;
    description: string | null;
    content_type: 'video' | 'pdf' | 'text' | 'quiz';
    content_url: string | null;
    content_body: string | null;
    duration_minutes: number;
    order_index: number;
    module_id: string;
    module_title: string;
    module_order: number;
    completed: boolean;
}

export default function Leccion() {
    const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [allLessons, setAllLessons] = useState<LessonData[]>([]);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [marking, setMarking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (slug && lessonId && user) fetchLesson();
        else if (!user) navigate('/auth');
    }, [slug, lessonId, user]);

    const fetchLesson = async () => {
        try {
            // Fetch course
            const { data: course } = await supabase
                .from('courses')
                .select('id')
                .eq('slug', slug)
                .single();

            if (!course) { navigate('/academia'); return; }
            setCourseId(course.id);

            // Verificar inscripción
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id, progress_percentage')
                .eq('user_id', user!.id)
                .eq('course_id', course.id)
                .single();

            if (!enrollment) {
                toast.error('Debes inscribirte para acceder a este curso');
                navigate(`/academia/curso/${slug}`);
                return;
            }
            setProgressPercent(enrollment.progress_percentage || 0);

            // Fetch todos los módulos y lecciones del curso
            const { data: modulesData } = await supabase
                .from('course_modules')
                .select(`
          id, title, order_index,
          lessons (
            id, title, description, content_type, content_url, content_body,
            duration_minutes, order_index, module_id
          )
        `)
                .eq('course_id', course.id)
                .order('order_index');

            // Fetch progreso completado
            const { data: progressData } = await supabase
                .from('lesson_progress')
                .select('lesson_id')
                .eq('user_id', user!.id)
                .not('completed_at', 'is', null);

            const completedIds = new Set((progressData || []).map((p: { lesson_id: string }) => p.lesson_id));

            // Aplanar lecciones ordenadas
            const flat: LessonData[] = (modulesData || [])
                .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
                .flatMap((mod: { id: string; title: string; order_index: number; lessons: LessonData[] }) =>
                    (mod.lessons || [])
                        .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
                        .map((l: LessonData) => ({
                            ...l,
                            module_title: mod.title,
                            module_order: mod.order_index,
                            completed: completedIds.has(l.id),
                        }))
                );

            setAllLessons(flat);
            const current = flat.find((l) => l.id === lessonId);
            if (current) {
                setLesson(current);
                setIsCompleted(current.completed);
            } else {
                navigate(`/academia/curso/${slug}`);
            }
        } catch (err) {
            console.error('Error fetching lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsComplete = async () => {
        if (!user || !lessonId || !courseId || isCompleted) return;
        setMarking(true);
        try {
            await supabase
                .from('lesson_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    completed_at: new Date().toISOString(),
                });

            // Recalcular progreso
            const completedCount = allLessons.filter((l) => l.completed || l.id === lessonId).length;
            const newProgress = Math.round((completedCount / allLessons.length) * 100);

            await supabase
                .from('enrollments')
                .update({ progress_percentage: newProgress, ...(newProgress === 100 ? { completed_at: new Date().toISOString() } : {}) })
                .eq('user_id', user.id)
                .eq('course_id', courseId);

            setIsCompleted(true);
            setProgressPercent(newProgress);
            setAllLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, completed: true } : l));
            toast.success('¡Lección completada!');

            if (newProgress === 100) {
                toast.success('🎉 ¡Felicidades! Completaste el curso. Tu certificado está disponible.', { duration: 5000 });
            }
        } catch (err) {
            toast.error('Error al marcar como completada');
        } finally {
            setMarking(false);
        }
    };

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!lesson) return null;

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* Top bar */}
            <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <Link to={`/academia/curso/${slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Volver al curso
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <Progress value={progressPercent} className="w-32 h-2" />
                    <span className="text-sm text-muted-foreground">{progressPercent}%</span>
                </div>
                {!isCompleted ? (
                    <Button size="sm" onClick={markAsComplete} disabled={marking}>
                        {marking ? 'Guardando...' : 'Marcar como completada'}
                    </Button>
                ) : (
                    <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completada
                    </Badge>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar de lecciones */}
                <aside className={`
          absolute lg:relative z-30 h-full w-72 border-r border-border bg-card overflow-y-auto shrink-0
          transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="p-4">
                        <h3 className="font-semibold text-sm text-foreground mb-4">Contenido del curso</h3>
                        <div className="space-y-1">
                            {allLessons.map((l, idx) => (
                                <Link
                                    key={l.id}
                                    to={`/academia/curso/${slug}/leccion/${l.id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${l.id === lessonId
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-foreground'
                                        }`}
                                >
                                    {l.completed ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                                    ) : l.content_type === 'video' ? (
                                        <PlayCircle className="h-4 w-4 shrink-0 opacity-70" />
                                    ) : l.content_type === 'pdf' ? (
                                        <FileText className="h-4 w-4 shrink-0 opacity-70" />
                                    ) : l.content_type === 'quiz' ? (
                                        <Award className="h-4 w-4 shrink-0 opacity-70" />
                                    ) : (
                                        <BookOpen className="h-4 w-4 shrink-0 opacity-70" />
                                    )}
                                    <span className="line-clamp-2 leading-tight">{l.title}</span>
                                    {l.duration_minutes > 0 && (
                                        <span className="ml-auto shrink-0 text-xs opacity-60">{l.duration_minutes}m</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Overlay móvil */}
                {sidebarOpen && (
                    <div className="absolute inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Contenido de la lección */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 lg:p-10">
                        {/* Módulo + título */}
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{lesson.module_title}</p>
                        <h1 className="text-2xl font-bold text-foreground mb-6">{lesson.title}</h1>

                        {/* Player según tipo */}
                        <div className="rounded-xl overflow-hidden border border-border bg-black/5 mb-8">
                            {lesson.content_type === 'video' && lesson.content_url ? (
                                <div className="aspect-video">
                                    {lesson.content_url.includes('youtube.com') || lesson.content_url.includes('youtu.be') ? (
                                        <iframe
                                            src={lesson.content_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : lesson.content_url.includes('vimeo.com') ? (
                                        <iframe
                                            src={`https://player.vimeo.com/video/${lesson.content_url.split('/').pop()}`}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video controls className="w-full h-full" src={lesson.content_url}>
                                            Tu navegador no soporta reproducción de video.
                                        </video>
                                    )}
                                </div>
                            ) : lesson.content_type === 'pdf' && lesson.content_url ? (
                                <div className="aspect-[4/3]">
                                    <iframe
                                        src={`${lesson.content_url}#toolbar=1&navpanes=0`}
                                        className="w-full h-full"
                                        title={lesson.title}
                                    />
                                </div>
                            ) : lesson.content_type === 'text' && lesson.content_body ? (
                                <div
                                    className="p-8 prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: lesson.content_body }}
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Contenido no disponible aún</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        {lesson.description && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-3">Descripción de la lección</h2>
                                <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
                            </div>
                        )}

                        <Separator className="my-8" />

                        {/* Navegación anterior / siguiente */}
                        <div className="flex items-center justify-between gap-4">
                            {prevLesson ? (
                                <Button variant="outline" asChild>
                                    <Link to={`/academia/curso/${slug}/leccion/${prevLesson.id}`}>
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Anterior: </span>
                                        <span className="line-clamp-1 max-w-[160px]">{prevLesson.title}</span>
                                    </Link>
                                </Button>
                            ) : <div />}

                            {nextLesson && (
                                <Button
                                    asChild
                                    onClick={() => { if (!isCompleted) markAsComplete(); }}
                                >
                                    <Link to={`/academia/curso/${slug}/leccion/${nextLesson.id}`}>
                                        <span className="line-clamp-1 max-w-[160px]">{nextLesson.title}</span>
                                        <span className="hidden sm:inline"> :Siguiente</span>
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
