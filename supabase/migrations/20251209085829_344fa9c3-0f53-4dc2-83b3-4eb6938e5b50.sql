-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  department TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-primary',
  priority TEXT DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies: admins and colaboradores can manage events, all authenticated can view
CREATE POLICY "Admins can manage all events"
ON public.calendar_events
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Colaboradores can manage events"
ON public.calendar_events
FOR ALL
USING (has_role(auth.uid(), 'colaborador'));

CREATE POLICY "Authenticated users can view events"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample events
INSERT INTO public.calendar_events (title, description, event_date, start_time, end_time, department, color, priority) VALUES
('Capacitación Bioseguridad', 'Taller práctico de protocolos de bioseguridad nivel 2', '2025-12-10', '09:00', '12:00', 'Capacitaciones', 'bg-primary', 'high'),
('Junta de Investigación', 'Revisión de proyectos Q4', '2025-12-12', '14:00', '16:00', 'Investigación', 'bg-secondary', 'medium'),
('Webinar Bioquímica', 'Avances en técnicas de análisis molecular', '2025-12-15', '10:00', '11:30', 'Capacitaciones', 'bg-violet-500', 'low'),
('Revisión de Protocolos', 'Actualización de documentación ISO', '2025-12-09', '11:00', '12:30', 'Administración', 'bg-amber-500', 'high'),
('Entrega de Reportes', 'Fecha límite para reportes mensuales', '2025-12-09', '17:00', '18:00', 'Administración', 'bg-pink-500', 'medium');