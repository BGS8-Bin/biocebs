import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, ChevronLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MiPerfil() {
    const { user, profile } = useAuth();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone((profile as unknown as { phone?: string }).phone || '');
        }
        if (user) {
            setEmail(user.email || '');
        }
    }, [profile, user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone })
                .eq('id', user!.id);

            if (error) throw error;
            toast.success('Perfil actualizado correctamente');
        } catch (err) {
            toast.error('Error al guardar los cambios');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error('Error al cambiar la contraseña. Verifica tu sesión actual.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <MainLayout>
            <div className="container-app py-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/mi-cuenta"><ChevronLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Mi Perfil</h1>
                        <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
                    </div>
                </div>

                {/* Datos personales */}
                <Card className="border-border/50 mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información personal
                        </CardTitle>
                        <CardDescription>Tu nombre y datos de contacto visibles en la plataforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nombre completo</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="inline h-3 w-3 mr-1" />
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    value={email}
                                    disabled
                                    className="bg-muted/40 cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">El correo no puede modificarse desde aquí</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    <Phone className="inline h-3 w-3 mr-1" />
                                    Teléfono (opcional)
                                </Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+52 871 123 4567"
                                />
                            </div>
                            <Button type="submit" disabled={savingProfile}>
                                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Cambiar contraseña */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Cambiar contraseña
                        </CardTitle>
                        <CardDescription>Mínimo 8 caracteres</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nueva contraseña</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <Button type="submit" variant="outline" disabled={savingPassword || !newPassword}>
                                {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar contraseña
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
