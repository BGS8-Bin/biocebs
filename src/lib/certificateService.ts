/**
 * src/lib/certificateService.ts
 *
 * Genera certificados PDF con código QR verificable.
 * Usa jsPDF + qrcode (npm install jspdf qrcode @types/qrcode).
 * 
 * INSTALACIÓN:
 *   npm install jspdf qrcode
 *   npm install -D @types/qrcode
 */

import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
    studentName: string;
    courseName: string;
    courseHours: number;
    issuedAt: string; // ISO string
    verificationCode: string;
    verificationUrl: string;
}

/**
 * Genera un certificado para un usuario al completar un curso.
 * Crea el registro en la tabla `certificates` y devuelve el código de verificación.
 */
export async function issueCertificate(
    userId: string,
    courseId: string,
): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .upsert(
                { user_id: userId, course_id: courseId },
                { onConflict: 'user_id,course_id', ignoreDuplicates: false }
            )
            .select('verification_code')
            .single();

        if (error) throw error;
        return data?.verification_code ?? null;
    } catch (err) {
        console.error('Error issuing certificate:', err);
        return null;
    }
}

/**
 * Obtiene los datos de un certificado por su código de verificación.
 * Usado en la página pública de verificación.
 */
export async function getCertificateByCode(code: string) {
    const { data, error } = await supabase
        .from('certificates')
        .select(`
      id,
      issued_at,
      verification_code,
      user:profiles (full_name),
      course:courses (title, duration_hours)
    `)
        .eq('verification_code', code)
        .single();

    if (error || !data) return null;
    return data;
}

/**
 * Descarga un PDF del certificado usando jsPDF y QRCode.
 * Se llama solamente en el cliente (navegador).
 */
export async function downloadCertificatePdf(data: CertificateData): Promise<void> {
    // Importación dinámica para no aumentar el bundle inicial
    const [{ default: jsPDF }, QRCode] = await Promise.all([
        import('jspdf'),
        import('qrcode'),
    ]);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297; // ancho A4 landscape mm
    const H = 210; // alto A4 landscape mm

    // Fondo degradado simulado con rectángulos
    doc.setFillColor(15, 52, 40); // dark-green
    doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(26, 76, 59);
    doc.rect(0, 0, W, 8, 'F');
    doc.rect(0, H - 8, W, 8, 'F');

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('BIOCEBS® — Instituto de Biotecnología y Ciencias de la Salud', W / 2, 22, { align: 'center' });

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE FINALIZACIÓN', W / 2, 50, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 200);
    doc.text('Se certifica que', W / 2, 66, { align: 'center' });

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(data.studentName, W / 2, 82, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 200);
    doc.text('ha completado satisfactoriamente el curso:', W / 2, 96, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 196, 127); // sage-green
    doc.text(data.courseName, W / 2, 112, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 200);
    const issueDate = new Date(data.issuedAt).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.text(`Con una duración de ${data.courseHours} horas. Emitido el ${issueDate}.`, W / 2, 128, { align: 'center' });

    // Línea de firma
    doc.setDrawColor(140, 196, 127);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - 40, 155, W / 2 + 40, 155);
    doc.setFontSize(10);
    doc.setTextColor(140, 196, 127);
    doc.text('Dirección General BIOCEBS®', W / 2, 162, { align: 'center' });

    // QR de verificación
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#0f3428', light: '#ffffff' },
    });
    doc.addImage(qrDataUrl, 'PNG', W - 50, H - 52, 38, 38);
    doc.setFontSize(7);
    doc.setTextColor(160, 190, 160);
    doc.text('Escanea para verificar', W - 31, H - 12, { align: 'center' });
    doc.text(`Código: ${data.verificationCode.substring(0, 8).toUpperCase()}`, W - 31, H - 8, { align: 'center' });

    doc.save(`Certificado_BIOCEBS_${data.verificationCode.substring(0, 8)}.pdf`);
}
