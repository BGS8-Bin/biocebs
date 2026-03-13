import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, Clock, CalendarDays, 
  LayoutGrid, List, MoreHorizontal, Calendar as CalendarIcon,
  Edit2, Trash2, Loader2, GripVertical
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'month' | 'week' | 'agenda';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  department: string;
  color: string;
  priority: string | null;
}

const colorOptions = [
  { name: 'Esmeralda', value: 'bg-primary', text: 'text-primary-foreground' },
  { name: 'Azul', value: 'bg-secondary', text: 'text-secondary-foreground' },
  { name: 'Ámbar', value: 'bg-amber-500', text: 'text-white' },
  { name: 'Rosa', value: 'bg-pink-500', text: 'text-white' },
  { name: 'Violeta', value: 'bg-violet-500', text: 'text-white' },
  { name: 'Cyan', value: 'bg-cyan-500', text: 'text-white' },
];

const departments = ['Capacitaciones', 'Investigación', 'Consultoría', 'Administración'];

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '09:00',
    end_time: '10:00',
    department: '',
    color: 'bg-primary',
  });
  
  // Drag & Drop state
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch events from database
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: 'Error al cargar eventos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (selectedDept === 'all') return events;
    return events.filter(e => e.department === selectedDept);
  }, [events, selectedDept]);

  const navigatePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(e => e.event_date === dateStr);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.event_date || !newEvent.department) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa título, fecha y departamento',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: newEvent.title,
          description: newEvent.description || null,
          event_date: newEvent.event_date,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          department: newEvent.department,
          color: newEvent.color,
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      setEvents([...events, data]);
      setNewEvent({ title: '', description: '', event_date: '', start_time: '09:00', end_time: '10:00', department: '', color: 'bg-primary' });
      setIsCreateOpen(false);
      toast({
        title: 'Evento creado',
        description: 'El evento se ha guardado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error al crear evento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
      toast({
        title: 'Evento eliminado',
        description: 'El evento se ha eliminado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setNewEvent(prev => ({ ...prev, event_date: format(date, 'yyyy-MM-dd') }));
  };

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    
    // Add custom drag image
    const dragElement = e.currentTarget as HTMLElement;
    if (dragElement) {
      dragElement.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const dragElement = e.currentTarget as HTMLElement;
    if (dragElement) {
      dragElement.style.opacity = '1';
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const dateStr = format(date, 'yyyy-MM-dd');
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  }, [dragOverDate]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're actually leaving the cell
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverDate(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedEvent) return;
    
    const newDateStr = format(targetDate, 'yyyy-MM-dd');
    
    // Don't update if same date
    if (draggedEvent.event_date === newDateStr) {
      setDraggedEvent(null);
      setDragOverDate(null);
      return;
    }

    // Optimistic update
    setEvents(prev => prev.map(event => 
      event.id === draggedEvent.id 
        ? { ...event, event_date: newDateStr }
        : event
    ));

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ event_date: newDateStr })
        .eq('id', draggedEvent.id);

      if (error) throw error;

      toast({
        title: 'Evento movido',
        description: `"${draggedEvent.title}" movido a ${format(targetDate, 'd MMM', { locale: es })}`,
      });
    } catch (error: any) {
      // Revert on error
      setEvents(prev => prev.map(event => 
        event.id === draggedEvent.id 
          ? { ...event, event_date: draggedEvent.event_date }
          : event
      ));
      toast({
        title: 'Error al mover evento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDraggedEvent(null);
      setDragOverDate(null);
    }
  }, [draggedEvent, toast]);

  // Calendar grid calculation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const headerTitle = view === 'month' 
    ? format(currentDate, 'MMMM yyyy', { locale: es })
    : `${format(weekStart, 'd MMM', { locale: es })} - ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}`;

  // Upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return filteredEvents
      .filter(e => e.event_date >= today)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 8);
  }, [filteredEvents]);

  if (loading) {
    return (
      <AdminLayout title="Calendario" description="Cargando...">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Calendario"
      description="Gestiona eventos y reuniones del equipo"
      actions={
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear evento</DialogTitle>
                <DialogDescription>
                  Programa un nuevo evento o reunión para el equipo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ej: Reunión de equipo"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalles del evento..."
                    rows={2}
                    className="bg-background resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select
                      value={newEvent.department}
                      onValueChange={(v) => setNewEvent({ ...newEvent, department: v })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora inicio</Label>
                    <Input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora fin</Label>
                    <Input
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                        className={cn(
                          'h-8 w-8 rounded-full transition-all ring-offset-background',
                          color.value,
                          newEvent.color === color.value && 'ring-2 ring-foreground ring-offset-2'
                        )}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={createEvent} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear evento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={navigatePrev} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={navigateNext} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold capitalize">{headerTitle}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <Button
                  variant={view === 'month' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('month')}
                  className="h-7 px-3"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Mes
                </Button>
                <Button
                  variant={view === 'week' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('week')}
                  className="h-7 px-3"
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Semana
                </Button>
                <Button
                  variant={view === 'agenda' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('agenda')}
                  className="h-7 px-3"
                >
                  <List className="h-4 w-4 mr-1" />
                  Agenda
                </Button>
              </div>
            </div>
          </div>

          {/* Drag instruction */}
          {view !== 'agenda' && (
            <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground flex items-center gap-2 border-b border-border/30">
              <GripVertical className="h-3 w-3" />
              Arrastra los eventos para cambiar su fecha
            </div>
          )}

          {/* Calendar Content */}
          <div className="flex-1 overflow-auto">
            {view === 'month' && (
              <div className="h-full flex flex-col">
                {/* Day names header */}
                <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6">
                  {calendarDays.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDragOver = dragOverDate === dateStr;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => handleDayClick(day)}
                        onDragOver={(e) => handleDragOver(e, day)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day)}
                        className={cn(
                          'min-h-[100px] border-r border-b border-border/30 p-1 cursor-pointer transition-all',
                          !isCurrentMonth && 'bg-muted/20',
                          isToday(day) && 'bg-primary/5',
                          isSelected && 'bg-primary/10 ring-1 ring-primary/50',
                          isDragOver && 'bg-primary/20 ring-2 ring-primary ring-inset',
                          'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            'text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full',
                            !isCurrentMonth && 'text-muted-foreground/50',
                            isToday(day) && 'bg-primary text-primary-foreground'
                          )}>
                            {format(day, 'd')}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={cn(
                                'group px-1.5 py-0.5 rounded text-[11px] font-medium truncate cursor-grab active:cursor-grabbing transition-all hover:shadow-sm',
                                event.color,
                                'text-white',
                                draggedEvent?.id === event.id && 'opacity-50 ring-2 ring-primary'
                              )}
                            >
                              <span className="opacity-70 mr-1">{event.start_time.slice(0, 5)}</span>
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <button className="text-[10px] text-muted-foreground hover:text-foreground pl-1">
                              +{dayEvents.length - 3} más
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'week' && (
              <div className="h-full flex flex-col">
                {/* Week header */}
                <div className="grid grid-cols-8 border-b border-border/50 bg-muted/30">
                  <div className="py-2 px-2 text-xs text-muted-foreground"></div>
                  {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDragOver = dragOverDate === dateStr;
                    return (
                      <div
                        key={day.toISOString()}
                        onDragOver={(e) => handleDragOver(e, day)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day)}
                        className={cn(
                          'py-2 text-center transition-colors',
                          isToday(day) && 'bg-primary/10',
                          isDragOver && 'bg-primary/20'
                        )}
                      >
                        <div className="text-xs text-muted-foreground uppercase">
                          {format(day, 'EEE', { locale: es })}
                        </div>
                        <div className={cn(
                          'text-lg font-semibold mt-0.5',
                          isToday(day) && 'text-primary'
                        )}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-8 min-h-[600px]">
                    {/* Time column */}
                    <div className="border-r border-border/30">
                      {Array.from({ length: 12 }, (_, i) => i + 7).map((hour) => (
                        <div key={hour} className="h-16 border-b border-border/20 pr-2 text-right">
                          <span className="text-xs text-muted-foreground">
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day) => {
                      const dayEvents = getEventsForDay(day);
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isDragOver = dragOverDate === dateStr;
                      return (
                        <div
                          key={day.toISOString()}
                          onDragOver={(e) => handleDragOver(e, day)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day)}
                          className={cn(
                            'border-r border-border/30 relative transition-colors',
                            isToday(day) && 'bg-primary/5',
                            isDragOver && 'bg-primary/10'
                          )}
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-16 border-b border-border/20" />
                          ))}
                          
                          {/* Events overlay */}
                          <div className="absolute inset-0 p-0.5">
                            {dayEvents.map((event) => {
                              const startHour = parseInt(event.start_time.split(':')[0]);
                              const startMin = parseInt(event.start_time.split(':')[1]);
                              const endHour = parseInt(event.end_time.split(':')[0]);
                              const endMin = parseInt(event.end_time.split(':')[1]);
                              const top = ((startHour - 7) * 64) + (startMin / 60 * 64);
                              const height = ((endHour - startHour) * 64) + ((endMin - startMin) / 60 * 64);
                              
                              if (startHour < 7 || startHour > 18) return null;
                              
                              return (
                                <div
                                  key={event.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, event)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => setSelectedEvent(event)}
                                  className={cn(
                                    'absolute left-0.5 right-0.5 rounded-md p-1.5 cursor-grab active:cursor-grabbing overflow-hidden',
                                    event.color,
                                    'text-white shadow-sm hover:shadow-md transition-shadow',
                                    draggedEvent?.id === event.id && 'opacity-50 ring-2 ring-primary'
                                  )}
                                  style={{ top: `${top}px`, height: `${Math.max(height, 24)}px` }}
                                >
                                  <div className="text-[10px] opacity-80">{event.start_time.slice(0, 5)}</div>
                                  <div className="text-xs font-medium truncate">{event.title}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {view === 'agenda' && (
              <div className="p-4 space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay eventos programados</p>
                  </div>
                ) : (
                  filteredEvents
                    .sort((a, b) => a.event_date.localeCompare(b.event_date))
                    .map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <div className={cn('w-1 self-stretch rounded-full', event.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">{event.department}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(event.event_date), 'EEEE d MMMM', { locale: es })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Mini calendar */}
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h3>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={navigatePrev}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={navigateNext}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
              ))}
              {calendarDays.slice(0, 42).map((day, idx) => {
                const hasEvents = getEventsForDay(day).length > 0;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentDate(day)}
                    className={cn(
                      'text-xs h-7 w-7 rounded-full transition-colors',
                      !isSameMonth(day, currentDate) && 'text-muted-foreground/40',
                      isToday(day) && 'bg-primary text-primary-foreground font-bold',
                      hasEvents && !isToday(day) && 'font-semibold',
                      'hover:bg-muted'
                    )}
                  >
                    {format(day, 'd')}
                    {hasEvents && !isToday(day) && (
                      <span className="block h-1 w-1 bg-primary rounded-full mx-auto -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="bg-card rounded-xl border border-border/50 p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-sm mb-3">Próximos eventos</h3>
            <div className="flex-1 overflow-auto space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay eventos próximos
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', event.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), 'EEE d MMM', { locale: es })} • {event.start_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Departments legend */}
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <h3 className="font-semibold text-sm mb-3">Departamentos</h3>
            <div className="space-y-2">
              {departments.map((dept) => {
                const count = events.filter(e => e.department === dept).length;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(selectedDept === dept ? 'all' : dept)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors',
                      selectedDept === dept ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                    )}
                  >
                    <span>{dept}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full', selectedEvent.color)} />
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-muted-foreground">{selectedEvent.description || 'Sin descripción'}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(selectedEvent.event_date), 'EEEE d MMMM yyyy', { locale: es })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedEvent.start_time.slice(0, 5)} - {selectedEvent.end_time.slice(0, 5)}
                </div>

                <Badge variant="outline">{selectedEvent.department}</Badge>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cerrar
                </Button>
                <Button variant="destructive" onClick={() => deleteEvent(selectedEvent.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
