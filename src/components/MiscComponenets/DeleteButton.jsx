import ConfirmationModal from "../ConfirmationModal";
import { useState } from "react";

export default function DeleteButton({ onDelete,type }) {
  const [isOpen,setIsOpen]=useState(false)
  
  return (
    <>
       <ConfirmationModal 
        isOpen={isOpen} 
        message={"Are you sure you want to delete the selected items ? "}
        onClose={()=> setIsOpen(false)}
        // onConfirm={handleDelete}
        title={'Permanent Action'}
    />
      <button
        onClick={()=>setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 inline-flex items-center"
      >
        Delete
      </button>
    </>
  );
}
