// Exchange Rate API Service
// Fetches live USD/GHS rates from ExchangeRate-API

const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_KEY = 'rpnmore-exchange-rates';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export interface ExchangeRates {
  bank: number;
  mobile: number;
  street: number;
  rpnmore: number;
  lastUpdated: string;
}

interface CachedData {
  rates: ExchangeRates;
  timestamp: number;
}

/**
 * Fetch exchange rates with caching
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates();
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const bankRate = data.rates.GHS;
    
    // Calculate rates based on bank rate
    const rates: ExchangeRates = {
      bank: parseFloat(bankRate.toFixed(2)),
      mobile: parseFloat((bankRate + 0.5).toFixed(2)),
      street: parseFloat((bankRate + 0.9).toFixed(2)),
      rpnmore: parseFloat((bankRate + 1.1).toFixed(2)),
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    setCachedRates(rates);

    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    
    // Return fallback rates if API fails
    return getFallbackRates();
  }
}

/**
 * Get cached rates from localStorage
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - parsed.timestamp < CACHE_DURATION) {
      return parsed.rates;
    }
  } catch {
    // localStorage not available or invalid
  }
  
  return null;
}

/**
 * Set cached rates in localStorage
 */
function setCachedRates(rates: ExchangeRates): void {
  try {
    const data: CachedData = {
      rates,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage not available
  }
}

/**
 * Fallback rates when API fails
 */
function getFallbackRates(): ExchangeRates {
  return {
    bank: 12.1,
    mobile: 12.6,
    street: 13.0,
    rpnmore: 13.2,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate loss amount compared to bank rate
 */
export function calculateLoss(amount: number, rates: ExchangeRates): number {
  const bankTotal = amount * rates.bank;
  const rpnmoreTotal = amount * rates.rpnmore;
  return Math.round(rpnmoreTotal - bankTotal);
}

/**
 * Get savings amount when using RPNMore
 */
export function calculateSavings(amount: number, rates: ExchangeRates): number {
  return calculateLoss(amount, rates);
}
