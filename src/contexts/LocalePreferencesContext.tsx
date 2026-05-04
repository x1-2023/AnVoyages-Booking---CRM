import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/contexts/SettingsContext';

export type CurrencyCode = 'VND' | 'USD' | 'GBP' | 'EUR';

interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  vndRate: number;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'VND', label: 'Vietnamese dong', symbol: '₫', vndRate: 1 },
  { code: 'USD', label: 'US dollar', symbol: '$', vndRate: 25500 },
  { code: 'GBP', label: 'British pound', symbol: '£', vndRate: 32000 },
  { code: 'EUR', label: 'Euro', symbol: '€', vndRate: 27500 },
];

interface LocalePreferencesContextType {
  currency: CurrencyCode;
  currencyOptions: CurrencyOption[];
  setCurrency: (currency: CurrencyCode) => void;
  convertFromVnd: (amount: number) => number;
  formatMoney: (amountVnd: number) => string;
}

const STORAGE_KEY = 'currency';

const LocalePreferencesContext = createContext<LocalePreferencesContextType | undefined>(undefined);

const normalizeCurrency = (value: string | null): CurrencyCode => {
  if (value === 'USD' || value === 'GBP' || value === 'EUR' || value === 'VND') return value;
  return 'VND';
};

export function LocalePreferencesProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => normalizeCurrency(localStorage.getItem(STORAGE_KEY)));

  const setCurrency = (value: CurrencyCode) => {
    setCurrencyState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo<LocalePreferencesContextType>(() => {
    const currencyOptions = CURRENCY_OPTIONS.map((option) => {
      const configuredRate = Number(settings[`currency_rate_${option.code.toLowerCase()}`]);
      return Number.isFinite(configuredRate) && configuredRate > 0 ? { ...option, vndRate: configuredRate } : option;
    });
    const currencyMap = new Map(currencyOptions.map((option) => [option.code, option]));
    const selected = currencyMap.get(currency) || currencyOptions[0];
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';

    const convertFromVnd = (amount: number) => amount / selected.vndRate;
    const formatMoney = (amountVnd: number) => {
      const converted = convertFromVnd(amountVnd);

      if (currency === 'VND') {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(amountVnd);
      }

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted);
    };

    return {
      currency,
      currencyOptions,
      setCurrency,
      convertFromVnd,
      formatMoney,
    };
  }, [currency, i18n.language, settings]);

  return (
    <LocalePreferencesContext.Provider value={value}>
      {children}
    </LocalePreferencesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocalePreferences() {
  const context = useContext(LocalePreferencesContext);
  if (!context) {
    throw new Error('useLocalePreferences must be used within LocalePreferencesProvider');
  }
  return context;
}
