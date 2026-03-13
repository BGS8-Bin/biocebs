import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translations = {
  // ── Navbar ──────────────────────────────────────────────────────────────────
  'nav.home':            { es: 'Inicio',                 en: 'Home' },
  'nav.about':           { es: 'Nosotros',               en: 'About Us' },
  'nav.store':           { es: 'Tienda',                 en: 'Store' },
  'nav.services':        { es: 'Servicios',              en: 'Services' },
  'nav.blog':            { es: 'Blog',                   en: 'Blog' },
  'nav.events':          { es: 'Eventos',                en: 'Events' },
  'nav.contact':         { es: 'Contacto',               en: 'Contact' },
  'nav.login':           { es: 'Iniciar sesión',         en: 'Login' },
  'nav.register':        { es: 'Registrarse',            en: 'Register' },
  'nav.logout':          { es: 'Cerrar sesión',          en: 'Logout' },
  'nav.myClassroom':     { es: 'Mi Aula (LMS)',          en: 'My Classroom (LMS)' },
  'nav.instructorPanel': { es: 'Panel Instructor',       en: 'Instructor Panel' },
  'nav.admin':           { es: 'Administración',         en: 'Administration' },
  'nav.employeePortal':  { es: 'Portal Empleados (LMS)', en: 'Employee Portal (LMS)' },

  // ── Footer ───────────────────────────────────────────────────────────────────
  'footer.store':           { es: 'Tienda',                                                       en: 'Store' },
  'footer.company':         { es: 'Compañía',                                                     en: 'Company' },
  'footer.joinCommunity':   { es: 'Únete a la comunidad',                                        en: 'Join our community' },
  'footer.newsletter':      { es: 'Recibe artículos y promociones exclusivas.',                   en: 'Receive exclusive articles and promotions.' },
  'footer.emailPlaceholder':{ es: 'Tu correo electrónico',                                       en: 'Your email' },
  'footer.rights':          { es: 'Todos los derechos reservados.',                              en: 'All rights reserved.' },
  'footer.terms':           { es: 'Términos y Condiciones',                                      en: 'Terms & Conditions' },
  'footer.privacy':         { es: 'Política de Privacidad',                                      en: 'Privacy Policy' },
  'footer.philosophy':      { es: 'Nuestra Filosofía',                                           en: 'Our Philosophy' },
  'footer.resources':       { es: 'Blog (Recursos)',                                             en: 'Blog (Resources)' },
  'footer.contact':         { es: 'Contacto',                                                    en: 'Contact' },
  'footer.tagline':         { es: 'Ciencia y naturaleza en equilibrio para tu bienestar integral.', en: 'Science and nature in balance for your integral well-being.' },

  // ── Store ────────────────────────────────────────────────────────────────────
  'store.mindFocus':    { es: 'Mente y Enfoque',      en: 'Mind & Focus' },
  'store.gutHealth':    { es: 'Salud Intestinal',      en: 'Gut Health' },
  'store.energyVitality':{ es: 'Energía y Vitalidad', en: 'Energy & Vitality' },
  'store.viewAll':      { es: 'Ver Todo',              en: 'View All' },
  'store.addToCart':    { es: 'Añadir al carrito',     en: 'Add to cart' },
  'store.outOfStock':   { es: 'Agotado',               en: 'Out of stock' },
  'store.featured':     { es: 'Destacado',             en: 'Featured' },

  // ── Common ───────────────────────────────────────────────────────────────────
  'common.search':   { es: 'Buscar',     en: 'Search' },
  'common.filter':   { es: 'Filtrar',    en: 'Filter' },
  'common.sort':     { es: 'Ordenar',    en: 'Sort' },
  'common.price':    { es: 'Precio',     en: 'Price' },
  'common.name':     { es: 'Nombre',     en: 'Name' },
  'common.category': { es: 'Categoría', en: 'Category' },
  'common.all':      { es: 'Todas',      en: 'All' },

  // ── Landing / Home ───────────────────────────────────────────────────────────
  'home.hero.subtitle':   { es: 'Redescubre tu bienestar con medicina funcional y suplementos puros diseñados para ti.', en: 'Rediscover your well-being with functional medicine and pure supplements designed for you.' },
  'home.hero.cta':        { es: 'Explorar Servicios',             en: 'Explore Services' },
  'home.services.title':  { es: 'Encuentra tu Bienestar',         en: 'Find Your Well-being' },
  'home.products.title':  { es: 'Los Más Vendidos',               en: 'Best Sellers' },
  'home.process.title':   { es: '¿Primera vez en BIOCEBS?',       en: 'First time at BIOCEBS?' },
  'home.process.subtitle':{ es: 'Así comienza tu tratamiento integral.', en: 'This is how your comprehensive treatment begins.' },
  'home.process.cta':     { es: 'Agendar una Valoración',         en: 'Schedule an Assessment' },
  'home.product.link':    { es: 'Solicitar información',          en: 'Request information' },

  // Services shown in home cards (short context)
  'home.service.stemcell.subtitle': { es: '5 tratamientos regenerativos',                         en: '5 regenerative treatments' },
  'home.service.stemcell.desc':     { es: 'Tratamiento de regeneración celular intravenosa',      en: 'Intravenous cellular regeneration treatment' },
  'home.service.aparato.subtitle':  { es: 'Tratamiento basado en estímulos físicos controlados', en: 'Treatment based on controlled physical stimuli' },
  'home.service.aparato.desc':      { es: 'Tecnología no invasiva de alta precisión',             en: 'High-precision non-invasive technology' },
  'home.service.suero.subtitle':    { es: '12 fórmulas especializadas',                           en: '12 specialized formulas' },
  'home.service.suero.desc':        { es: 'Nutrición celular intravenosa',                        en: 'Intravenous cellular nutrition' },
  'home.service.suplementos.title':    { es: 'Suplementos',                    en: 'Supplements' },
  'home.service.suplementos.subtitle': { es: '20 fórmulas adaptogénicas',      en: '20 adaptogenic formulas' },
  'home.service.suplementos.desc':     { es: 'Bienestar integral natural',      en: 'Natural comprehensive well-being' },
  'home.service.consulta.subtitle': { es: 'Consultas y diagnósticos',           en: 'Consultations and diagnostics' },
  'home.service.consulta.desc':     { es: 'Atención integral personalizada',    en: 'Personalized comprehensive care' },

  // Products
  'home.product.biocalm.tagline':  { es: 'Reduce el estrés y mejora tu claridad mental de manera natural.',                      en: 'Reduce stress and improve your mental clarity naturally.' },
  'home.product.biocalm.desc':     { es: 'Reduce el estrés y mejora tu claridad mental de manera natural.',                      en: 'Reduce stress and improve your mental clarity naturally.' },
  'home.product.bibrain.tagline':  { es: 'Mayor concentración, memoria y agilidad mental.',                                       en: 'Greater concentration, memory, and mental agility.' },
  'home.product.bibrain.desc':     { es: 'Potencia tu mente, memoria y agilidad mental con adaptógenos.',                        en: 'Enhance your mind, memory, and mental agility with adaptogens.' },
  'home.product.bigastro.tagline': { es: 'Contiene adaptógenos y hongos funcionales para restaurar tu flora intestinal.',        en: 'Contains adaptogens and functional mushrooms to restore your intestinal flora.' },
  'home.product.bigastro.desc':    { es: 'Restaura tu flora intestinal con hongos funcionales.',                                  en: 'Restore your intestinal flora with functional mushrooms.' },

  // ── About Page ───────────────────────────────────────────────────────────────
  'about.hero.title':    { es: 'Nuestra Historia', en: 'Our History' },
  'about.hero.subtitle': { es: 'BIOCEBS nace de la búsqueda por mejorar la calidad de vida de las personas mediante la integración de la ciencia moderna con saberes tradicionales.', en: 'BIOCEBS was born from the search to improve people\'s quality of life by integrating modern science with traditional knowledge.' },

  'about.who.title': { es: '¿Quiénes Somos?', en: 'Who Are We?' },
  'about.who.p1':    { es: 'BIOCEBS es una institución dirigida a impulsar el bienestar integral del ser humano mediante un enfoque multidimensional, centrado en la medicina funcional, la investigación aplicada, la innovación terapéutica y la educación clínica.', en: 'BIOCEBS is an institution dedicated to promoting the comprehensive well-being of human beings through a multidimensional approach, focused on functional medicine, applied research, therapeutic innovation, and clinical education.' },
  'about.who.p2':    { es: 'Fundada con la visión de consolidarse como el ecosistema líder de medicina funcional y terapias avanzadas en el mundo hispano, siendo reconocida por la excelencia de sus productos, la profundidad de sus procesos formativos, la integridad de su modelo clínico y la innovación en cada una de sus soluciones.', en: 'Founded with the vision of consolidating itself as the leading ecosystem of functional medicine and advanced therapies in the Hispanic world, recognized for the excellence of its products, the depth of its training processes, the integrity of its clinical model, and the innovation in each of its solutions.' },
  'about.who.p3':    { es: 'Nuestro equipo multidisciplinario de profesionales está comprometido con ofrecer soluciones personalizadas que promuevan el bienestar duradero.', en: 'Our multidisciplinary team of professionals is committed to offering personalized solutions that promote lasting well-being.' },

  'about.mission.title': { es: 'Misión',  en: 'Mission' },
  'about.mission.desc':  { es: 'Promover la salud integral a través de la medicina funcional, la investigación científica y la educación continua, ofreciendo soluciones personalizadas basadas en la naturaleza y respaldadas por la ciencia.', en: 'Promote comprehensive health through functional medicine, scientific research, and continuing education, offering personalized solutions based on nature and backed by science.' },
  'about.vision.title':  { es: 'Visión',  en: 'Vision' },
  'about.vision.desc':   { es: 'Ser el referente nacional e internacional en biociencias y medicina funcional, transformando la forma en que las personas cuidan su salud y bienestar a través de un enfoque holístico e innovador.', en: 'To be the national and international benchmark in biosciences and functional medicine, transforming the way people care for their health and well-being through a holistic and innovative approach.' },

  // Values
  'about.values.title':              { es: 'Nuestros Valores', en: 'Our Values' },
  'about.values.ethics':             { es: 'Ética',            en: 'Ethics' },
  'about.values.ethics.desc':        { es: 'Actuar con integridad, profesionalismo y responsabilidad en cada proceso.', en: 'Acting with integrity, professionalism, and responsibility in every process.' },
  'about.values.science':            { es: 'Ciencia',          en: 'Science' },
  'about.values.science.desc':       { es: 'Fundamentar todos nuestros productos, servicios y contenidos en evidencia científica actualizada y validada.', en: 'Grounding all our products, services, and content in updated and validated scientific evidence.' },
  'about.values.innovation':         { es: 'Innovación',       en: 'Innovation' },
  'about.values.innovation.desc':    { es: 'Diseñar soluciones que anticipen las necesidades del entorno y mejoren los resultados clínicos, educativos y empresariales.', en: 'Designing solutions that anticipate environmental needs and improve clinical, educational, and business outcomes.' },
  'about.values.humanism':           { es: 'Humanismo',        en: 'Humanism' },
  'about.values.humanism.desc':      { es: 'Poner al ser humano en el centro de todas nuestras acciones.', en: 'Placing the human being at the center of all our actions.' },
  'about.values.community':          { es: 'Comunidad',        en: 'Community' },
  'about.values.community.desc':     { es: 'Generar redes de colaboración entre profesionales, pacientes, instituciones y aliados.', en: 'Building collaboration networks among professionals, patients, institutions, and allies.' },
  'about.values.transparency':       { es: 'Transparencia',    en: 'Transparency' },
  'about.values.transparency.desc':  { es: 'Mantener una comunicación clara, honesta y documentada con nuestros colaboradores.', en: 'Maintaining clear, honest, and documented communication with our collaborators.' },

  // Departments
  'about.departments.title':       { es: 'Nuestros Departamentos',                 en: 'Our Departments' },
  'about.dept.biomed.desc':        { es: 'Medicina funcional y regenerativa',       en: 'Functional and regenerative medicine' },
  'about.dept.biodesign.desc':     { es: 'Diseño de tratamientos personalizados',  en: 'Design of personalized treatments' },
  'about.dept.biorganic.desc':     { es: 'Suplementación y adaptógenos naturales', en: 'Supplementation and natural adaptogens' },
  'about.dept.bioacademy.desc':    { es: 'Capacitación y educación continua',      en: 'Training and continuing education' },

  // Team
  'about.team.title':                  { es: 'Nuestro Equipo',             en: 'Our Team' },
  'about.team.role.director':          { es: 'C.E.O / Dirección Administrativa', en: 'C.E.O / Administrative Director' },
  'about.team.role.medical_director':  { es: 'Dirección Médica',           en: 'Medical Director' },
  'about.team.role.academic_coord':    { es: 'Coordinadora Académica',     en: 'Academic Coordinator' },
  'about.team.role.research':          { es: 'Investigación y Desarrollo', en: 'Research & Development' },

  // ── Services Page ─────────────────────────────────────────────────────────────
  'services.hero.title':    { es: 'Nuestros Servicios', en: 'Our Services' },
  'services.hero.subtitle': { es: 'Medicina funcional y tratamientos de vanguardia para tu bienestar integral.', en: 'Functional medicine and cutting-edge treatments for your integral well-being.' },
  'services.main.title':    { es: 'Servicios Principales', en: 'Main Services' },

  'services.dermapen.title':    { es: 'Tratamiento de células madre',                  en: 'Stem Cell Treatment' },
  'services.dermapen.subtitle': { es: '5 tratamientos regenerativos',                  en: '5 regenerative treatments' },
  'services.dermapen.desc':     { es: 'Tratamiento avanzado de regeneración celular intravenosa con células madre para resultados terapéuticos profundos y duraderos.', en: 'Advanced intravenous cellular regeneration treatment with stem cells for deep and lasting therapeutic results.' },

  'services.botox.title':    { es: 'Aparatología',                                      en: 'Medical Equipment Therapy' },
  'services.botox.subtitle': { es: 'Tratamiento basado en estímulos físicos controlados', en: 'Treatment based on controlled physical stimuli' },
  'services.botox.desc':     { es: 'Tecnología de vanguardia basada en estímulos físicos controlados para tratamientos no invasivos con resultados clínicamente comprobados.', en: 'Cutting-edge technology based on controlled physical stimuli for non-invasive treatments with clinically proven results.' },

  'services.iv.title':    { es: 'Sueroterapia',               en: 'IV Therapy' },
  'services.iv.subtitle': { es: 'Nutrición celular intravenosa', en: 'Intravenous cellular nutrition' },
  'services.iv.desc':     { es: '12 fórmulas especializadas de sueros intravenosos con vitaminas, minerales y antioxidantes para revitalización celular.', en: '12 specialized IV formulas with vitamins, minerals, and antioxidants for cellular revitalization.' },

  'services.medical.title':    { es: 'Consulta Integral',         en: 'Comprehensive Consultation' },
  'services.medical.subtitle': { es: 'Medicina funcional integral', en: 'Integral functional medicine' },
  'services.medical.desc':     { es: 'Evaluación médica completa con enfoque funcional para identificar y tratar las causas raíz de los desequilibrios de salud.', en: 'Complete medical evaluation with a functional approach to identify and treat the root causes of health imbalances.' },

  'services.specialties.title':    { es: 'Especialidades',            en: 'Specialties' },
  'services.spec.neuro.title':     { es: 'Neurología Funcional',      en: 'Functional Neurology' },
  'services.spec.neuro.desc':      { es: 'Optimización del sistema nervioso y salud cognitiva.', en: 'Optimization of the nervous system and cognitive health.' },
  'services.spec.cardio.title':    { es: 'Cardiometabólico',          en: 'Cardiometabolic' },
  'services.spec.cardio.desc':     { es: 'Prevención y manejo de enfermedades cardiovasculares.', en: 'Prevention and management of cardiovascular diseases.' },
  'services.spec.genomic.title':   { es: 'Medicina Genómica',         en: 'Genomic Medicine' },
  'services.spec.genomic.desc':    { es: 'Tratamientos personalizados basados en tu perfil genético.', en: 'Personalized treatments based on your genetic profile.' },
  'services.spec.hormone.title':   { es: 'Hormonas y Metabolismo',    en: 'Hormones & Metabolism' },
  'services.spec.hormone.desc':    { es: 'Balance hormonal y optimización metabólica.', en: 'Hormonal balance and metabolic optimization.' },

  'services.process.title':       { es: 'Nuestro Proceso',                               en: 'Our Process' },
  'services.process.subtitle':    { es: 'Un enfoque estructurado para tu bienestar integral.', en: 'A structured approach to your integral well-being.' },
  'services.process.step1.title': { es: 'Consulta Inicial',                              en: 'Initial Consultation' },
  'services.process.step1.desc':  { es: 'Evaluamos tu historial médico, estilo de vida y objetivos de salud.', en: 'We evaluate your medical history, lifestyle, and health goals.' },
  'services.process.step2.title': { es: 'Diagnóstico',                                   en: 'Diagnosis' },
  'services.process.step2.desc':  { es: 'Realizamos pruebas especializadas para identificar desequilibrios.', en: 'We perform specialized tests to identify imbalances.' },
  'services.process.step3.title': { es: 'Plan Personalizado',                            en: 'Personalized Plan' },
  'services.process.step3.desc':  { es: 'Diseñamos un protocolo único adaptado a tus necesidades.', en: 'We design a unique protocol adapted to your needs.' },
  'services.process.step4.title': { es: 'Seguimiento',                                   en: 'Follow-up' },
  'services.process.step4.desc':  { es: 'Monitoreamos tu progreso y ajustamos el tratamiento.', en: 'We monitor your progress and adjust the treatment.' },

  'services.cta.title':  { es: '¿Listo para comenzar?', en: 'Ready to start?' },
  'services.cta.desc':   { es: 'Agenda tu consulta inicial y descubre cómo podemos ayudarte a alcanzar tu bienestar óptimo.', en: 'Schedule your initial consultation and discover how we can help you achieve optimal well-being.' },
  'services.cta.button': { es: 'Agendar Consulta',      en: 'Schedule Consultation' },

  // ── Contact Page ─────────────────────────────────────────────────────────────
  'contact.hero.title':    { es: 'Contacto',                                                           en: 'Contact' },
  'contact.hero.subtitle': { es: 'Estamos aquí para ayudarte. Contáctanos y comienza tu camino hacia el bienestar.', en: 'We are here to help you. Contact us and begin your path to well-being.' },

  'contact.form.title':               { es: 'Envíanos un mensaje',              en: 'Send us a message' },
  'contact.form.subtitle':            { es: 'Completa el formulario y te responderemos a la brevedad.', en: 'Complete the form and we will respond as soon as possible.' },
  'contact.form.name':                { es: 'Nombre completo',                  en: 'Full name' },
  'contact.form.email':               { es: 'Correo electrónico',               en: 'Email address' },
  'contact.form.phone':               { es: 'Teléfono',                         en: 'Phone' },
  'contact.form.subject':             { es: 'Asunto',                           en: 'Subject' },
  'contact.form.subject.placeholder': { es: 'Selecciona un asunto',             en: 'Select a subject' },
  'contact.form.message':             { es: 'Mensaje',                          en: 'Message' },
  'contact.form.send':                { es: 'Enviar mensaje',                   en: 'Send message' },
  'contact.form.sending':             { es: 'Enviando...',                      en: 'Sending...' },

  'contact.info.title':    { es: 'Información de contacto',               en: 'Contact information' },
  'contact.info.subtitle': { es: 'También puedes contactarnos directamente.', en: 'You can also contact us directly.' },

  'contact.label.address': { es: 'Dirección',          en: 'Address' },
  'contact.label.phone':   { es: 'Teléfono / WhatsApp', en: 'Phone / WhatsApp' },
  'contact.label.email':   { es: 'Correo',              en: 'Email' },
  'contact.label.hours':   { es: 'Horario',             en: 'Hours' },

  'contact.whatsapp.title':   { es: '¿Prefieres WhatsApp?',   en: 'Prefer WhatsApp?' },
  'contact.whatsapp.subtitle':{ es: 'Escríbenos directamente', en: 'Write to us directly' },
  'contact.whatsapp.button':  { es: 'Abrir Chat',             en: 'Open Chat' },

  'contact.map.title':       { es: 'Encuéntranos',                                     en: 'Find Us' },
  'contact.map.subtitle':    { es: 'Visítanos en nuestras instalaciones en Torreón, Coahuila.', en: 'Visit us at our facilities in Torreón, Coahuila.' },
  'contact.map.placeholder': { es: 'Mapa próximamente',                                en: 'Map coming soon' },

  'contact.toast.title': { es: '¡Mensaje enviado!',                      en: 'Message sent!' },
  'contact.toast.desc':  { es: 'Nos pondremos en contacto contigo pronto.', en: 'We will get in touch with you soon.' },

  'contact.subject.medical':      { es: 'Consulta médica',          en: 'Medical consultation' },
  'contact.subject.services':     { es: 'Información de servicios', en: 'Service information' },
  'contact.subject.products':     { es: 'Información de productos', en: 'Product information' },
  'contact.subject.events':       { es: 'Eventos y capacitaciones', en: 'Events and training' },
  'contact.subject.lms':          { es: 'Portal LMS / Academia',    en: 'LMS Portal / Academy' },
  'contact.subject.partnerships': { es: 'Alianzas comerciales',     en: 'Business partnerships' },
  'contact.subject.other':        { es: 'Otro',                     en: 'Other' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
