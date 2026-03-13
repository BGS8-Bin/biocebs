import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_KEY = 'biocebs_cookie_consent';

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY);
        if (!consent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem(COOKIE_KEY, 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg p-4">
            <div className="container-app flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm text-foreground font-medium mb-1">🍪 Usamos cookies</p>
                    <p className="text-xs text-muted-foreground">
                        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
                        <a href="/privacidad" className="text-primary hover:underline">Política de Privacidad</a>{' '}
                        y el uso de cookies.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={decline}>Rechazar</Button>
                    <Button size="sm" onClick={accept}>Aceptar todas</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={decline}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
