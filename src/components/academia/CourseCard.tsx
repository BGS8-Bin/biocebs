import { Link } from 'react-router-dom';
import { Clock, Users, BarChart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface CourseCardProps {
  id: string;
  title: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  categoryName?: string;
  level: string;
  durationHours: number;
  instructorName?: string;
  isFeatured?: boolean;
  enrolledCount?: number;
  rating?: number;
}

const levelColors: Record<string, string> = {
  principiante: 'bg-success/10 text-success border-success/20',
  intermedio: 'bg-warning/10 text-warning border-warning/20',
  avanzado: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function CourseCard({
  id,
  title,
  shortDescription,
  thumbnailUrl,
  categoryName,
  level,
  durationHours,
  instructorName,
  isFeatured,
  enrolledCount = 0,
  rating = 0,
}: CourseCardProps) {
  return (
    <Link to={`/academia/cursos/${id}`}>
      <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="text-4xl font-bold text-primary/30">
                {title.charAt(0)}
              </span>
            </div>
          )}
          {isFeatured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              <Star className="mr-1 h-3 w-3" />
              Destacado
            </Badge>
          )}
          {categoryName && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-3 bg-background/90 backdrop-blur-sm"
            >
              {categoryName}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Level Badge */}
          <Badge variant="outline" className={`mb-3 ${levelColors[level] || ''}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>

          {/* Description */}
          {shortDescription && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {shortDescription}
            </p>
          )}

          {/* Instructor */}
          {instructorName && (
            <p className="text-sm text-muted-foreground">
              Por <span className="font-medium text-foreground">{instructorName}</span>
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {durationHours}h
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {enrolledCount}
            </span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm font-medium text-warning">
              <Star className="h-4 w-4 fill-current" />
              {rating.toFixed(1)}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
