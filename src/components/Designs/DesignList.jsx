import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { exportData } from '../../utils/exportUtils';
import DesignCard from './DesignCard';
import { useSupabase } from '../SupaBaseProvider';
import Loading from '../Loading';
import ViewableListActionButtons from '../MiscComponenets/ViewableListActionButtons';
import { useGenericStore } from '../../store/VendorStore';
import { useSearchParams } from 'react-router-dom';

const DesignList = ({ designs, setDesigns, isLoading, setIsLoading, hasMore, setHasMore,onDesignClick }) => {
  const { getEntity } = useGenericStore();
  const { options } = getEntity('settings');

  const [selectedDesigns, setSelectedDesigns] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { supabase } = useSupabase();
  const PAGE_SIZE = 20;

  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for query params
  const page = parseInt(searchParams.get('page') || '0', 10); // Get the current page from the URL
  const collection = searchParams.getAll('collection') || ""; // Get the collection filter from the URL
  const category = searchParams.getAll('category') || ""; // Get the category filter from the URL
  // Fetch designs from Supabase
  const fetchDesigns = async (pageNumber) => {
    setIsLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query =  supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

      if (category.length > 0 && category) {
        query = query.in('category', category);
      }

      if (collection.length > 0 && collection) {
        query = query.in('collection', collection);
      }

        const { data, error } = await query;

    if (error) {
      console.error('Error fetching designs:', error);
      setIsLoading(false);
      return;
    }

    setDesigns(data); // Replace designs with the current page's data
    setHasMore(data.length === PAGE_SIZE); // Check if there are more pages
    setIsLoading(false);
  };
  useEffect(()=>{
    console.log(selectedDesigns,selectedDesigns.size)
  },[selectedDesigns])
  // Fetch the current page on component mount or when the page changes
  useEffect(() => {
    fetchDesigns(page);
  }, [page,searchParams]);

  // Handle page navigation

  const getDataToExport = async (arrayOfProducts) => {
    const { data: designsData, error: designDataError } = await supabase
      .from('designs')
      .select('*')
      .in('id', arrayOfProducts.map((design) => design.id));

    if (designDataError) {
      console.error(designDataError, 'error in getting data for export');
    }
    return designsData;
  };
  const getDropDownData = async () => {
    const { data, error } = await supabase.rpc('get_dropdown_options');

    if (error) {
      showMessage('Issue with retriving dropdown options');
    }
    return data;
  };

  const handleExport = async () => {
    const designsToExport = Array.from(selectedDesigns)
    console.log(designsToExport)
    const dataToExport = await getDataToExport(designsToExport);
    let dropdowns = await getDropDownData();
    dropdowns = {
      ...dropdowns,
      color: options?.stonePropertiesForm?.color.map((option) => ({ name: option })),
      type: options?.stonePropertiesForm?.type.map((option) => ({ name: option })),
    };
    exportData(dataToExport, dropdowns, 'designs');
    setSelectedDesigns(new Set());
    setIsSelectionMode(false);
  };

  const toggleDesignSelection = (design) => {
    const newSelection = new Set(selectedDesigns);
    if (newSelection.has(design.id)) {
      newSelection.delete(design.id);
    } else {
      newSelection.add(design.id);
    }
    setSelectedDesigns(newSelection);
  };
   if(isLoading){
    return <Loading />
    
  }

  return (
    <div>
      <ViewableListActionButtons
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        handleExport={handleExport}
        handleSelections={(selected) => setSelectedDesigns(selected)}
        selectedItems={selectedDesigns}
        allItems={designs}
        onDelete={(deletedSelectedItems) =>
          setDesigns(designs.filter((d) => !deletedSelectedItems.includes(d.id)))
        }
        type="Designs"
      />
      
      <div className="flex flex-col overflow-auto max-h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onClick={isSelectionMode ? toggleDesignSelection : onDesignClick}
              selected={[...selectedDesigns].some(d => d.id === design.id)}
              selectable={isSelectionMode}
            />
          ))}
        </div>
       
        
      </div>
    </div>
  );
};

export default DesignList;