import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/hooks/useCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { CartDrawer } from "@/components/tienda/CartDrawer";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Academia from "./pages/Academia";
import Aula from "./pages/academia/Aula";
import InstructorPanel from "./pages/academia/InstructorPanel";
import CursoDetalle from "./pages/academia/CursoDetalle";
import Leccion from "./pages/academia/Leccion";
import Certificado from "./pages/academia/Certificado";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Blog from "./pages/Blog";
import Eventos from "./pages/Eventos";
import Contacto from "./pages/Contacto";
import Tienda from "./pages/Tienda";
import ProductoDetalle from "./pages/ProductoDetalle";
import Checkout from "./pages/Checkout";
import PedidoConfirmado from "./pages/PedidoConfirmado";
import MiCuenta from "./pages/MiCuenta";
import MisPedidos from "./pages/MisPedidos";
import MiPerfil from "./pages/MiPerfil";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsuarios from "./pages/admin/Usuarios";
import AcademiaAdmin from "./pages/admin/AcademiaAdmin";
import Departamentos from "./pages/admin/Departamentos";
import Documentos from "./pages/admin/Documentos";
import Calendario from "./pages/admin/Calendario";
import Comunicacion from "./pages/admin/Comunicacion";
import ProductosAdmin from "./pages/admin/ProductosAdmin";
import ModulosAdmin from "./pages/admin/ModulosAdmin";

import { CookieBanner } from "@/components/layout/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <CartDrawer />
                <CookieBanner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/nosotros" element={<Nosotros />} />
                  <Route path="/servicios" element={<Servicios />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/contacto" element={<Contacto />} />

                  {/* Academia & LMS routes */}
                  <Route path="/academia" element={<Academia />} />
                  <Route path="/academia/aula" element={<Aula />} />
                  <Route path="/academia/instructor" element={<InstructorPanel />} />
                  <Route path="/academia/curso/:slug" element={<CursoDetalle />} />
                  <Route path="/academia/curso/:slug/leccion/:lessonId" element={<Leccion />} />
                  <Route path="/certificado/:code" element={<Certificado />} />

                  {/* Store routes */}
                  <Route path="/tienda" element={<Tienda />} />
                  <Route path="/tienda/:slug" element={<ProductoDetalle />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/pedido-confirmado/:orderId" element={<PedidoConfirmado />} />
                  <Route path="/mi-cuenta" element={<MiCuenta />} />
                  <Route path="/mis-pedidos" element={<MisPedidos />} />
                  <Route path="/mi-perfil" element={<MiPerfil />} />

                  {/* Legal routes */}
                  <Route path="/privacidad" element={<PrivacyPolicy />} />
                  <Route path="/terminos" element={<TermsOfService />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                  <Route path="/admin/academia" element={<AcademiaAdmin />} />
                  <Route path="/admin/departamentos" element={<Departamentos />} />
                  <Route path="/admin/documentos" element={<Documentos />} />
                  <Route path="/admin/calendario" element={<Calendario />} />
                  <Route path="/admin/comunicacion" element={<Comunicacion />} />
                  <Route path="/admin/tienda" element={<ProductosAdmin />} />
                  <Route path="/admin/modulos" element={<ModulosAdmin />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
