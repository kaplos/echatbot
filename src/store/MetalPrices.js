import { create } from 'zustand';
import { persist } from 'zustand/middleware';




const DEFAULT_PRICES = {
  gold: {
    price: 2051.20,
    change: 0.5,
    timestamp: new Date().toLocaleDateString()
  },
  silver: {
    price: 24.15,
    change: 0.3,
    timestamp: new Date().toLocaleDateString()
  }
};

export const useMetalPriceStore = create()(
  persist(
    (set) => ({
      prices: DEFAULT_PRICES,
      loading: false,
      error: null,
      updatePrices: (newPrices) => {
        set({ prices: newPrices });
      },
      fetchPrices: async () => {
        set({ loading: true });
        try {
          // In a real app, we would fetch from an API
          // For now, we'll use the stored prices
          set(state => ({ 
            prices: {
              ...state.prices,
              gold: {
                ...state.prices.gold,
                timestamp: new Date().toLocaleDateString()
              },
              silver: {
                ...state.prices.silver,
                timestamp: new Date().toLocaleDateString()
              }
            },
            loading: false,
            error: null 
          }));
        } catch (error) {
          set({ error: 'Failed to fetch metal prices', loading: false });
          console.error('Error fetching metal prices:', error);
        }
      }
    }),
    {
      name: 'metal-prices',
    }
  )
);