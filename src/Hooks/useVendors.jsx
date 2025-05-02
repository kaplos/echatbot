// useVendors.js
import { useEffect } from 'react';
import { useVendorStore } from './vendorStore';
import { useSupabase } from '../components/SupaBaseProvider';

export default function useVendors() {
  const { supabase } = useSupabase();
  const vendors = useVendorStore((state) => state.vendors);
  const fetchVendors = useVendorStore((state) => state.fetchVendors);
  const isLoaded = useVendorStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      fetchVendors(supabase);
    }
  }, [isLoaded, fetchVendors, supabase]);

  return vendors;
}
