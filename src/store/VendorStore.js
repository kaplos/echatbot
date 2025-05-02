// vendorStore.js
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

  fetchVendors: async () => {
    const { isLoaded, isLoading } = get();
    if (isLoaded || isLoading) return; // Prevent duplicate loads

    set({ isLoading: true, error: null });

    // Fetch vendors from Supabase
    const { data, error } = await supabase.from('vendors').select('*');
    if (error) {
      set({ error, isLoading: false });
    } else {
      set({ vendors: data, isLoaded: true, isLoading: false });
    }
  },

  setVendors: (vendors) => {
    set({ vendors, isLoaded: true, isLoading: false });
  },

  getVendors: () => {
    const { vendors } = get();
    return vendors;
  },

  getVendorById: (id) => {
    const { vendors } = get();
    return vendors.find((vendor) => vendor.id === id);
  },
}));
