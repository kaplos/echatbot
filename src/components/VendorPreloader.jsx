// components/VendorPreloader.jsx
import { useEffect } from 'react';
import { useVendorStore } from '../store/VendorStore';

const VendorPreloader = () => {
  const fetchVendors = useVendorStore((state) => state.fetchVendors);

  useEffect(() => {
    fetchVendors(); // Automatically fetch vendors on mount
  }, [fetchVendors]);

  return null; // No UI, just does the preload work
};

export default VendorPreloader;
