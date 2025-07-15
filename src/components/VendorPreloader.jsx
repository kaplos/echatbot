// components/VendorPreloader.jsx
import { useEffect } from 'react';
import { useGenericStore } from '../store/VendorStore';

const VendorPreloader = () => {
  const { fetchEntity } = useGenericStore();

  useEffect(() => {
    fetchEntity('vendors');
    fetchEntity('settings');
     // Automatically fetch vendors on mount
  }, [fetchEntity]);

  return null; // No UI, just does the preload work
};

export default VendorPreloader;

// {
//   "stonePropertiesForm":{
//     "color":["White", "Yellow", "Blue", "Green", "Red", "Pink", "Purple", "Orange"],
//   },
//   "formFields":{
//     "sellingType":["Pair,Single"] ,
//     "backType":["None","Silicone","Screw","Flat"]
//   }

// }