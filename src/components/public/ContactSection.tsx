import React from 'react';
import { Mail, MessageCircle, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import { Contact } from '../../types.ts';

interface ContactSectionProps {
  contacts: Contact[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) return null;

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return <ExternalLink className="w-5 h-5 text-slate-600" />;
    }
  };

  const getHref = (type: string, value: string) => {
    if (type.toLowerCase() === 'whatsapp') {
      const cleanNum = value.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanNum}`;
    }
    if (type.toLowerCase() === 'email') {
      return value.startsWith('mailto:') ? value : `mailto:${value}`;
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    return `https://${value}`;
  };

  const getDisplayValue = (type: string, value: string) => {
    if (type.toLowerCase() === 'whatsapp') {
      return value.startsWith('https://wa.me/') ? value.replace('https://wa.me/', '+') : `+${value.replace(/[^0-9]/g, '')}`;
    }
    if (type.toLowerCase() === 'email') {
      return value.replace('mailto:', '');
    }
    return value.replace(/^https?:\/\/(www\.)?/, '');
  };

  return (
    <section id="kontak" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-t border-slate-100">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 md:p-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Mari Terhubung</h2>
          <p className="mt-2 text-base text-slate-600">
            Terbuka untuk diskusi proyek, tawaran kerja sama, maupun sekadar bertukar sapa. Silakan hubungi melalui salah satu saluran berikut:
          </p>
        </div>

        {/* Contact Buttons / Direct Links Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contacts.map((contact) => {
            const href = getHref(contact.type, contact.value);
            return (
              <a
                key={contact.id}
                href={href}
                target={contact.type.toLowerCase() === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-sm hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50/70 flex items-center justify-center flex-shrink-0 transition-colors">
                  {getContactIcon(contact.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                    {contact.label || contact.type}
                  </div>
                  <div className="text-sm font-medium text-slate-800 truncate mt-0.5">
                    {getDisplayValue(contact.type, contact.value)}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
