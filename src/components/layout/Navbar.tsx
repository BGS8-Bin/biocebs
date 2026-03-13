import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, GraduationCap, BookOpen, ShoppingCart, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import logoVerde from '@/assets/logo-verde.png';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, isAdmin, isInstructor } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const navigate = useNavigate();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/nosotros', label: t('nav.about') },
    { href: '/servicios', label: t('nav.services') },
    { href: '/contacto', label: t('nav.contact') },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoVerde} alt="BIOCEBS" className="h-11 w-11 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                  <span>{language.toUpperCase()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('es')} className={language === 'es' ? 'bg-muted' : ''}>
                  🇲🇽 Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-muted' : ''}>
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{currency}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableCurrencies.map((curr) => (
                  <DropdownMenuItem
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={currency === curr ? 'bg-muted' : ''}
                  >
                    {curr === 'MXN' && '🇲🇽'} {curr === 'USD' && '🇺🇸'} {curr === 'EUR' && '🇪🇺'} {curr}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name} />
                      <AvatarFallback className="bg-sage-green text-white text-sm">
                        {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-sage-green text-white text-xs">
                        {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/academia/aula" className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {t('nav.myClassroom')}
                    </Link>
                  </DropdownMenuItem>
                  {isInstructor() && (
                    <DropdownMenuItem asChild>
                      <Link to="/academia/instructor" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        {t('nav.instructorPanel')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t('nav.admin')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-border pb-4 pt-2 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Language/Currency */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-border mt-2">
                <button
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {language.toUpperCase()}
                </button>
                <button
                  onClick={() => {
                    const idx = availableCurrencies.indexOf(currency);
                    setCurrency(availableCurrencies[(idx + 1) % availableCurrencies.length]);
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <DollarSign className="h-4 w-4" />
                  {currency}
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2 px-4">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/academia/aula" onClick={() => setIsOpen(false)}>
                        {t('nav.employeePortal')}
                      </Link>
                    </Button>
                    {isAdmin() && (
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          {t('nav.admin')}
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSignOut} className="w-full">
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        {t('nav.login')}
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/auth?mode=register" onClick={() => setIsOpen(false)}>
                        {t('nav.register')}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
