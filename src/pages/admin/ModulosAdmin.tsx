import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, PlayCircle, FileText, BookOpen, Award } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    content_type: string;
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_free_preview: boolean;
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
}

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
    video: <PlayCircle className="h-4 w-4 text-primary" />,
    pdf: <FileText className="h-4 w-4 text-orange-500" />,
    quiz: <Award className="h-4 w-4 text-purple-500" />,
    text: <BookOpen className="h-4 w-4 text-muted-foreground" />,
};

export default function ModulosAdmin() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [loading, setLoading] = useState(false);

    // Módulo dialog
    const [moduleDialog, setModuleDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

    // Lección dialog
    const [lessonDialog, setLessonDialog] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [targetModuleId, setTargetModuleId] = useState<string>('');
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        content_type: 'video',
        content_url: '',
        content_body: '',
        duration_minutes: 0,
        is_free_preview: false,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) fetchModules();
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title').order('title');
        setCourses(data || []);
    };

    const fetchModules = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('course_modules')
            .select(`
        id, title, description, order_index,
        lessons (id, title, content_type, content_url, duration_minutes, order_index, is_free_preview)
      `)
            .eq('course_id', selectedCourseId)
            .order('order_index');

        setModules(
            ((data || []) as unknown as CourseModule[]).map((m: CourseModule) => ({
                ...m,
                lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
            })).sort((a, b) => a.order_index - b.order_index)
        );
        setLoading(false);
    };

    // === MÓDULOS ===
    const openModuleDialog = (mod?: CourseModule) => {
        setEditingModule(mod || null);
        setModuleForm({ title: mod?.title || '', description: mod?.description || '' });
        setModuleDialog(true);
    };

    const saveModule = async () => {
        if (!moduleForm.title.trim()) { toast.error('El título es obligatorio'); return; }
        try {
            if (editingModule) {
                await supabase.from('course_modules').update({ title: moduleForm.title, description: moduleForm.description }).eq('id', editingModule.id);
                toast.success('Módulo actualizado');
            } else {
                const maxOrder = Math.max(0, ...modules.map(m => m.order_index));
                await supabase.from('course_modules').insert({
                    course_id: selectedCourseId,
                    title: moduleForm.title,
                    description: moduleForm.description,
                    order_index: maxOrder + 1,
                });
                toast.success('Módulo creado');
            }
            setModuleDialog(false);
            fetchModules();
        } catch { toast.error('Error al guardar el módulo'); }
    };

    const deleteModule = async (id: string) => {
        if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return;
        await supabase.from('course_modules').delete().eq('id', id);
        toast.success('Módulo eliminado');
        fetchModules();
    };

    // === LECCIONES ===
    const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
        setTargetModuleId(moduleId);
        setEditingLesson(lesson || null);
        setLessonForm({
            title: lesson?.title || '',
            description: '',
            content_type: lesson?.content_type || 'video',
            content_url: lesson?.content_url || '',
            content_body: '',
            duration_minutes: lesson?.duration_minutes || 0,
            is_free_preview: lesson?.is_free_preview || false,
        });
        setLessonDialog(true);
    };

    const saveLesson = async () => {
        if (!lessonForm.title.trim()) { toast.error('El título es obligatorio'); return; }
        try {
            const mod = modules.find(m => m.id === targetModuleId);
            const maxOrder = Math.max(0, ...(mod?.lessons || []).map(l => l.order_index));

            if (editingLesson) {
                await supabase.from('lessons').update({
                    title: lessonForm.title,
                    content_type: lessonForm.content_type,
                    content_url: lessonForm.content_url || null,
                    content_body: lessonForm.content_body || null,
                    duration_minutes: lessonForm.duration_minutes,
                    is_free_preview: lessonForm.is_free_preview,
                }).eq('id', editingLesson.id);
                toast.success('Lección actualizada');
            } else {
                await supabase.from('lessons').insert({
                    module_id: targetModuleId,
                    title: lessonForm.title,
                    content_type: lessonForm.content_type,
                    content_url: lessonForm.content_url || null,
                    content_body: lessonForm.content_body || null,
                    duration_minutes: lessonForm.duration_minutes,
                    is_free_preview: lessonForm.is_free_preview,
                    order_index: maxOrder + 1,
                });
                toast.success('Lección creada');
            }
            setLessonDialog(false);
            fetchModules();
        } catch { toast.error('Error al guardar la lección'); }
    };

    const deleteLesson = async (id: string) => {
        if (!confirm('¿Eliminar esta lección?')) return;
        await supabase.from('lessons').delete().eq('id', id);
        toast.success('Lección eliminada');
        fetchModules();
    };

    return (
        <AdminLayout title="Módulos y Lecciones" description="Gestiona el contenido de cada curso">
            <div className="space-y-6">

                {/* Selector de curso */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <Label>Seleccionar Curso</Label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Elige un curso..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCourseId && (
                        <Button onClick={() => openModuleDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Módulo
                        </Button>
                    )}
                </div>

                {/* Lista de módulos */}
                {loading ? (
                    <p className="text-center text-muted-foreground py-10">Cargando...</p>
                ) : !selectedCourseId ? (
                    <p className="text-center text-muted-foreground py-16">Selecciona un curso para ver sus módulos</p>
                ) : modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="mb-4">Este curso no tiene módulos aún</p>
                        <Button onClick={() => openModuleDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Crear primer módulo
                        </Button>
                    </div>
                ) : (
                    <Accordion type="multiple" defaultValue={modules.map(m => m.id)}>
                        {modules.map((mod) => (
                            <AccordionItem key={mod.id} value={mod.id} className="border border-border/50 rounded-xl mb-3">
                                <AccordionTrigger className="px-4 hover:no-underline">
                                    <div className="flex items-center gap-3 flex-1 text-left">
                                        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                                        <span className="font-semibold">{mod.title}</span>
                                        <Badge variant="outline">{mod.lessons.length} lección{mod.lessons.length !== 1 ? 'es' : ''}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        {mod.description && (
                                            <p className="text-sm text-muted-foreground">{mod.description}</p>
                                        )}
                                        <div className="flex gap-2 ml-auto">
                                            <Button variant="outline" size="sm" onClick={() => openModuleDialog(mod)}>
                                                <Pencil className="h-3 w-3 mr-1" /> Editar
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteModule(mod.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        {mod.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-4 py-3">
                                                <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
                                                {CONTENT_TYPE_ICONS[lesson.content_type]}
                                                <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                                                {lesson.is_free_preview && (
                                                    <Badge variant="outline" className="text-xs py-0">Preview</Badge>
                                                )}
                                                {lesson.duration_minutes > 0 && (
                                                    <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => openLessonDialog(mod.id, lesson)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteLesson(lesson.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="outline" size="sm" onClick={() => openLessonDialog(mod.id)}>
                                        <Plus className="mr-2 h-3 w-3" /> Agregar lección
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Dialog de módulo */}
            <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModule ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Título del módulo *</Label>
                            <Input value={moduleForm.title} onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Introducción a la Bioquímica" />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción (opcional)</Label>
                            <Textarea value={moduleForm.description} onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Descripción breve del módulo" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModuleDialog(false)}>Cancelar</Button>
                        <Button onClick={saveModule}>Guardar módulo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de lección */}
            <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? 'Editar lección' : 'Nueva lección'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="space-y-2">
                            <Label>Título *</Label>
                            <Input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la lección" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de contenido</Label>
                            <Select value={lessonForm.content_type} onValueChange={v => setLessonForm(f => ({ ...f, content_type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">🎬 Video (YouTube / Vimeo / URL directa)</SelectItem>
                                    <SelectItem value="pdf">📄 PDF (URL del archivo)</SelectItem>
                                    <SelectItem value="text">📝 Texto / HTML</SelectItem>
                                    <SelectItem value="quiz">✅ Evaluación / Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(lessonForm.content_type === 'video' || lessonForm.content_type === 'pdf') && (
                            <div className="space-y-2">
                                <Label>URL del contenido</Label>
                                <Input value={lessonForm.content_url} onChange={e => setLessonForm(f => ({ ...f, content_url: e.target.value }))} placeholder="https://..." />
                            </div>
                        )}
                        {lessonForm.content_type === 'text' && (
                            <div className="space-y-2">
                                <Label>Contenido (texto o HTML básico)</Label>
                                <Textarea value={lessonForm.content_body} onChange={e => setLessonForm(f => ({ ...f, content_body: e.target.value }))} rows={6} placeholder="<p>Contenido de la lección...</p>" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duración (minutos)</Label>
                                <Input type="number" min={0} value={lessonForm.duration_minutes} onChange={e => setLessonForm(f => ({ ...f, duration_minutes: +e.target.value }))} />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={lessonForm.is_free_preview} onChange={e => setLessonForm(f => ({ ...f, is_free_preview: e.target.checked }))} className="rounded" />
                                    <span className="text-sm">Preview gratuito</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancelar</Button>
                        <Button onClick={saveLesson}>Guardar lección</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
