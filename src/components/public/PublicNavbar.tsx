import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface PublicNavbarProps {
  fullName: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ fullName }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Tentang', href: '#tentang' },
    { label: 'Keahlian', href: '#skills' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Pengalaman', href: '#pengalaman' },
    { label: 'Pelatihan', href: '#pelatihan' },
    { label: 'Bahasa', href: '#bahasa' },
    { label: 'Kontak', href: '#kontak' },
  ];

  const handleScroll = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a
          href="#tentang"
          onClick={(e) => {
            e.preventDefault();
            handleScroll('#tentang');
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors"
        >
          <span>{fullName || 'Portofolio'}</span>
          <span className="text-blue-600 font-extrabold ml-0.5">.</span>
        </a>

        {/* Desktop Navigation Links (No Admin link per PRD 5.8) */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleScroll(link.href)}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleScroll(link.href)}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
