import React, { createContext, useContext, ReactNode } from 'react';
import { createClient} from '@supabase/supabase-js'


const SupabaseContext =  createContext(null);
// const SupabaseStorageContext = createContext(null);
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseStorage = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)




export default function SupabaseProvider ({ children }) {
  const contextValue = {
    supabase,
    supabaseStorage: supabaseStorage,
  };
  
  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = React.useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
};

export const handleImageUpload = async (files) => {
  const imageUrls = [];
  for (const file of files) {
    console.log(file,'file name');
    const {data,error} = await supabase.storage
      .from('echatbot') // Replace with your bucket name
      .upload(`public/${file.name}`, file)
      
      const  data2  = supabase.storage
    .from('echatbot') // Replace with your bucket name
    .getPublicUrl(`public/${file.name}`);
    console.log(data2?.data.publicUrl,'publicURL');


    if (error) {
      console.error('Error uploading image:', error);
      continue;
    }
    console.log(data,'data from upload'); 
    // const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/${data.fullPath}`;
    imageUrls.push(data2.data.publicUrl);
    console.log(imageUrls,'imageUrls');
  }
  return imageUrls;
};