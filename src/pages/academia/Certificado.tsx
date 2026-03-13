import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award, Download, XCircle, QrCode } from 'lucide-react';
import { getCertificateByCode, downloadCertificatePdf } from '@/lib/certificateService';
import { useAuth } from '@/lib/auth';

interface CertData {
    id: string;
    issued_at: string;
    verification_code: string;
    user: { full_name: string };
    course: { title: string; duration_hours: number };
}

export default function Certificado() {
    const { code } = useParams<{ code: string }>();
    const { user } = useAuth();
    const [cert, setCert] = useState<CertData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (code) fetchCert();
    }, [code]);

    const fetchCert = async () => {
        const data = await getCertificateByCode(code!);
        setCert(data as CertData | null);
        setLoading(false);
    };

    const handleDownload = async () => {
        if (!cert) return;
        setDownloading(true);
        try {
            await downloadCertificatePdf({
                studentName: cert.user.full_name,
                courseName: cert.course.title,
                courseHours: cert.course.duration_hours,
                issuedAt: cert.issued_at,
                verificationCode: cert.verification_code,
                verificationUrl: window.location.href,
            });
        } finally {
            setDownloading(false);
        }
    };

    const issuedDate = cert
        ? new Date(cert.issued_at).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : '';

    return (
        <MainLayout>
            <div className="container-app py-16 max-w-2xl">
                {loading ? (
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                    </div>
                ) : cert ? (
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
                        <CardContent className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                            </div>

                            <Badge className="mb-4 bg-green-600 text-white">
                                <Award className="mr-1 h-3 w-3" />
                                Certificado Verificado ✓
                            </Badge>

                            <h1 className="text-2xl font-bold text-foreground mb-2 mt-4">
                                Certificado de Finalización
                            </h1>
                            <p className="text-muted-foreground mb-8">
                                Este certificado es auténtico y fue emitido por BIOCEBS®
                            </p>

                            <div className="rounded-xl bg-white dark:bg-card border border-border p-6 text-left space-y-4 mb-8">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Estudiante</span>
                                    <span className="font-semibold text-right">{cert.user.full_name}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Curso</span>
                                    <span className="font-semibold text-right max-w-[60%]">{cert.course.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Duración</span>
                                    <span className="font-semibold">{cert.course.duration_hours} horas</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Fecha de emisión</span>
                                    <span className="font-semibold">{issuedDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Código de verificación</span>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {cert.verification_code.substring(0, 12).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button onClick={handleDownload} disabled={downloading} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    {downloading ? 'Generando PDF...' : 'Descargar Certificado PDF'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/academia">Ver más cursos</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-red-200">
                        <CardContent className="p-8 text-center">
                            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h1 className="text-xl font-bold mb-2">Certificado no encontrado</h1>
                            <p className="text-muted-foreground mb-6">
                                El código de verificación no corresponde a ningún certificado emitido por BIOCEBS®.
                            </p>
                            <Button asChild variant="outline">
                                <Link to="/">Ir al inicio</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
