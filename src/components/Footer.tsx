import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';

const Footer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/destinations', label: t('nav.destinations') },
    { path: '/properties', label: t('nav.properties') },
    { path: '/blog', label: t('nav.blog') },
  ];

  const supportLinks = [
    { label: t('footer.help_center'), path: '#' },
    { label: t('footer.cancellation'), path: '#' },
    { label: t('footer.faq'), path: '#' },
    { label: t('footer.terms'), path: '#' },
  ];

  return (
    <footer className="bg-foreground text-card">
      <div className="container-custom mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-card">
                {settings.site_name || 'An Voyages'}
              </span>
            </Link>
            <p className="text-card/70 text-sm leading-relaxed">
              {settings.site_tagline || t('footer.description')}
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary transition-colors group"
                >
                  <Icon className="w-4 h-4 text-card/70 group-hover:text-primary-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">
              {t('footer.quick_links')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-card/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">
              {t('footer.support')}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-card/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">
              {t('footer.newsletter')}
            </h4>
            <p className="text-card/70 text-sm mb-4">
              {t('footer.newsletter_text')}
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="bg-card/10 border-card/20 text-card placeholder:text-card/50 focus:border-primary"
              />
              <Button variant="accent" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-card/10 text-center text-card/50 text-sm">
          {settings.footer_text || `© ${new Date().getFullYear()} An Voyages. ${t('footer.rights')}`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
