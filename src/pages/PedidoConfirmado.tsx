import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/money';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

export default function PedidoConfirmado() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at')
      .eq('id', orderId)
      .maybeSingle();

    setOrder(data);
  };

  return (
    <MainLayout>
      <div className="container-app py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold">¡Gracias por tu compra!</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>

          {order && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de pedido</span>
                    <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Te enviaremos un correo con los detalles de tu pedido y la información de seguimiento.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/tienda">
                  Continuar Comprando
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  Ir al Inicio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
