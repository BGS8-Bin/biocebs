import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingCart, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/money';
import { isInStock, SHIPPING_RULES } from '@/lib/orderService';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  base_price: number;
  thumbnail_url: string | null;
  images: string[];
  category: string | null;
  is_featured: boolean | null;
}

export default function ProductoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) {
        setProduct(null);
        return;
      }

      setProduct(productData);

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_active', true);

      if (variantsError) throw variantsError;
      
      const typedVariants = (variantsData || []).map(v => ({
        ...v,
        attributes: (v.attributes as Record<string, string>) || {}
      }));
      
      setVariants(typedVariants);
      if (typedVariants.length > 0) {
        setSelectedVariant(typedVariants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Selecciona una variante');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const currentPrice = selectedVariant?.price ?? product?.base_price ?? 0;
  const inStock = selectedVariant ? isInStock(selectedVariant.stock) : true;
  const stockCount = selectedVariant?.stock ?? 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-app py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container-app py-16 text-center">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p className="mt-2 text-muted-foreground">El producto que buscas no existe o fue eliminado.</p>
          <Button asChild className="mt-6">
            <Link to="/tienda">Volver a la tienda</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const allImages = [product.thumbnail_url, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <MainLayout>
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            to="/tienda" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a la tienda
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {product.is_featured && (
                <Badge className="absolute left-4 top-4">Destacado</Badge>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      idx === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {product.category && (
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {product.category}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(currentPrice)}
              </span>
              {inStock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="mr-1 h-3 w-3" />
                  En stock ({stockCount})
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Agotado
                </Badge>
              )}
            </div>

            {product.short_description && (
              <p className="mt-4 text-muted-foreground">
                {product.short_description}
              </p>
            )}

            <Separator className="my-6" />

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Variante</Label>
                <RadioGroup
                  value={selectedVariant?.id}
                  onValueChange={(value) => {
                    const variant = variants.find(v => v.id === value);
                    if (variant) {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }
                  }}
                  className="flex flex-wrap gap-3"
                >
                  {variants.map((variant) => (
                    <div key={variant.id}>
                      <RadioGroupItem
                        value={variant.id}
                        id={variant.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={variant.id}
                        className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-muted bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                      >
                        {variant.name}
                        {variant.stock === 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">(Agotado)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 space-y-3">
              <Label className="text-base font-medium">Cantidad</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                  disabled={quantity >= stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleAddToCart}
              disabled={!inStock || isAdding || !selectedVariant}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
            </Button>

            {/* Features */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Envío Gratis</p>
                  <p className="text-xs text-muted-foreground">En compras +{formatCurrency(SHIPPING_RULES.FREE_THRESHOLD)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Garantía</p>
                  <p className="text-xs text-muted-foreground">30 días</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Devoluciones</p>
                  <p className="text-xs text-muted-foreground">Fáciles</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold">Descripción</h3>
              <p className="mt-2 text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
