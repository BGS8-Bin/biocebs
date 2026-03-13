import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ShoppingBag, BookOpen, Award, User, ChevronRight, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/money';

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
}

interface Enrollment {
    id: string;
    progress_percentage: number;
    enrolled_at: string;
    course: { title: string; slug: string; thumbnail_url: string | null };
}

interface Certificate {
    id: string;
    issued_at: string;
    verification_code: string;
    course: { title: string };
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'En proceso',
    completed: 'Completado',
    cancelled: 'Cancelado',
};
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function MiCuenta() {
    const { user, profile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [ordersRes, enrollmentsRes, certsRes] = await Promise.all([
                supabase
                    .from('orders')
                    .select('id, created_at, total, status')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('enrollments')
                    .select(`id, progress_percentage, enrolled_at, course:courses(title, slug, thumbnail_url)`)
                    .eq('user_id', user!.id)
                    .order('enrolled_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('certificates')
                    .select(`id, issued_at, verification_code, course:courses(title)`)
                    .eq('user_id', user!.id)
                    .order('issued_at', { ascending: false }),
            ]);

            setOrders((ordersRes.data || []) as Order[]);
            setEnrollments((enrollmentsRes.data || []) as unknown as Enrollment[]);
            setCertificates((certsRes.data || []) as unknown as Certificate[]);
        } catch (err) {
            console.error('Error fetching account data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container-app py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Mi Cuenta</h1>
                        <p className="text-muted-foreground mt-1">
                            Bienvenido, <span className="font-medium">{profile?.full_name || user?.email}</span>
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/mi-perfil">
                            <User className="mr-2 h-4 w-4" />
                            Editar perfil
                        </Link>
                    </Button>
                </div>

                {/* Stats rápidos */}
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{orders.length}</p>
                                    <p className="text-sm text-muted-foreground">Pedidos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-secondary/10">
                                    <BookOpen className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{enrollments.length}</p>
                                    <p className="text-sm text-muted-foreground">Cursos inscritos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-accent/10">
                                    <Award className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{certificates.length}</p>
                                    <p className="text-sm text-muted-foreground">Certificados</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="pedidos">
                    <TabsList className="mb-6">
                        <TabsTrigger value="pedidos">Pedidos recientes</TabsTrigger>
                        <TabsTrigger value="cursos">Mis cursos</TabsTrigger>
                        <TabsTrigger value="certificados">Certificados</TabsTrigger>
                    </TabsList>

                    {/* Pedidos */}
                    <TabsContent value="pedidos">
                        <Card className="border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Pedidos recientes</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/mis-pedidos">Ver todos <ChevronRight className="ml-1 h-4 w-4" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-center text-muted-foreground py-8">Cargando...</p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-10">
                                        <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                        <p className="text-muted-foreground mb-4">No tienes pedidos todavía</p>
                                        <Button asChild><Link to="/tienda">Ir a la tienda</Link></Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                                                <div>
                                                    <p className="font-medium text-sm">Pedido #{order.id.substring(0, 8).toUpperCase()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(order.created_at).toLocaleDateString('es-MX')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={STATUS_COLORS[order.status] || ''}>
                                                        {STATUS_LABELS[order.status] || order.status}
                                                    </Badge>
                                                    <span className="font-semibold text-sm">{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cursos */}
                    <TabsContent value="cursos">
                        <Card className="border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Mis cursos</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/aula">Ver aula <ChevronRight className="ml-1 h-4 w-4" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-center text-muted-foreground py-8">Cargando...</p>
                                ) : enrollments.length === 0 ? (
                                    <div className="text-center py-10">
                                        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                        <p className="text-muted-foreground mb-4">No estás inscrito en ningún curso</p>
                                        <Button asChild><Link to="/academia">Ver cursos</Link></Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {enrollments.map((e) => (
                                            <div key={e.id} className="flex items-center gap-4 rounded-lg border border-border/50 p-4">
                                                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                                    {e.course.thumbnail_url && (
                                                        <img src={e.course.thumbnail_url} alt={e.course.title} className="h-full w-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{e.course.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Progress value={e.progress_percentage} className="h-1.5 flex-1" />
                                                        <span className="text-xs text-muted-foreground shrink-0">{e.progress_percentage}%</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/academia/curso/${e.course.slug}`}>Ir al curso</Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Certificados */}
                    <TabsContent value="certificados">
                        <Card className="border-border/50">
                            <CardHeader><CardTitle>Mis certificados</CardTitle></CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-center text-muted-foreground py-8">Cargando...</p>
                                ) : certificates.length === 0 ? (
                                    <div className="text-center py-10">
                                        <Award className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                        <p className="text-muted-foreground">Completa un curso para obtener tu certificado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {certificates.map((cert) => (
                                            <div key={cert.id} className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/10 p-4">
                                                <div className="flex items-center gap-3">
                                                    <Award className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="font-medium text-sm">{cert.course.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Emitido: {new Date(cert.issued_at).toLocaleDateString('es-MX')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/certificado/${cert.verification_code}`} target="_blank">
                                                        Verificar / Descargar
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
