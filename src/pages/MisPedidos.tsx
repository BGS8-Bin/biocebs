import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/money';

interface OrderItem {
    id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    shipping_address: Record<string, string> | null;
    items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente de pago',
    processing: 'En proceso',
    shipped: 'Enviado',
    completed: 'Entregado',
    cancelled: 'Cancelado',
};
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function MisPedidos() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          id, created_at, total, status, shipping_address,
          order_items (
            id, product_name, variant_name, quantity, unit_price, total_price
          )
        `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(
                (data || []).map((o: Record<string, unknown>) => ({
                    ...o,
                    items: (o.order_items as OrderItem[]) || [],
                })) as Order[]
            );
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container-app py-10 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/mi-cuenta"><ChevronLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Mis Pedidos</h1>
                        <p className="text-sm text-muted-foreground">Historial completo de compras</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="border-dashed border-border">
                        <CardContent className="py-16 text-center">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                            <h2 className="text-lg font-semibold mb-2">No tienes pedidos</h2>
                            <p className="text-muted-foreground mb-6">Cuando realices una compra aparecerá aquí</p>
                            <Button asChild><Link to="/tienda">Ir a la tienda</Link></Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-border/50">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">
                                                Pedido #{order.id.substring(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={STATUS_COLORS[order.status] || ''}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </Badge>
                                            <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                                            <div>
                                                <p className="font-medium text-sm">{item.product_name}</p>
                                                {item.variant_name && (
                                                    <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatCurrency(item.total_price)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.quantity} × {formatCurrency(item.unit_price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.shipping_address && (
                                        <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            Envío a: {[
                                                order.shipping_address.firstName,
                                                order.shipping_address.lastName,
                                                order.shipping_address.city,
                                                order.shipping_address.state,
                                            ].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
