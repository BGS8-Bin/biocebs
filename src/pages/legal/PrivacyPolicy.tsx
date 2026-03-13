import { MainLayout } from '@/components/layout/MainLayout';

export default function PrivacyPolicy() {
    return (
        <MainLayout>
            <div className="container-app py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-2">Aviso de Privacidad</h1>
                <p className="text-sm text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">1. Responsable del tratamiento</h2>
                        <p>
                            BIOCEBS® (Biotecnología, Ciencias y Bienestar para la Salud), con domicilio en Torreón, Coahuila, México,
                            es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos
                            Personales en Posesión de los Particulares (LFPDPPP).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">2. Datos personales que recabamos</h2>
                        <p>Recabamos los siguientes datos personales:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Nombre completo</li>
                            <li>Correo electrónico</li>
                            <li>Teléfono de contacto</li>
                            <li>Domicilio de envío (para compras en línea)</li>
                            <li>Información de pago (procesada de forma segura por terceros certificados)</li>
                            <li>Historial de compras y cursos realizados</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">3. Finalidades del tratamiento</h2>
                        <p>Sus datos son utilizados para:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Procesar pedidos y gestionar entregas</li>
                            <li>Brindar acceso a la plataforma académica y cursos adquiridos</li>
                            <li>Enviar notificaciones transaccionales (confirmación de pago, estado de envío)</li>
                            <li>Atender solicitudes de soporte</li>
                            <li>Finalidades secundarias: envío de comunicaciones comerciales y promocionalesHYPERLINK (con posibilidad de cancelación)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">4. Transferencia de datos</h2>
                        <p>
                            Sus datos no serán transferidos a terceros sin su consentimiento, salvo en los casos previstos por la ley
                            o cuando sea necesario para la prestación del servicio (ej. procesadores de pago, empresas de mensajería).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">5. Derechos ARCO</h2>
                        <p>
                            Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales.
                            Para ejercer estos derechos, envíe un correo a{' '}
                            <a href="mailto:samirbiocebs@gmail.com" className="text-primary hover:underline">
                                samirbiocebs@gmail.com
                            </a>{' '}
                            con el asunto "Derechos ARCO".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">6. Seguridad de la información</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales
                            contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">7. Cambios al aviso de privacidad</h2>
                        <p>
                            Cualquier modificación a este aviso será publicada en este mismo sitio. Le recomendamos revisarlo
                            periódicamente.
                        </p>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
