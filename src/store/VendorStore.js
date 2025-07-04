import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const useGenericStore = create((set, get) => ({
  entities: {}, // Store multiple entities (e.g., vendors, products, status options)
  isLoaded: {}, // Track loading state for each entity
  isLoading: {}, // Track loading state for each entity
  errors: {}, // Track errors for each entity

  // Generic fetch function for any entity
  fetchEntity: async (entityName) => {
    const { isLoading } = get();

    // Check if the entity is already cached in localStorage
    const cachedData = localStorage.getItem(entityName);
    const lastFetchTime = localStorage.getItem(`${entityName}_last_fetch_time`);
    const now = new Date();

    if (cachedData) {
      console.log(`Using cached ${entityName} from localStorage`);
      set({
        entities: { ...get().entities, [entityName]: JSON.parse(cachedData) },
        isLoaded: { ...get().isLoaded, [entityName]: true },
        isLoading: { ...get().isLoading, [entityName]: false },
      });
    }

    // Check if the last fetch was more than 24 hours ago
    if (!lastFetchTime || now - new Date(lastFetchTime) >= 24 * 60 * 60 * 1000) {
      if (isLoading[entityName]) return; // Prevent duplicate loads

      console.log(`Fetching ${entityName} from the database`);
      set({
        isLoading: { ...get().isLoading, [entityName]: true },
        errors: { ...get().errors, [entityName]: null },
      });

      // Fetch data from Supabase
      const { data, error } = await supabase.from(entityName).select("*");
      let saveData = (data.length==1?  data[0]:data)
       
      console.log(data,'data from vendorstore')
      if (error) {
        console.error(`Error fetching ${entityName}:`, error);
        set({
          errors: { ...get().errors, [entityName]: error },
          isLoading: { ...get().isLoading, [entityName]: false },
        });
      } else {
        set({
          entities: { ...get().entities, [entityName]: saveData },
          isLoaded: { ...get().isLoaded, [entityName]: true },
          isLoading: { ...get().isLoading, [entityName]: false },
        });

        // Cache the data in localStorage
        localStorage.setItem(entityName, JSON.stringify(saveData));
        localStorage.setItem(`${entityName}_last_fetch_time`, now.toISOString());
      }
    }
  },

  // Sync entity from localStorage
  syncEntityFromLocalStorage: (entityName) => {
    const cachedData = localStorage.getItem(entityName);
    if (cachedData) {
      console.log(`Syncing ${entityName} from localStorage`);
      set({
        entities: { ...get().entities, [entityName]: JSON.parse(cachedData) },
        isLoaded: { ...get().isLoaded, [entityName]: true },
        isLoading: { ...get().isLoading, [entityName]: false },
      });
    }
  },

  // Update entity data
  updateEntity: (entityName, updatedData) => {
    const { entities } = get();
    set({
      entities: { ...entities, [entityName]: updatedData },
      isLoaded: { ...get().isLoaded, [entityName]: true },
      isLoading: { ...get().isLoading, [entityName]: false },
    });

    // Cache the updated data in localStorage
    localStorage.setItem(entityName, JSON.stringify(updatedData));
    localStorage.setItem(`${entityName}_last_fetch_time`, new Date().toISOString());
  },

  // Get entity data
  getEntity: (entityName) => {
    const { entities } = get();
    return entities[entityName] || [];
  },

  // Get specific item by ID
  getEntityItemById: (entityName, id) => {
    const { entities } = get();
    return entities[entityName]?.find((item) => item.id === id);
  },
}));
