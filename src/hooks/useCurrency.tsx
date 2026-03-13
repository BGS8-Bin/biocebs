import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency as formatMoney, convertCurrency } from '@/lib/money';

type Currency = 'MXN' | 'USD' | 'EUR';

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number; // Rate relative to MXN (base)
}

const currencies: Record<Currency, CurrencyConfig> = {
  MXN: { code: 'MXN', symbol: '$', rate: 1 },
  USD: { code: 'USD', symbol: '$', rate: 0.058 }, // Approximate rate
  EUR: { code: 'EUR', symbol: '€', rate: 0.054 }, // Approximate rate
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInMXN: number) => string;
  convertPrice: (priceInMXN: number) => number;
  currencyConfig: CurrencyConfig;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'MXN';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const currencyConfig = currencies[currency];

  const convertPrice = (priceInMXN: number): number => {
    return convertCurrency(priceInMXN, currencyConfig.rate);
  };

  const formatPrice = (priceInMXN: number): string => {
    const converted = convertPrice(priceInMXN);
    return formatMoney(converted, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currencyConfig,
        availableCurrencies: ['MXN', 'USD', 'EUR'],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
