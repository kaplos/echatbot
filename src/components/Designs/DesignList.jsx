import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToCSV,exportData } from '../../utils/exportUtils';
import DesignCard from './DesignCard';
import { useSupabase } from '../SupaBaseProvider';
// import {getVendorById} from '../../store/VendorStore'
const DesignList = ({ designs, onDesignClick }) => {
    const [selectedDesigns, setSelectedDesigns] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
     const {supabase}=useSupabase();
    const getDataToExport = async (arrayOfProducts) => {
       
        const {data:designsData,error:designDataError}= await supabase.from('designs').select("*").in('id',arrayOfProducts.map((design) => design.id))
        
      
        if(designDataError){
            console.error(designDataError,'error in getting data for export');
        }
        return designsData
      }
     const handleExport =async  () => {
            const designsToExport = designs.filter(p => selectedDesigns.has(p.id));
            const data = await getDataToExport(designsToExport)
            console.log(data, 'designs to export');

            // Assuming you have a function to handle the export
            exportData(designsToExport,'designs');
            setSelectedDesigns(new Set());
            setIsSelectionMode(false);
    };
    const handleButtonSelections = () => {
      setIsSelectionMode(!isSelectionMode);
      if (!isSelectionMode) {
        setIsSelectionMode(true);
      }else{
        setSelectedDesigns(new Set());
        setIsSelectionMode(false);
      }
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
        <div className='flex flex-col'>
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
            {[...designs].sort((a,b)=> a.id>b.id ? 1 : -1).map((design) => 
            // console.log(design,'designs from design list')||
            (
              <DesignCard
                  key={design.id}
                  design={design}
                  onClick={isSelectionMode ? toggleDesignSelection : onDesignClick}
                  selected={selectedDesigns.has(design.id)}
                  selectable={isSelectionMode}
              />
            ))}
        </div>
    </div>
     );
    
}

export default DesignList;