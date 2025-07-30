import React, { useState, useEffect, useRef } from "react";
import { CornerDownLeft, Download } from "lucide-react";
import { exportData } from "../../utils/exportUtils";
import SampleCard from "../Samples/SampleCard";
import { useSupabase } from "../SupaBaseProvider";
import ViewableListActionButtons from "../MiscComponenets/ViewableListActionButtons";
import { useMessage } from "../Messages/MessageContext";
import { useGenericStore } from "../../store/VendorStore";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import React Router hooks
import Loading from "../Loading";

const SampleList = ({ samples, setSamples, isLoading, setIsLoading, hasMore, setHasMore, onSampleClick }) => {
  const { getEntity } = useGenericStore();
  const { options } = getEntity("settings");

  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // const [page, setPage] = useState(0);
  // const [isloading, setIsLoading] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
  const { showMessage } = useMessage();
  const PAGE_SIZE = 20;

  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for query params
  const navigate = useNavigate(); // React Router hook for navigation
  const page = parseInt(searchParams.get("page") || "0", 10);
  const collection = searchParams.getAll('collection') || ""; // Get the collection filter from the URL
  const category = searchParams.getAll('category') || ""; 
  const metals = searchParams.getAll('metal') || ""; // Get the metal filter from the URL
  const customers = searchParams.getAll('customer') || ""; // Get the customer filter from the URL
  const chains = searchParams.getAll('chain') || ""; // Get the chain filter from the URL
  // Fetch samples from Supabase
  const fetchSamples = async (pageNumber) => {
    setIsLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("sample_with_stones_export")
      .select('*') // specify '*' to select all columns
      .order("created_at", { ascending: false })
      .range(from, to);


    if (collection.length > 0 && collection) {
      query = query.in("collection", collection);
    }
    if (category.length > 0 && category) {
      query = query.in("category", category);
    }
    if (metals.length > 0 && metals) {
      query = query.in("metalType", metals);
    }
    if (customers.length > 0 && customers) {
      query = query.in("customer", customers);
    }
    if (chains.length > 0 && chains) {
      query = query.in("necklace", chains);
    }
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching samples:", error);
      setIsLoading(false);
      return;
    }

    setSamples(data); // Replace samples with the current page's data
    setHasMore(data.length === PAGE_SIZE); // Check if there are more pages
    setIsLoading(false);
  };

  // Fetch the first page on component mount
  // useEffect(() => {
  //   fetchSamples(0);
  // }, []);
  useEffect(() => {
    fetchSamples(page); // Fetch samples whenever the page changes
  }, [page, searchParams]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 0 || (newPage > page && !hasMore)) return; // Prevent invalid page navigation
    // setPage(newPage);
    setSearchParams({ page: newPage }); // Update the URL with the new page number

    // fetchSamples(newPage);
  };

  const getDataToExport = async (arrayOfProducts) => {
    try {
      // Fetch samples and their starting_info
      const { data: samplesData, error: sampleDataError } = await supabase
        .from("sample_with_stones_export")
        .select("*")
        .in(
          "sample_id",
          arrayOfProducts.map((sample) => sample.sample_id)
        );

      if (sampleDataError) {
        console.error("Error fetching samples:", sampleDataError);
        return [];
      }
      console.log(samplesData)
      return samplesData; // Return samples with their stones
    } catch (error) {
      console.error("Error in getDataToExport:", error);
      return [];
    }
  };
  const getDropDownData = async () => {
    const { data, error } = await supabase.rpc("get_dropdown_options");

    if (error) {
      showMessage("Issue with retriving dropdown options");
    }
    return data;
  };
  const handleExport = async () => {
    const samplesToExport = samples.filter((p) => selectedSamples.has(p.sample_id));
    let dataToExport = await getDataToExport(samplesToExport);
    let dropdowns = await getDropDownData();
    dropdowns = {
      ...dropdowns,
      color: options?.stonePropertiesForm?.color.map((option) => ({ name: option })),
      type: options?.stonePropertiesForm?.type.map((option) => ({ name: option })),
      backType: options?.formFields?.backType.map((option) => ({ name: option })),
    };

    exportData(dataToExport, dropdowns, "samples");
    setSelectedSamples(new Set());
    setIsSelectionMode(false);
  };

   const toggleSampleSelection = (sample) => {
    const newSelection = new Set(selectedSamples);
    if (newSelection.has(sample.sample_id)) {
      newSelection.delete(sample.sample_id);
    } else {
      newSelection.add(sample.sample_id);
    }
    setSelectedSamples(newSelection);
  };
  if(isLoading){
    return <Loading />
    
  }
  return (
    <div>
      <ViewableListActionButtons
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        handleSelections={(selected) => setSelectedSamples(selected)}
        handleExport={handleExport}
        onDelete={(deletedSelectedItems) =>
          setSamples(samples.filter((s) => !deletedSelectedItems.includes(s.id)))
        }
        allItems={samples}
        selectedItems={selectedSamples}
        type="Samples"
      />
      
      <div className="flex flex-col overflow-auto max-h-screen">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => (
            <SampleCard
              key={sample.sample_id}
              sample={sample}
              onClick={isSelectionMode ? toggleSampleSelection : onSampleClick}
              selected={selectedSamples.has(sample.sample_id)}
              selectable={isSelectionMode}
            />
          ))}
        </div>
        
        
      </div>
    </div>
  );
};

export default SampleList;
