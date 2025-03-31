import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupabase } from '../components/SupaBaseProvider';
import VendorList from '../components/Vendor/VendorList';
import AddVendorForm from '../components/Vendor/VendorForm';
import VendorFormEdit from '../components/Vendor/VendorFormEdit';
import Loading from '../components/Loading';

const Vendors = () => {
    const supabase = useSupabase();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [isLoading,setIsLoading] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState();
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .limit(12);
            if (error) {
                console.error('Error fetching vendors:', error);
                return;
            }
            setVendors(data);
            setIsLoading(false)
        };
        fetchVendors();

    }, []);
    
    const handleClick = async (vendor) => {
      const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendor.id);

    if (error) {
      console.error('Error fetching vendor:', error);
      return;
    }
    console.log(data,'data from click');
      setSelectedVendor(data[0]);
      setIsEditFormOpen(true);
  }

  const updateVendor = (updatedVendor) => {
    setVendors((previousVendor) =>
        previousVendor.map((vendor) => (vendor.id === updatedVendor.id ? updatedVendor : vendor))
    );
  };

    const handleSave = (vendorData) => {

          addVendor(vendorData);
          setIsFormOpen(false);
          setSelectedVendor(undefined);
    }
    if(isLoading){
      return <Loading/>
    }
    return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <button
              onClick={() => {
                setSelectedVendor(undefined);
                setIsFormOpen(true);
              }}
              className="flex items-center px-4 py-2 text-white bg-chabot-gold rounded-lg hover:bg-opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vendor
            </button>
          </div>
    
          <VendorList
            vendors={vendors}
            onSelectVendor={handleClick}
          />
    
          <AddVendorForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedVendor(undefined);
            }}
            onSave={(vendor) => {
              console.log(vendor)
              setIsFormOpen(false);
              setVendors((prev)=>[...prev,...vendor]);
            }}
          />
          {selectedVendor &&
              <VendorFormEdit
                vendor={selectedVendor}
                isOpen={isEditFormOpen}
                onClose={() => {
                  setIsEditFormOpen(false);
                  setSelectedVendor(undefined);
                }}
                updateVendor={updateVendor}
            />
          }
        </div>
      );
    }
    export default Vendors;
 


 