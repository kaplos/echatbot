import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase Context
const SupabaseContext = createContext(null);

// Environment Variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY;

// Validate Environment Variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Please check your environment variables.');
}

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Hook to Access Supabase Context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

// Handle Image Upload
export const handleImageUpload = async (files) => {
  const imageUrls = [];
  for (const file of files) {
    console.log(file, 'file name');

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('echatbot') // Replace with your bucket name
      .upload(`public/${file.name}`, file);

    if (error) {
      console.error('Error uploading image:', error);
      continue;
    }

    // Get the public URL of the uploaded file
    const { data: publicURL } = supabase.storage
      .from('echatbot') // Replace with your bucket name
      .getPublicUrl(`public/${file.name}`);

    if (publicURL) {
      imageUrls.push(publicURL.publicURL);
    }

    console.log(data, 'data from upload');
    console.log(publicURL, 'publicURL');
    console.log(imageUrls, 'imageUrls');
  }
  return imageUrls;
};




