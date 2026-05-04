import { useLocalePreferences } from '@/contexts/LocalePreferencesContext';

export default function CurrencySwitcher() {
  const { currency, currencyOptions, setCurrency } = useLocalePreferences();

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
      {currencyOptions.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setCurrency(option.code)}
          className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
            currency === option.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.code}
        </button>
      ))}
    </div>
  );
}
