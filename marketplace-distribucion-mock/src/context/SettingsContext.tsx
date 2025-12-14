import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DistributorSettings {
  whatsapp: string;
  name: string;
}

export type TaxMode = 'final' | 'breakdown' | 'half-vat';
export type Currency = 'USD' | 'ARS';

interface SettingsContextType {
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  defaultMarkup: number;
  setDefaultMarkup: (markup: number) => void;
  defaultVat: number;
  setDefaultVat: (vat: number) => void;
  taxMode: TaxMode;
  setTaxMode: (mode: TaxMode) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  distributorSettings: Record<string, DistributorSettings>;
  updateDistributorPhone: (distributorId: string, phone: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Record<string, DistributorSettings> = {
  newbytes: { name: 'New Bytes', whatsapp: '5491100000000' },
  gruponucleo: { name: 'Grupo Nucleo', whatsapp: '5491100000000' },
  tgs: { name: 'TGS', whatsapp: '5491100000000' },
  elit: { name: 'Elit', whatsapp: '5491100000000' },
  gamingcity: { name: 'Gaming City', whatsapp: '5491100000000' },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('tgs_exchange_rate');
    return saved ? Number(saved) : 1220;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('tgs_currency');
    return (saved as Currency) || 'ARS';
  });

  const [defaultMarkup, setDefaultMarkup] = useState(() => {
    const saved = localStorage.getItem('tgs_default_markup');
    return saved ? Number(saved) : 30;
  });

  const [defaultVat, setDefaultVat] = useState(() => {
    const saved = localStorage.getItem('tgs_default_vat');
    return saved ? Number(saved) : 21;
  });

  const [taxMode, setTaxMode] = useState<TaxMode>(() => {
    const saved = localStorage.getItem('tgs_tax_mode');
    return (saved as TaxMode) || 'breakdown';
  });

  const [distributorSettings, setDistributorSettings] = useState<Record<string, DistributorSettings>>(() => {
    const saved = localStorage.getItem('tgs_distributor_settings');
    let parsed = saved ? JSON.parse(saved) : defaultSettings;
    return { ...defaultSettings, ...parsed };
  });

  useEffect(() => { localStorage.setItem('tgs_exchange_rate', String(exchangeRate)); }, [exchangeRate]);
  useEffect(() => { localStorage.setItem('tgs_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('tgs_default_markup', String(defaultMarkup)); }, [defaultMarkup]);
  useEffect(() => { localStorage.setItem('tgs_default_vat', String(defaultVat)); }, [defaultVat]);
  useEffect(() => { localStorage.setItem('tgs_tax_mode', taxMode); }, [taxMode]);
  useEffect(() => { localStorage.setItem('tgs_distributor_settings', JSON.stringify(distributorSettings)); }, [distributorSettings]);

  const updateDistributorPhone = (distributorId: string, phone: string) => {
    setDistributorSettings(prev => ({
      ...prev,
      [distributorId]: { ...prev[distributorId], whatsapp: phone }
    }));
  };

  return (
    <SettingsContext.Provider value={{
      exchangeRate,
      setExchangeRate,
      currency,
      setCurrency,
      defaultMarkup,
      setDefaultMarkup,
      defaultVat,
      setDefaultVat,
      taxMode,
      setTaxMode,
      distributorSettings,
      updateDistributorPhone
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return context;
};

