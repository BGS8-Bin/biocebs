import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Filter,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/money';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;

interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

const categories = [
  'Suplementos',
  'Equipamiento',
  'Nutrición',
  'Accesorios',
  'Ropa',
  'Otros',
];

export default function ProductosAdmin() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category: '',
    base_price: 0,
    thumbnail_url: '',
    is_active: true,
    is_featured: false,
  });
  const [variantForm, setVariantForm] = useState({
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*');

      if (variantsError) throw variantsError;

      const productsWithVariants = productsData?.map((product) => ({
        ...product,
        variants: variantsData?.filter((v) => v.product_id === product.id) || [],
      })) || [];

      setProducts(productsWithVariants);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los productos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openCreateProductDialog = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category: '',
      base_price: 0,
      thumbnail_url: '',
      is_active: true,
      is_featured: false,
    });
    setIsProductDialogOpen(true);
  };

  const openEditProductDialog = (product: ProductWithVariants) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description || '',
      category: product.category || '',
      base_price: product.base_price,
      thumbnail_url: product.thumbnail_url || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
    });
    setIsProductDialogOpen(true);
  };

  const openCreateVariantDialog = (product: ProductWithVariants) => {
    setEditingProduct(product);
    setEditingVariant(null);
    setVariantForm({
      name: '',
      price: product.base_price,
      stock: 0,
      sku: '',
      is_active: true,
    });
    setIsVariantDialogOpen(true);
  };

  const openEditVariantDialog = (product: ProductWithVariants, variant: ProductVariant) => {
    setEditingProduct(product);
    setEditingVariant(variant);
    setVariantForm({
      name: variant.name,
      price: variant.price,
      stock: variant.stock ?? 0,
      sku: variant.sku || '',
      is_active: variant.is_active ?? true,
    });
    setIsVariantDialogOpen(true);
  };

  const saveProduct = async () => {
    try {
      if (!productForm.name || !productForm.category) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'El nombre y la categoría son requeridos.',
        });
        return;
      }

      const slug = productForm.slug || generateSlug(productForm.name);

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            slug,
            short_description: productForm.short_description || null,
            description: productForm.description || null,
            category: productForm.category,
            base_price: productForm.base_price,
            thumbnail_url: productForm.thumbnail_url || null,
            is_active: productForm.is_active,
            is_featured: productForm.is_featured,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: 'Producto actualizado',
          description: 'El producto se ha actualizado correctamente.',
        });
      } else {
        const { error } = await supabase.from('products').insert({
          name: productForm.name,
          slug,
          short_description: productForm.short_description || null,
          description: productForm.description || null,
          category: productForm.category,
          base_price: productForm.base_price,
          thumbnail_url: productForm.thumbnail_url || null,
          is_active: productForm.is_active,
          is_featured: productForm.is_featured,
        });

        if (error) throw error;

        toast({
          title: 'Producto creado',
          description: 'El producto se ha creado correctamente.',
        });
      }

      setIsProductDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el producto.',
      });
    }
  };

  const saveVariant = async () => {
    try {
      if (!editingProduct || !variantForm.name) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'El nombre de la variante es requerido.',
        });
        return;
      }

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update({
            name: variantForm.name,
            price: variantForm.price,
            stock: variantForm.stock,
            sku: variantForm.sku || null,
            is_active: variantForm.is_active,
          })
          .eq('id', editingVariant.id);

        if (error) throw error;

        toast({
          title: 'Variante actualizada',
          description: 'La variante se ha actualizado correctamente.',
        });
      } else {
        const { error } = await supabase.from('product_variants').insert({
          product_id: editingProduct.id,
          name: variantForm.name,
          price: variantForm.price,
          stock: variantForm.stock,
          sku: variantForm.sku || null,
          is_active: variantForm.is_active,
        });

        if (error) throw error;

        toast({
          title: 'Variante creada',
          description: 'La variante se ha creado correctamente.',
        });
      }

      setIsVariantDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la variante.',
      });
    }
  };

  const deleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      // Delete variants first
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', deletingProduct.id);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;

      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado correctamente.',
      });

      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
      });
    }
  };

  const deleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      toast({
        title: 'Variante eliminada',
        description: 'La variante se ha eliminado correctamente.',
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la variante.',
      });
    }
  };

  const toggleProductActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: product.is_active ? 'Producto desactivado' : 'Producto activado',
        description: `El producto ahora está ${product.is_active ? 'oculto' : 'visible'} en la tienda.`,
      });

      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el producto.',
      });
    }
  };

  const toggleProductFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: product.is_featured ? 'Destacado removido' : 'Producto destacado',
        description: `El producto ${product.is_featured ? 'ya no está' : 'ahora está'} destacado.`,
      });

      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el producto.',
      });
    }
  };


  const getTotalStock = (product: ProductWithVariants) => {
    return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  };

  return (
    <AdminLayout
      title="Productos"
      description="Gestiona el catálogo de productos de la tienda"
      actions={
        <Button onClick={openCreateProductDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      }
    >
      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Modifica los datos del producto.'
                : 'Completa los datos para crear un nuevo producto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => {
                    setProductForm({ 
                      ...productForm, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  placeholder="url-del-producto"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) => setProductForm({ ...productForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_price">Precio base</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.base_price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, base_price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_description">Descripción corta</Label>
              <Input
                id="short_description"
                value={productForm.short_description}
                onChange={(e) =>
                  setProductForm({ ...productForm, short_description: e.target.value })
                }
                placeholder="Breve descripción del producto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción completa</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Descripción detallada del producto"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL de imagen</Label>
              <Input
                id="thumbnail_url"
                value={productForm.thumbnail_url}
                onChange={(e) => setProductForm({ ...productForm, thumbnail_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={productForm.is_active}
                  onCheckedChange={(checked) =>
                    setProductForm({ ...productForm, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) =>
                    setProductForm({ ...productForm, is_featured: checked })
                  }
                />
                <Label htmlFor="is_featured">Destacado</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProduct}>
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Editar variante' : 'Nueva variante'}
            </DialogTitle>
            <DialogDescription>
              {editingVariant
                ? 'Modifica los datos de la variante.'
                : `Agrega una nueva variante para ${editingProduct?.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variant_name">Nombre *</Label>
              <Input
                id="variant_name"
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                placeholder="Ej: Talla M, Color Azul, 500g"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="variant_price">Precio</Label>
                <Input
                  id="variant_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant_stock">Stock</Label>
                <Input
                  id="variant_stock"
                  type="number"
                  min="0"
                  value={variantForm.stock}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, stock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant_sku">SKU</Label>
              <Input
                id="variant_sku"
                value={variantForm.sku}
                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                placeholder="Código único del producto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="variant_active"
                checked={variantForm.is_active}
                onCheckedChange={(checked) =>
                  setVariantForm({ ...variantForm, is_active: checked })
                }
              />
              <Label htmlFor="variant_active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveVariant}>
              {editingVariant ? 'Guardar cambios' : 'Crear variante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{deletingProduct?.name}"? Esta acción no se
              puede deshacer y se eliminarán todas las variantes asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteProduct}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Variantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {product.thumbnail_url ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{product.name}</p>
                            {product.is_featured && (
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(product.base_price)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          getTotalStock(product) === 0
                            ? 'text-destructive'
                            : getTotalStock(product) < 10
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      >
                        {getTotalStock(product)} uds.
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.variants.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Badge className="bg-success/10 text-success border-success/30">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditProductDialog(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar producto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCreateVariantDialog(product)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar variante
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleProductActive(product)}>
                            {product.is_active ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProductFeatured(product)}>
                            <Star className="mr-2 h-4 w-4" />
                            {product.is_featured ? 'Quitar destacado' : 'Destacar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setDeletingProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
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

        {/* Variants Section */}
        {filteredProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Variantes por producto</h3>
            {filteredProducts.map((product) => (
              product.variants.length > 0 && (
                <div key={product.id} className="rounded-lg border border-border/50 bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateVariantDialog(product)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Agregar
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variante</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant) => (
                          <TableRow key={variant.id}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {variant.sku || '-'}
                            </TableCell>
                            <TableCell>{formatCurrency(variant.price)}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  (variant.stock ?? 0) === 0
                                    ? 'text-destructive'
                                    : (variant.stock ?? 0) < 10
                                    ? 'text-warning'
                                    : ''
                                }
                              >
                                {variant.stock ?? 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              {variant.is_active ? (
                                <Badge className="bg-success/10 text-success border-success/30">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openEditVariantDialog(product, variant)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteVariant(variant.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
