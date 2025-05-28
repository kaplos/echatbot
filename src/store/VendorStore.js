import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly inside the store
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const useVendorStore = create((set, get) => ({
  vendors: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  // fetchVendors: async () => {
  //   const { isLoaded, isLoading } = get();

  //   // Check if vendors are already cached in localStorage
  //   const cachedVendors = localStorage.getItem('vendors');
  //   const lastFetchTime = localStorage.getItem('vendors_last_fetch_time');
  //   const now = new Date();

  //   // If cached vendors exist and were fetched within the last 24 hours, use them
  //   if (cachedVendors && lastFetchTime && now - new Date(lastFetchTime) < 24 * 60 * 60 * 1000) {
  //     console.log('Using cached vendors from localStorage');
  //     set({ vendors: JSON.parse(cachedVendors), isLoaded: true, isLoading: false });
  //     return;
  //   }

  //   if (isLoaded || isLoading) return; // Prevent duplicate loads

  //   set({ isLoading: true, error: null });

  //   // Fetch vendors from Supabase
  //   const { data, error } = await supabase.from('vendors').select('*');
  //   if (error) {
  //     set({ error, isLoading: false });
  //   } else {
  //     set({ vendors: data, isLoaded: true, isLoading: false });

  //     // Cache the vendors in localStorage
  //     localStorage.setItem('vendors', JSON.stringify(data));
  //     localStorage.setItem('vendors_last_fetch_time', now.toISOString());
  //   }
  // },
  fetchVendors: async () => {
    const { isLoading } = get();
  
    // Always load vendors from localStorage first
    const cachedVendors = localStorage.getItem('vendors');
    const lastFetchTime = localStorage.getItem('vendors_last_fetch_time');
    const now = new Date();
  
    if (cachedVendors) {
      console.log('Using cached vendors from localStorage');
      set({ vendors: JSON.parse(cachedVendors), isLoaded: true, isLoading: false });
    }
  
    // Check if the last fetch was more than 24 hours ago
    if (!lastFetchTime || now - new Date(lastFetchTime) >= 24 * 60 * 60 * 1000) {
      if (isLoading) return; // Prevent duplicate loads
  
      console.log('Fetching vendors from the database');
      set({ isLoading: true, error: null });
  
      // Fetch vendors from Supabase
      const { data, error } = await supabase.from('vendors').select('*');
      if (error) {
        console.error('Error fetching vendors:', error);
        set({ error, isLoading: false });
      } else {
        set({ vendors: data, isLoaded: true, isLoading: false });
  
        // Cache the vendors in localStorage
        localStorage.setItem('vendors', JSON.stringify(data));
        localStorage.setItem('vendors_last_fetch_time', now.toISOString());
      }
    }
  },
  syncVendorsFromLocalStorage: () => {
    const cachedVendors = localStorage.getItem('vendors');
    if (cachedVendors) {
      console.log('Syncing vendors from localStorage');
      set({ vendors: JSON.parse(cachedVendors), isLoaded: true, isLoading: false });
    }
  },
  setVendors: (vendors) => {
    set({ vendors, isLoaded: true, isLoading: false });

    // Cache the vendors in localStorage
    localStorage.setItem('vendors', JSON.stringify(vendors));
    localStorage.setItem('vendors_last_fetch_time', new Date().toISOString());
  },

  getVendors: () => {
    const { vendors } = get();
    return vendors;
  },

  getVendorById: (id) => {
    const { vendors } = get();
    return vendors.find((vendor) => vendor.id === id);
  },

  getVendorByName: (name) => {
    const { vendors } = get();
    return vendors.find((vendor) => vendor.name === name);
  },
}));