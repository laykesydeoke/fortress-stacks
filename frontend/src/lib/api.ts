const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Contract information for API integration
export const CONTRACT_INFO = {
  DEPLOYED_ADDRESS: 'ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE',
  NETWORK: 'testnet',
  CONTRACTS: {
    PAYMENT_PROCESSOR: 'payment-processor',
    TREASURY_MANAGER: 'treasury-manager',
    YIELD_STRATEGY: 'yield-strategy'
  }
};

class APICache {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  
  set(key: string, data: any, ttl = 30000) { // 30 second default TTL
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
}

const cache = new APICache();

export async function fetchWithCache(url: string, options?: RequestInit) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const cacheKey = `${fullUrl}-${JSON.stringify(options)}`;
  
  // Try cache first for GET requests
  if (!options?.method || options.method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache successful GET responses
  if (response.ok && (!options?.method || options.method === 'GET')) {
    cache.set(cacheKey, data);
  }
  
  return data;
}

export const api = {
  // Business endpoints
  createBusiness: (data: any) => 
    fetchWithCache('/api/businesses', { method: 'POST', body: JSON.stringify(data) }),
  
  getBusinessByWallet: (address: string) => 
    fetchWithCache(`/api/businesses/wallet/${address}`),
  
  getDashboardData: (businessId: string) => 
    fetchWithCache(`/api/businesses/${businessId}/dashboard`),
  
  rebalanceTreasury: (businessId: string) => 
    fetchWithCache(`/api/businesses/${businessId}/rebalance`, { method: 'POST' }),

  createYieldStrategy: (businessId: string, data: any) =>
    fetchWithCache(`/api/businesses/${businessId}/yield-strategies`, { method: 'POST', body: JSON.stringify(data) }),

  // Payment endpoints
  createPayment: (data: any) => 
    fetchWithCache('/api/payments/create', { method: 'POST', body: JSON.stringify(data) }),
  
  getPayments: (businessId: string, page = 1, limit = 10) => 
    fetchWithCache(`/api/payments/business/${businessId}?page=${page}&limit=${limit}`),
  
  getPayment: (paymentId: string) => 
    fetchWithCache(`/api/payments/${paymentId}`),
  
  confirmPayment: (paymentId: string) => 
    fetchWithCache(`/api/payments/${paymentId}/confirm`, { method: 'POST' }),
  
  getPaymentAnalytics: (businessId: string, period = '30d') => 
    fetchWithCache(`/api/payments/business/${businessId}/analytics?period=${period}`),
};