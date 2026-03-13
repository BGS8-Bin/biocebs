import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profilesRes, coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        activeStudents: enrollmentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    { icon: Users, text: 'Nuevo usuario registrado', time: 'Hace 5 min', type: 'user' },
    { icon: BookOpen, text: 'Curso "Bioquímica Avanzada" actualizado', time: 'Hace 1 hora', type: 'course' },
    { icon: CheckCircle, text: 'Alumno completó curso', time: 'Hace 2 horas', type: 'success' },
    { icon: ShoppingBag, text: 'Nueva venta en tienda', time: 'Hace 3 horas', type: 'sale' },
  ];

  const pendingTasks = [
    { title: 'Revisar solicitudes de inscripción', count: 5, priority: 'high' },
    { title: 'Aprobar certificados pendientes', count: 3, priority: 'medium' },
    { title: 'Responder mensajes del foro', count: 8, priority: 'low' },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Resumen general de la plataforma BIOCEBS"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Usuarios Totales"
            value={stats.totalUsers}
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Cursos Activos"
            value={stats.totalCourses}
            icon={BookOpen}
            variant="secondary"
          />
          <StatCard
            title="Inscripciones"
            value={stats.totalEnrollments}
            icon={GraduationCap}
            variant="accent"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Ventas del Mes"
            value="$0"
            description="Sin ventas aún"
            icon={ShoppingBag}
            variant="default"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                Tareas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          task.priority === 'high'
                            ? 'border-destructive/50 bg-destructive/10 text-destructive'
                            : task.priority === 'medium'
                            ? 'border-warning/50 bg-warning/10 text-warning'
                            : 'border-muted-foreground/50 bg-muted text-muted-foreground'
                        }
                      >
                        {task.count}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{task.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Resumen por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Capacitaciones</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-secondary">0</p>
                <p className="text-sm text-muted-foreground">Investigación</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Consultoría</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
