import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocalePreferences, CurrencyCode } from '@/contexts/LocalePreferencesContext';

const STORAGE_KEY = 'locale_preferences_seen';

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
];

const currencyDefaults: Record<string, CurrencyCode> = {
  en: 'USD',
  vi: 'VND',
};

export default function LocalePreferenceDialog() {
  const { t, i18n } = useTranslation();
  const { currency, currencyOptions, setCurrency } = useLocalePreferences();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('vi') ? 'vi' : 'en');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);

  useEffect(() => {
    setOpen(localStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  const chooseLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    setSelectedCurrency(currencyDefaults[nextLanguage] || 'USD');
  };

  const savePreferences = () => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    setCurrency(selectedCurrency);
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100vw-32px)] rounded-3xl border-0 p-5 shadow-2xl sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('preferences.title')}</DialogTitle>
          <DialogDescription>{t('preferences.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Globe2 className="h-4 w-4 text-primary" />
              {t('preferences.language')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => chooseLanguage(option.code)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    language === option.code
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted/40 text-foreground hover:border-primary/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <WalletCards className="h-4 w-4 text-primary" />
              {t('preferences.currency')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setSelectedCurrency(option.code)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selectedCurrency === option.code
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="block text-sm font-bold">{option.code}</span>
                  <span className="block text-xs text-muted-foreground">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t('preferences.currency_note')}</p>
          </section>
        </div>

        <Button type="button" variant="hero" size="lg" className="w-full" onClick={savePreferences}>
          {t('preferences.save')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
