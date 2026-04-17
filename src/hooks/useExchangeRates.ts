import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRates, ExchangeRates, calculateLoss } from '../services/exchangeRate';

interface UseExchangeRatesReturn {
  rates: ExchangeRates;
  loading: boolean;
  error: string | null;
  lossAmount: number;
  refetch: () => void;
}

const DEFAULT_AMOUNT = 100;

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRates>({
    bank: 12.1,
    mobile: 12.6,
    street: 13.0,
    rpnmore: 13.2,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchExchangeRates();
      setRates(data);
    } catch (err) {
      setError('Failed to load exchange rates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Calculate loss amount
  const lossAmount = calculateLoss(DEFAULT_AMOUNT, rates);

  return {
    rates,
    loading,
    error,
    lossAmount,
    refetch: fetchRates,
  };
}
