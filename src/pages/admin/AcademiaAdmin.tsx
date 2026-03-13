import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Users,
  BookOpen,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  level: string | null;
  duration_hours: number | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  created_at: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AcademiaAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    short_description: '',
    level: 'principiante',
    duration_hours: 0,
    category_id: '',
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('course_categories').select('*').order('name'),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El título y descripción son obligatorios.',
      });
      return;
    }

    const slug = newCourse.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('courses').insert({
      title: newCourse.title,
      slug: `${slug}-${Date.now()}`,
      description: newCourse.description,
      short_description: newCourse.short_description,
      level: newCourse.level,
      duration_hours: newCourse.duration_hours,
      category_id: newCourse.category_id || null,
      instructor_id: user?.id,
      is_published: false,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el curso.',
      });
    } else {
      toast({
        title: 'Curso creado',
        description: 'El curso se ha creado correctamente.',
      });
      setIsCreateOpen(false);
      setNewCourse({
        title: '',
        description: '',
        short_description: '',
        level: 'principiante',
        duration_hours: 0,
        category_id: '',
      });
      fetchData();
    }
  };

  const togglePublish = async (course: Course) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el curso.',
      });
    } else {
      fetchData();
    }
  };

  const toggleFeatured = async (course: Course) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_featured: !course.is_featured })
      .eq('id', course.id);

    if (!error) fetchData();
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    return categories.find((c) => c.id === id)?.name || '-';
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    featured: courses.filter((c) => c.is_featured).length,
  };

  return (
    <AdminLayout
      title="Academia"
      description="Gestión de cursos y contenido educativo"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear nuevo curso</DialogTitle>
              <DialogDescription>
                Complete la información básica del curso.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  placeholder="Nombre del curso"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Descripción corta</Label>
                <Input
                  id="short_description"
                  value={newCourse.short_description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, short_description: e.target.value })
                  }
                  placeholder="Breve descripción para el catálogo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción completa *</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  placeholder="Descripción detallada del curso"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Select
                    value={newCourse.level}
                    onValueChange={(v) => setNewCourse({ ...newCourse, level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newCourse.duration_hours}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        duration_hours: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newCourse.category_id}
                  onValueChange={(v) => setNewCourse({ ...newCourse, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createCourse}>Crear curso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Cursos"
            value={stats.total}
            icon={BookOpen}
            variant="primary"
          />
          <StatCard
            title="Publicados"
            value={stats.published}
            icon={Eye}
            variant="accent"
          />
          <StatCard
            title="Destacados"
            value={stats.featured}
            icon={Star}
            variant="secondary"
          />
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Curso</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No hay cursos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{course.title}</p>
                          {course.is_featured && (
                            <Badge variant="outline" className="mt-1 bg-warning/10 text-warning border-warning/30">
                              <Star className="mr-1 h-3 w-3" />
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCategoryName(course.category_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.duration_hours}h
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          course.is_published
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {course.is_published ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(course)}>
                            {course.is_published ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(course)}>
                            <Star className="mr-2 h-4 w-4" />
                            {course.is_featured ? 'Quitar destacado' : 'Destacar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
