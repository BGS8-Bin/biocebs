import { useState, useEffect, useRef } from 'react';
import {
  Folder, FolderOpen, FileText, Download, Trash2, Search,
  Upload, File, FileImage, FileSpreadsheet, Loader2,
  LayoutGrid, List, ChevronRight, Home, MoreVertical,
  FolderPlus, Plus, Eye, X
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Document {
  id: string;
  title: string;
  description: string | null;
  department_id: string | null;
  file_name: string;
  file_url: string | null;
  file_size: string | null;
  file_type: string | null;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

type ViewMode = 'grid' | 'list';

// ── Helpers ────────────────────────────────────────────────

const FOLDER_COLORS = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853',
  '#FF6D00', '#46BDC6', '#7C4DFF', '#E91E63',
];

const getFolderColor = (index: number) => FOLDER_COLORS[index % FOLDER_COLORS.length];

const getFileIcon = (type: string | null, size = 5) => {
  const t = type?.toLowerCase() || '';
  const cls = `h-${size} w-${size}`;
  if (t.includes('pdf')) return <FileText className={`${cls} text-red-500`} />;
  if (t.includes('sheet') || t.includes('excel') || t.includes('xlsx') || t.includes('xls'))
    return <FileSpreadsheet className={`${cls} text-green-500`} />;
  if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('webp'))
    return <FileImage className={`${cls} text-blue-400`} />;
  return <File className={`${cls} text-muted-foreground`} />;
};

const getFileBg = (type: string | null) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('pdf')) return 'bg-red-50 dark:bg-red-950/30';
  if (t.includes('sheet') || t.includes('excel') || t.includes('xlsx'))
    return 'bg-green-50 dark:bg-green-950/30';
  if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg'))
    return 'bg-blue-50 dark:bg-blue-950/30';
  return 'bg-muted';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

// ── Main Component ─────────────────────────────────────────

