import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsService } from '@/services/settings.service';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default values on error
      setSettings({
        site_name: 'An Voyages',
        site_tagline: 'Tour Hạ Long, Cát Bà, Cô Tô, Quan Lạn',
        hero_title: 'Đặt tour đảo, du thuyền và kỳ nghỉ biển miền Bắc',
        hero_subtitle: 'Chọn ngày đi và số khách, An Voyages sẽ gợi ý du thuyền, khách sạn hoặc combo phù hợp với ngân sách của bạn.',
        home_hero_summary: 'Tư vấn nhanh qua điện thoại/Zalo, giá gói rõ ràng, phù hợp cho gia đình, cặp đôi, nhóm bạn và công ty.',
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        footer_text: '© 2025 An Voyages. All rights reserved.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
