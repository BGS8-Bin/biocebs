import { MainLayout } from '@/components/layout/MainLayout';

export default function TermsOfService() {
    return (
        <MainLayout>
            <div className="container-app py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-2">Términos y Condiciones de Uso</h1>
                <p className="text-sm text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">1. Aceptación de los términos</h2>
                        <p>
                            Al acceder y utilizar la plataforma BIOCEBS® (en adelante "la Plataforma"), usted acepta
                            estar vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con alguno
                            de estos términos, le pedimos que no utilice nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">2. Descripción del servicio</h2>
                        <p>
                            BIOCEBS® ofrece una plataforma integral que incluye: sitio institucional, tienda en línea
                            de productos de biotecnología y salud, y plataforma académica (LMS) con cursos especializados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">3. Registro y cuentas de usuario</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
                            <li>Cada cuenta es personal e intransferible.</li>
                            <li>BIOCEBS® se reserva el derecho de suspender cuentas que violen estos términos.</li>
                            <li>El usuario debe proporcionar información veraz al momento del registro.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">4. Compras y pagos</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA cuando corresponda.</li>
                            <li>El pago se procesa de forma segura a través de pasarelas certificadas.</li>
                            <li>BIOCEBS® no almacena datos de tarjetas de crédito/débito.</li>
                            <li>Las políticas de devolución aplican conforme a la Ley Federal de Protección al Consumidor (PROFECO).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">5. Plataforma académica</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>El acceso a los cursos es personal y no puede compartirse con terceros.</li>
                            <li>Los certificados emitidos son válidos con el código QR de verificación incluido.</li>
                            <li>El contenido de los cursos es propiedad intelectual de BIOCEBS® y sus instructores.</li>
                            <li>Queda prohibida la reproducción, descarga o distribución no autorizada del material de los cursos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">6. Propiedad intelectual</h2>
                        <p>
                            Todo el contenido de la Plataforma (textos, imágenes, videos, logotipos, diseños y material
                            académico) es propiedad de BIOCEBS® o sus licenciantes. Queda estrictamente prohibida su
                            reproducción sin autorización expresa por escrito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">7. Limitación de responsabilidad</h2>
                        <p>
                            BIOCEBS® no se hace responsable de daños directos o indirectos derivados del uso o
                            imposibilidad de uso de la Plataforma, incluyendo interrupciones del servicio por causas
                            ajenas a nuestra voluntad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">8. Modificaciones</h2>
                        <p>
                            BIOCEBS® se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios
                            entrarán en vigor al momento de su publicación en la Plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">9. Jurisdicción</h2>
                        <p>
                            Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
                            controversia, las partes se someten a la jurisdicción de los tribunales competentes de
                            Torreón, Coahuila.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">10. Contacto</h2>
                        <p>
                            Para cualquier consulta relacionada con estos Términos, escríbenos a{' '}
                            <a href="mailto:samirbiocebs@gmail.com" className="text-primary hover:underline">
                                samirbiocebs@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
