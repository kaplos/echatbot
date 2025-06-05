import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import DesignQuoteCard from './DesignQuoteCard';
import { useSupabase } from '../SupaBaseProvider';
import { useLocation } from 'react-router-dom';

const DesignQuoteList = ({ onDesignClick }) => {
  const [designQuotes, setDesignQuotes] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation(); // Access the current URL
  const queryParams = new URLSearchParams(location.search); // Parse the query string
  const designId = queryParams.get('designId'); 


  const { supabase } = useSupabase();
  const PAGE_SIZE = 20;

  const hasFetchedQuotes = useRef(false);
//   useEffect(()=>{
//     const fetchDesignQuote = async () => {
//         setLoading(true);
//         console.log(designId,'designId from params')
//         let query = supabase.from('starting_info').select('*');
//         if (designId) {
//             setDesigns([])
//             query = query.eq('designId', designId);
//         }else{
//             query = query.order('created_at', { ascending: false }).limit(12); // Replace 'created_at' with your timestamp column
//         }
//         const { data, error } = await query; // Use the modified query here
//         console.log(query,data)

//         console.log(data, 'data from supabase');
//         if (error) {

//           console.error('Error fetching design quotes:', error);
//           setLoading(false);
//           return;
//         }
//         setDesigns(data);
//         setLoading(false); // Moved this line up for clarity
//       };
//       fetchDesignQuote(); 
// },[])
  // Fetch design quotes from Supabase
  const fetchDesignQuotes = async (pageNumber) => {
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
        let query = supabase.from('starting_info').select('*');

            if (designId) {
                  // setDesigns([])
                  query = query.eq('designId', designId);
              }else{
                  query = query.order('created_at', { ascending: false })
                  .range(from, to);
              }
    const { data, error } = await query

    if (error) {
      console.error('Error fetching design quotes:', error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) setHasMore(false);

    setDesignQuotes((prevQuotes) => [...prevQuotes, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedQuotes.current) {
      fetchDesignQuotes(0); // Fetch the first page
      hasFetchedQuotes.current = true;
    }
  }, []);

  const handleExport = () => {
    const designsToExport = designQuotes.filter((p) => selectedDesigns.has(p.id));
    exportToCSV(designsToExport);
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
          fetchDesignQuotes(page);
        }
      }}
    >
      {
          designQuotes.length === 0 ? 
            <div className="flex justify-center items-center h-screen">No Design Quotes Found For This Design</div>
         : 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {designQuotes.map((design) => (
          <DesignQuoteCard
          key={design.id}
          design={design}
          onClick={isSelectionMode ? toggleDesignSelection : onDesignClick}
          selected={selectedDesigns.has(design.id)}
          selectable={isSelectionMode}
          />
        ))}
      </div>
    }
      {loading && <div className="text-center py-4">Loading...</div>}
    </div>
  );
};

export default DesignQuoteList;