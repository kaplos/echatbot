
import DeleteButton from "./DeleteButton";
import { Download } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal";
import { useMessage } from "../Messages/MessageContext";

export default function ViewableListActionButtons({
  isSelectionMode,
  setIsSelectionMode,
  handleExport,
  handleSelections,
  allItems,
  selectedItems,
  onDelete,
  type,
  customComponent
}) {
    const {showMessage} = useMessage()
    const [isSelectAll,setSelectAll] = useState(false)
    // const [isSelectionMode,setIsSelectionMode] = useState(false)

    const toggleSelectAll = () => {
        if (isSelectAll) {
          // Deselect all items
          handleSelections(new Set());
        } else {
            // Select all items
            setIsSelectionMode(true)
            handleSelections(new Set(allItems.map((item) => item.id))); // Assuming items have an `id` property
        }
        // setIsSelectionMode(!isSelectionMode)
        setSelectAll(!isSelectAll); // Toggle the state
      };
     
      const handleButtonSelections = () => {
        setIsSelectionMode(!isSelectionMode);
        // setSelectAll(!isSelectAll)
        if (!isSelectionMode) {
          setIsSelectionMode(true);
        } else {
          handleSelections(new Set());
          setIsSelectionMode(false);
          setSelectAll(false)
        }
      };
    const handleDelete = async (success)=>{
        showMessage(success? 'Items have been deleted successfully':'Error occured while deleting')
        onDelete(Array.from(selectedItems))
        handleSelections(new Set())
    }
  return (

   
    <div className="flex justify-between mb-4 space-x-3">
       <div className="flex gap-2">
           <button
             onClick={handleButtonSelections}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
           >
             {isSelectionMode ? "Cancel Selection" : `Select ${type}`}
           </button>
           <button
             onClick={toggleSelectAll}
             className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
           >
             {isSelectAll ? "Deselect All" : "Select All"}              
           </button>
       </div>
   
     <div className="flex justify-center items-center gap-2"> 
       {isSelectionMode && selectedItems.size > 0 && (
      <DeleteButton onDelete={handleDelete} type={type} selectedItems={selectedItems}/>
     )}
        {isSelectionMode && selectedItems.size > 0 && (
          customComponent ? (
            // Render the custom component if provided
            customComponent
          ) : (
            // Render the default export button
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Selected ({selectedItems.size})
            </button>
          )
        )}
     </div>
    
     
   </div>
//    </>
  );
}