export default function Documentos() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Navigation: null = root (carpetas), string = dept id abierto
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const [newDoc, setNewDoc] = useState({ title: '', description: '', department_id: '' });
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [docsRes, deptsRes] = await Promise.all([
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('departments').select('id, name').order('name'),
      ]);
      if (docsRes.data) setDocuments(docsRes.data);
      if (deptsRes.data) setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = (id: string | null) =>
    departments.find((d) => d.id === id)?.name || 'Sin carpeta';

  // ── Filtered data ──────────────────────────────────────────

  const docsInFolder = documents.filter((doc) => {
    if (searchQuery) {
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (currentFolder === null) return false;
    return doc.department_id === currentFolder || (currentFolder === 'uncategorized' && !doc.department_id);
  });

  const foldersWithCount = departments.map((dept, idx) => ({
    ...dept,
    count: documents.filter((d) => d.department_id === dept.id).length,
    color: getFolderColor(idx),
  }));

  const uncategorizedCount = documents.filter((d) => !d.department_id).length;

  // Search mode muestra todos
  const searchResults = searchQuery
    ? documents.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // ── Breadcrumb ───────────────────────────────────────────

  const currentDeptName = currentFolder === 'uncategorized'
    ? 'Sin carpeta'
    : departments.find((d) => d.id === currentFolder)?.name || '';

  // ── Handlers ─────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const openUpload = (deptId?: string) => {
    setNewDoc({
      title: '', description: '',
      department_id: deptId || currentFolder || '',
    });
    setIsUploadOpen(true);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return toast({ variant: 'destructive', title: 'Selecciona un archivo' });
    if (!newDoc.title) return toast({ variant: 'destructive', title: 'El título es obligatorio' });

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents').upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('documents').insert({
        title: newDoc.title,
        description: newDoc.description || null,
        department_id: newDoc.department_id || null,
        file_name: selectedFile.name,
        file_url: urlData.publicUrl,
        file_type: selectedFile.type,
        file_size: formatFileSize(selectedFile.size),
        uploaded_by: user?.id,
      });
      if (insertError) throw insertError;

      toast({ title: '✅ Documento subido correctamente' });
      resetUpload();
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    try {
      if (doc.file_url) {
        const path = doc.file_url.split('/documents/')[1];
        if (path) await supabase.storage.from('documents').remove([path]);
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
      toast({ title: 'Documento eliminado' });
      setPreviewDoc(null);
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const { error } = await supabase.from('departments').insert({ name: newFolderName.trim() });
      if (error) throw error;
      toast({ title: '📁 Carpeta creada' });
      setNewFolderName('');
      setIsNewFolderOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const resetUpload = () => {
    setNewDoc({ title: '', description: '', department_id: '' });
    setSelectedFile(null);
    setIsUploadOpen(false);
  };

  // ── Render helpers ────────────────────────────────────────

  const FolderCard = ({ dept, color, count }: { dept: Department; color: string; count: number }) => (
    <div
      className="group relative flex flex-col items-start gap-2 rounded-xl border border-border/50 bg-card p-4 cursor-pointer hover:border-border hover:shadow-md transition-all duration-150 select-none"
      onDoubleClick={() => setCurrentFolder(dept.id)}
      onClick={() => setCurrentFolder(dept.id)}
    >
      {/* Folder icon */}
      <div className="relative">
        <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
          <path d="M0 8C0 3.58172 3.58172 0 8 0H18.6863C20.347 0 21.9529 0.631707 23.1716 1.77124L26 4.5H44C48.4183 4.5 52 8.08172 52 12.5V36C52 40.4183 48.4183 44 44 44H8C3.58172 44 0 40.4183 0 36V8Z"
            fill={color} />
          <path d="M0 16C0 11.5817 3.58172 8 8 8H44C48.4183 8 52 11.5817 52 16V36C52 40.4183 48.4183 44 44 44H8C3.58172 44 0 40.4183 0 36V16Z"
            fill={color} opacity="0.85" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{dept.name}</p>
        <p className="text-xs text-muted-foreground">{count} archivo{count !== 1 ? 's' : ''}</p>
      </div>

      {/* Context menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 rounded-full p-1 hover:bg-muted transition-opacity">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setCurrentFolder(dept.id); }}>
            <FolderOpen className="mr-2 h-4 w-4" /> Abrir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openUpload(dept.id)}>
            <Upload className="mr-2 h-4 w-4" /> Subir archivo aquí
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const FileCard = ({ doc }: { doc: Document }) => (
    <div
      className="group relative flex flex-col gap-2 rounded-xl border border-border/50 bg-card overflow-hidden cursor-pointer hover:border-border hover:shadow-md transition-all duration-150"
      onDoubleClick={() => doc.file_url && window.open(doc.file_url, '_blank')}
      onClick={() => setPreviewDoc(doc)}
    >
      {/* Thumbnail */}
      <div className={`flex h-28 items-center justify-center ${getFileBg(doc.file_type)}`}>
        {doc.file_type?.includes('image') && doc.file_url ? (
          <img src={doc.file_url} alt={doc.title} className="h-full w-full object-cover" />
        ) : (
          getFileIcon(doc.file_type, 10)
        )}
      </div>
      <div className="px-3 pb-3">
        <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground">{doc.file_size || '—'} · {formatDate(doc.created_at)}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 rounded-full p-1 bg-background/80 backdrop-blur-sm hover:bg-muted transition-opacity">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPreviewDoc(doc)}>
            <Eye className="mr-2 h-4 w-4" /> Vista previa
          </DropdownMenuItem>
          {doc.file_url && (
            <DropdownMenuItem onClick={() => window.open(doc.file_url!, '_blank')}>
              <Download className="mr-2 h-4 w-4" /> Descargar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => deleteDocument(doc)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const FileRow = ({ doc }: { doc: Document }) => (
    <div
      className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => setPreviewDoc(doc)}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getFileBg(doc.file_type)}`}>
        {getFileIcon(doc.file_type, 4)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground">{doc.file_name}</p>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:block w-20 text-right">{doc.file_size || '—'}</span>
      <span className="text-xs text-muted-foreground hidden md:block w-28 text-right">{formatDate(doc.created_at)}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        {doc.file_url && (
          <button
            onClick={(e) => { e.stopPropagation(); window.open(doc.file_url!, '_blank'); }}
            className="rounded p-1 hover:bg-muted"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); deleteDocument(doc); }}
          className="rounded p-1 hover:bg-muted"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────

  const isRoot = currentFolder === null && !searchQuery;
  const showingDocs = searchQuery ? searchResults : docsInFolder;

  return (
    <AdminLayout
      title="Documentos"
      description="Gestión de documentos y archivos"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsNewFolderOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" /> Nueva carpeta
          </Button>
          <Button size="sm" onClick={() => openUpload()}>
            <Plus className="mr-2 h-4 w-4" /> Subir archivo
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 h-full">

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en todos los archivos..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setCurrentFolder(null); }}
              className="pl-9 h-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-1.5 transition-colors ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <List className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <button
            onClick={() => { setCurrentFolder(null); setSearchQuery(''); }}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Inicio</span>
          </button>
          {currentFolder !== null && !searchQuery && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{currentDeptName}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Resultados para "{searchQuery}"</span>
            </>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">

            {/* ROOT: show folders */}
            {isRoot && (
              <div className="space-y-6">
                {/* Folders section */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Carpetas
                  </p>
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3'
                    : 'flex flex-col gap-1'
                  }>
                    {foldersWithCount.map((dept) =>
                      viewMode === 'grid' ? (
                        <FolderCard key={dept.id} dept={dept} color={dept.color} count={dept.count} />
                      ) : (
                        <div
                          key={dept.id}
                          className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setCurrentFolder(dept.id)}
                        >
                          <Folder className="h-5 w-5 shrink-0" style={{ color: dept.color }} />
                          <span className="flex-1 text-sm font-medium">{dept.name}</span>
                          <span className="text-xs text-muted-foreground">{dept.count} archivos</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      )
                    )}
                    {/* Uncategorized folder */}
                    {uncategorizedCount > 0 && (
                      viewMode === 'grid' ? (
                        <div
                          className="group relative flex flex-col items-start gap-2 rounded-xl border border-border/50 bg-card p-4 cursor-pointer hover:border-border hover:shadow-md transition-all"
                          onClick={() => setCurrentFolder('uncategorized')}
                        >
                          <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
                            <path d="M0 8C0 3.58172 3.58172 0 8 0H18.6863C20.347 0 21.9529 0.631707 23.1716 1.77124L26 4.5H44C48.4183 4.5 52 8.08172 52 12.5V36C52 40.4183 48.4183 44 44 44H8C3.58172 44 0 40.4183 0 36V8Z" fill="#9CA3AF" />
                            <path d="M0 16C0 11.5817 3.58172 8 8 8H44C48.4183 8 52 11.5817 52 16V36C52 40.4183 48.4183 44 44 44H8C3.58172 44 0 40.4183 0 36V16Z" fill="#9CA3AF" opacity="0.85" />
                          </svg>
                          <p className="text-sm font-medium text-foreground">Sin carpeta</p>
                          <p className="text-xs text-muted-foreground">{uncategorizedCount} archivos</p>
                        </div>
                      ) : (
                        <div
                          className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setCurrentFolder('uncategorized')}
                        >
                          <Folder className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <span className="flex-1 text-sm font-medium">Sin carpeta</span>
                          <span className="text-xs text-muted-foreground">{uncategorizedCount} archivos</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FOLDER CONTENT or SEARCH RESULTS */}
            {(!isRoot) && (
              <div>
                {showingDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                    <FolderOpen className="h-16 w-16 opacity-20" />
                    <p className="text-sm">{searchQuery ? 'Sin resultados' : 'Esta carpeta está vacía'}</p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" onClick={() => openUpload()}>
                        <Upload className="mr-2 h-4 w-4" /> Subir el primer archivo
                      </Button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {showingDocs.map((doc) => <FileCard key={doc.id} doc={doc} />)}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                      <div className="w-9 shrink-0" />
                      <span className="flex-1">Nombre</span>
                      <span className="hidden sm:block w-20 text-right">Tamaño</span>
                      <span className="hidden md:block w-28 text-right">Fecha</span>
                      <div className="w-16" />
                    </div>
                    {showingDocs.map((doc) => <FileRow key={doc.id} doc={doc} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Upload Dialog ── */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => { if (!open) resetUpload(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subir archivo</DialogTitle>
            <DialogDescription>Sube un archivo al repositorio de documentos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Archivo *</Label>
              <div
                className={`relative flex min-h-[110px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors ${dragActive ? 'border-primary bg-primary/10' :
                    selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-950/30' :
                      'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt" />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-1 p-3 text-center">
                    {getFileIcon(selectedFile.type, 8)}
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    <button className="text-xs text-muted-foreground underline mt-1"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Arrastra o haz clic para seleccionar</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">PDF, Word, Excel, imágenes (máx. 50MB)</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del documento *</Label>
              <Input id="title" value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Ej: Contrato Q1 2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" value={newDoc.description}
                onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                placeholder="Descripción breve..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Carpeta (departamento)</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={newDoc.department_id}
                onChange={(e) => setNewDoc({ ...newDoc, department_id: e.target.value })}
              >
                <option value="">Sin carpeta</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUpload} disabled={uploading}>Cancelar</Button>
            <Button onClick={uploadDocument} disabled={uploading || !selectedFile || !newDoc.title}>
              {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</> : <><Upload className="mr-2 h-4 w-4" />Subir</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Folder Dialog ── */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva carpeta</DialogTitle>
            <DialogDescription>Crea un nuevo departamento/carpeta.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Nombre de la carpeta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancelar</Button>
            <Button onClick={createFolder} disabled={!newFolderName.trim()}>
              <FolderPlus className="mr-2 h-4 w-4" /> Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── File Preview Dialog ── */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
        <DialogContent className="sm:max-w-2xl">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(previewDoc.file_type, 5)}
                  <span className="truncate">{previewDoc.title}</span>
                </DialogTitle>
                <DialogDescription>{previewDoc.description || previewDoc.file_name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {/* Preview area */}
                {previewDoc.file_type?.includes('image') && previewDoc.file_url ? (
                  <img src={previewDoc.file_url} alt={previewDoc.title}
                    className="max-h-72 w-full rounded-lg object-contain border" />
                ) : previewDoc.file_type?.includes('pdf') && previewDoc.file_url ? (
                  <iframe src={previewDoc.file_url} className="h-64 w-full rounded-lg border" title={previewDoc.title} />
                ) : (
                  <div className={`flex h-40 items-center justify-center rounded-xl ${getFileBg(previewDoc.file_type)}`}>
                    {getFileIcon(previewDoc.file_type, 14)}
                  </div>
                )}
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Carpeta</p>
                    <p className="font-medium">{getDeptName(previewDoc.department_id)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Tamaño</p>
                    <p className="font-medium">{previewDoc.file_size || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(previewDoc.created_at)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Archivo</p>
                    <p className="font-medium truncate">{previewDoc.file_name}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="destructive" size="sm"
                  onClick={() => deleteDocument(previewDoc)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
                {previewDoc.file_url && (
                  <Button size="sm" onClick={() => window.open(previewDoc.file_url!, '_blank')}>
                    <Download className="mr-2 h-4 w-4" /> Descargar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
