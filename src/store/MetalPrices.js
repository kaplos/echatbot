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



// export const useMetalPriceStore = create()(
//   persist(
//     (set, get) => ({
//       prices: DEFAULT_PRICES,
//       loading: false,
//       error: null,
//       lastFetchedDate: null,

//       updatePrices: (newPrices) => {
//         const today = new Date().toLocaleDateString();
//         set({ prices: newPrices, lastFetchedDate: today });
//       },

//       fetchPrices: async () => {
//         const today = new Date().toLocaleDateString();
//         const { lastFetchedDate } = get();
//         const res = await fetch(`https://api.metalpriceapi.com/v1/latest
//                                 ?api_key=221fd203fb44a61f37fec0d1f1086147
//                                   &base=USD
//                                   &currencies=LBMA-XAU-PM,LBMA-XAG`)
//           const data = await res.json()
          
//         if (lastFetchedDate === today) {
//           // Already fetched today — no need to fetch again
//           return;
//         }

//         set({ loading: true, error: null });

//         try {
//           // Replace with your actual API endpoint
//           const response = await axios.get('/api/metal-prices'); 
//           const data = response.data;

//           const updatedPrices = {
//             gold: {
//               ...data.gold,
//               timestamp: today
//             },
//             silver: {
//               ...data.silver,
//               timestamp: today
//             }
//           };

//           set({ prices: updatedPrices, loading: false, lastFetchedDate: today });
//         } catch (error) {
//           console.error('Error fetching metal prices:', error);
//           set({ error: 'Failed to fetch metal prices', loading: false });
//         }
//       }
//     }),
//     {
//       name: 'metal-prices',
//       partialize: (state) => ({
//         prices: state.prices,
//         lastFetchedDate: state.lastFetchedDate
//       })
//     }
//   )
// );
