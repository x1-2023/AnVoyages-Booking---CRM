import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Search, Newspaper, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tabs = [
  { to: '/', labelKey: 'nav.home', icon: Home, exact: true },
  { to: '/destinations', labelKey: 'nav.destinations', icon: Map },
  { to: '/properties', labelKey: 'nav.properties', icon: Search },
  { to: '/blog', labelKey: 'nav.blog', icon: Newspaper },
  { to: '/contact', labelKey: 'nav.contact', icon: MessageCircle },
];

function isActive(pathname: string, tab: (typeof tabs)[number]) {
  return tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
}

export default function PublicBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-border/80 bg-card p-1.5 shadow-2xl shadow-slate-950/18 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const active = isActive(location.pathname, tab);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[10px] font-bold transition-all duration-200 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="max-w-full truncate">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
