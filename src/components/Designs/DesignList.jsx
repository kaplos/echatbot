import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { exportData } from '../../utils/exportUtils';
import DesignCard from './DesignCard';
import { useSupabase } from '../SupaBaseProvider';

const DesignList = ({ onDesignClick }) => {
  const [designs, setDesigns] = useState([]);
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
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching designs:', error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) setHasMore(false);

    setDesigns((prevDesigns) => [...prevDesigns, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
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

  const handleExport = async () => {
    const designsToExport = designs.filter((p) => selectedDesigns.has(p.id));
    const dataToExport = await getDataToExport(designsToExport);
    exportData(dataToExport, 'designs');
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

  const handleButtonSelections = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    } else {
      setSelectedDesigns(new Set());
      setIsSelectionMode(false);
    }
  };

  return (
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
      <div className="flex justify-end mb-4 space-x-3">
        <button
          onClick={handleButtonSelections}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isSelectionMode ? 'Cancel Selection' : 'Select Designs'}
        </button>
        {isSelectionMode && selectedDesigns.size > 0 && (
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected ({selectedDesigns.size})
          </button>
        )}
      </div>
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
      {loading && <div className="text-center py-4">Loading...</div>}
    </div>
  );
};

export default DesignList;