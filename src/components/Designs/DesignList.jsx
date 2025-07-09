import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { exportData } from '../../utils/exportUtils';
import DesignCard from './DesignCard';
import { useSupabase } from '../SupaBaseProvider';
import Loading from '../Loading';
import ViewableListActionButtons from '../MiscComponenets/ViewableListActionButtons';

const DesignList = ({ designs,setDesigns,isLoading,setIsLoading, onDesignClick }) => {
  const [selectedDesigns, setSelectedDesigns] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
  const PAGE_SIZE = 20;

  const hasFetchedDesigns = useRef(false);

  // Fetch designs from Supabase
  const fetchDesigns = async (pageNumber) => {
    // if (isLoading) return; // Prevent duplicate fetches
    setLoading(true)
    // setIsLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching designs:', error);
      setLoading(false)
      // setIsLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) setHasMore(false);

    setDesigns((prevDesigns) => [...prevDesigns, ...data]);
    setPage(pageNumber + 1);
    setLoading(false)
    // setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedDesigns.current) {
      fetchDesigns(0); // Fetch the first page
      hasFetchedDesigns.current = true;
    }
  }, []);
  const getDataToExport = async (arrayOfProducts) => {
       
    const {data:designsData,error:designDataError}= await supabase.from('designs').select("*").in('id',arrayOfProducts.map((design) => design.id))
    
  
    if(designDataError){
        console.error(designDataError,'error in getting data for export');
    }
    return designsData
  }
  const getDropDownData = async ()=>{
    const { data, error } = await supabase.rpc('get_dropdown_options');

    if(error){
      showMessage('Issue with retriving dropdown options')
    }
    return data
  }

  const handleExport = async () => {
    const designsToExport = designs.filter((p) => selectedDesigns.has(p.id));
    const dataToExport = await getDataToExport(designsToExport);
    let dropdowns = await getDropDownData();

    exportData(dataToExport,dropdowns, 'designs');
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


  return (
    <div>
   
        <ViewableListActionButtons
                isSelectionMode={isSelectionMode}
                setIsSelectionMode={setIsSelectionMode}
                handleExport={handleExport}
                handleSelections={(selected)=>setSelectedDesigns(selected)}
                selectedItems={selectedDesigns}
                allItems={designs}
                onDelete={(deletedSelectedItems) => 
                  setDesigns(designs.filter(d => !deletedSelectedItems.includes(d.id)))
                }
                type="Designs"
              />
      <div
        className="flex flex-col overflow-auto max-h-[600px]"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const nearBottom = scrollHeight - scrollTop <= clientHeight + 50;
          if (nearBottom && !loading && hasMore) {
            fetchDesigns(page);
          }
        }}
      >
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onClick={isSelectionMode ? toggleDesignSelection : onDesignClick}
              selected={selectedDesigns.has(design.id)}
              selectable={isSelectionMode}
            />
          ))}
        </div>
        <div className="flex justify-center items-center mt-6">
      {loading && <Loading />}
        </div>
      </div>
    </div>
  );
};

export default DesignList;