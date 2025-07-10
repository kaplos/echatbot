import ConfirmationModal from "../ConfirmationModal";
import { useState } from "react";
import { useSupabase } from "../SupaBaseProvider";
export default function DeleteButton({ onDelete,type ,selectedItems}) {
  const [isOpen,setIsOpen]=useState(false)
  const {supabase} = useSupabase();


  const handleDelete = async () => {
      const {data,error} = await supabase
      .from(type.toLowerCase())
      .delete()
      .in('id',selectedItems)
      if(error){
        console.error('error deleting entities:',error)
        onDelete(false)
        return
      }
    console.log(Array.from(selectedItems))
      console.log(data,'items deleted ?')
    onDelete(true)
  }
  const deleteImages = async () => {
   
    console.log(selectedItems)
    const pathsToDelete = selectedItems.map((imageName) => `${selectedFolder}/${imageName}`);
    const { error } = await supabase.storage.from('echatbot').remove(pathsToDelete);
    const {error:imageTableDelete}= await supabase.from('images').delete().in('imageUrl',selectedItems.map(image=> `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/echatbot/${selectedFolder}/${image}`))
    if (error||imageTableDelete) {
      console.error(error||imageTableDelete)
    }
  };
  return (
    <>
       <ConfirmationModal 
        isOpen={isOpen} 
        message={"Are you sure you want to delete the selected items ? "}
        onClose={()=> setIsOpen(false)}
        onConfirm={type==='images' ? deleteImages:handleDelete}
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
