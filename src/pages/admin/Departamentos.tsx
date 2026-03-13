import { useState, useEffect } from 'react';
import { Plus, Building2, Users, FileText, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

const colorOptions = [
  { value: 'bg-primary', label: 'Primario' },
  { value: 'bg-secondary', label: 'Secundario' },
  { value: 'bg-accent', label: 'Acento' },
  { value: 'bg-warning', label: 'Advertencia' },
  { value: 'bg-success', label: 'Éxito' },
];

export default function Departamentos() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDept, setNewDept] = useState({ name: '', description: '', color: 'bg-primary' });
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDepartments(data || []);

      // Fetch document counts per department
      const { data: docs } = await supabase
        .from('documents')
        .select('department_id');
      
      if (docs) {
        const counts: Record<string, number> = {};
        docs.forEach((doc) => {
          if (doc.department_id) {
            counts[doc.department_id] = (counts[doc.department_id] || 0) + 1;
          }
        });
        setDocumentCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los departamentos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async () => {
    if (!newDept.name) return;

    const { error } = await supabase.from('departments').insert({
      name: newDept.name,
      description: newDept.description || null,
      color: newDept.color,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el departamento.',
      });
    } else {
      toast({
        title: 'Departamento creado',
        description: 'El departamento se ha creado correctamente.',
      });
      setNewDept({ name: '', description: '', color: 'bg-primary' });
      setIsCreateOpen(false);
      fetchDepartments();
    }
  };

  const updateDepartment = async () => {
    if (!editingDept) return;

    const { error } = await supabase
      .from('departments')
      .update({
        name: editingDept.name,
        description: editingDept.description,
        color: editingDept.color,
      })
      .eq('id', editingDept.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el departamento.',
      });
    } else {
      toast({
        title: 'Departamento actualizado',
        description: 'El departamento se ha actualizado correctamente.',
      });
      setIsEditOpen(false);
      setEditingDept(null);
      fetchDepartments();
    }
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el departamento.',
      });
    } else {
      toast({
        title: 'Departamento eliminado',
        description: 'El departamento se ha eliminado correctamente.',
      });
      fetchDepartments();
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Departamentos" description="Gestión de áreas organizacionales">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Departamentos"
      description="Gestión de áreas organizacionales"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear departamento</DialogTitle>
              <DialogDescription>
                Agrega un nuevo departamento o área de trabajo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="Nombre del departamento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Descripción breve"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={newDept.color}
                  onValueChange={(v) => setNewDept({ ...newDept, color: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${opt.value}`} />
                          {opt.label}
                        </div>
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
              <Button onClick={createDepartment}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar departamento</DialogTitle>
            <DialogDescription>
              Modifica la información del departamento.
            </DialogDescription>
          </DialogHeader>
          {editingDept && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingDept.description || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select
                  value={editingDept.color}
                  onValueChange={(v) => setEditingDept({ ...editingDept, color: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${opt.value}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateDepartment}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No hay departamentos</p>
          </div>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id} className="border-border/50 transition-shadow hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dept.color}/10`}>
                    <Building2 className={`h-5 w-5 ${dept.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteDepartment(dept.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {dept.description || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{memberCounts[dept.id] || 0} miembros</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{documentCounts[dept.id] || 0} docs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
