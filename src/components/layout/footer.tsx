// @ts-nocheck
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#',
      label: 'Facebook'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: '#',
      label: 'Instagram'
    },
    {
      name: 'Youtube',
      icon: Youtube,
      href: '#',
      label: 'Youtube'
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:contact@quizy.com',
      label: 'Email'
    }
  ];

  return (
    <footer className="bg-slate-700 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Social Media Icons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-8 md:space-x-16 mb-12">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <div key={social.name} className="flex flex-col items-center space-y-3 group">
                <Link
                  href={social.href}
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/25 hover:bg-primary/90"
                  aria-label={social.label}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                </Link>
                <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                  {social.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-white/80">
            Tous les droits sont réservés © {currentYear} EURL QUIZY
          </p>
        </div>
      </div>
    </footer>
  );
}