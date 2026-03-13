import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Send, Clock, Filter, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  department: string | null;
  likes_count: number;
  created_at: string;
  comments: Comment[];
  user_liked?: boolean;
}

interface Comment {
  id: string;
  author_id: string;
  author_name?: string;
  content: string;
  created_at: string;
}

const departments = ['General', 'Investigación', 'Capacitaciones', 'Consultoría', 'Administración'];

export default function Comunicacion() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', department: '' });
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      // Fetch profiles for author names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      // Fetch user likes
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        userLikes = likesData?.map((l) => l.post_id) || [];
      }

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

      const postsWithDetails = postsData?.map((post) => ({
        ...post,
        author_name: profileMap.get(post.author_id) || 'Usuario',
        user_liked: userLikes.includes(post.id),
        comments: (commentsData || [])
          .filter((c) => c.post_id === post.id)
          .map((c) => ({
            ...c,
            author_name: profileMap.get(c.author_id) || 'Usuario',
          })),
      })) || [];

      setPosts(postsWithDetails);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las publicaciones.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) => selectedDept === 'all' || post.department === selectedDept
  );

  const createPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.department) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Todos los campos son obligatorios.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión.',
      });
      return;
    }

    const { error } = await supabase.from('posts').insert({
      title: newPost.title,
      content: newPost.content,
      department: newPost.department,
      author_id: user.id,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la publicación.',
      });
    } else {
      toast({
        title: 'Publicación creada',
        description: 'Tu publicación se ha creado correctamente.',
      });
      setNewPost({ title: '', content: '', department: '' });
      setIsCreateOpen(false);
      fetchPosts();
    }
  };

  const addComment = async (postId: string) => {
    if (!newComment[postId] || !user) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: newComment[postId],
    });

    if (!error) {
      setNewComment({ ...newComment, [postId]: '' });
      fetchPosts();
    }
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    if (currentlyLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      await supabase
        .from('posts')
        .update({ likes_count: posts.find(p => p.id === postId)!.likes_count - 1 })
        .eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: user.id,
      });
      
      await supabase
        .from('posts')
        .update({ likes_count: posts.find(p => p.id === postId)!.likes_count + 1 })
        .eq('id', postId);
    }

    fetchPosts();
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    
    if (!error) {
      toast({
        title: 'Publicación eliminada',
        description: 'La publicación se ha eliminado.',
      });
      fetchPosts();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <AdminLayout title="Comunicación" description="Foro interno y anuncios">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Comunicación"
      description="Foro interno y anuncios por departamento"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Publicación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva publicación</DialogTitle>
              <DialogDescription>
                Crea un anuncio o inicia una discusión.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Título de la publicación"
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={newPost.department}
                  onValueChange={(v) => setNewPost({ ...newPost, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={createPost}>Publicar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredPosts.length} publicación{filteredPosts.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No hay publicaciones</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="border-border/50">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(post.author_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{post.author_name}</span>
                        {post.department && (
                          <Badge variant="outline" className="text-xs">{post.department}</Badge>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                    {user?.id === post.author_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                    <p className="mt-2 text-muted-foreground">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id, post.user_liked || false)}
                      className={post.user_liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {post.likes_count}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Reply className="mr-1 h-4 w-4" />
                      {post.comments.length} comentario{post.comments.length !== 1 ? 's' : ''}
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {getInitials(comment.author_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.author_name}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      {user && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.email || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 gap-2">
                            <Input
                              placeholder="Escribe un comentario..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                            />
                            <Button size="icon" onClick={() => addComment(post.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
