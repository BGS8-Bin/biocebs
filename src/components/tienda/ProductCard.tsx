import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/useCurrency';
import { useLanguage } from '@/hooks/useLanguage';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    base_price: number;
    thumbnail_url: string | null;
    category: string | null;
    is_featured: boolean | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  return (
    <Card className="group overflow-hidden border-border/50 transition-all hover:shadow-lg hover:border-primary/30">
      <Link to={`/tienda/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {product.is_featured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              {t('store.featured')}
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            {product.category}
          </p>
        )}
        <Link to={`/tienda/${product.slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.short_description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.base_price)}
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/tienda/${product.slug}`}>Ver más</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
