import React, { useState, useEffect, useRef } from "react";
import { CornerDownLeft, Download } from "lucide-react";
import { exportData } from "../../utils/exportUtils";
import SampleCard from "../Samples/SampleCard";
import { useSupabase } from "../SupaBaseProvider";
import Loading from "../Loading";
import ViewableListActionButtons from "../MiscComponenets/ViewableListActionButtons";
import { useMessage } from "../Messages/MessageContext";
import { useGenericStore } from "../../store/VendorStore";

const SampleList = ({ samples, setSamples, setIsLoading, onSampleClick }) => {
   const {getEntity}= useGenericStore()
    const  {options}  = getEntity("settings");

  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
  const {showMessage} = useMessage()
  const PAGE_SIZE = 20;

  const hasFetchedSamples = useRef(false);

  // Fetch samples from Supabase
  const fetchSamples = async (pageNumber) => {
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("samples")
      .select("* ,starting_info:starting_info(*)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching samples:", error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) setHasMore(false);

    setSamples((prevSamples) => [...prevSamples, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedSamples.current) {
      fetchSamples(0); // Fetch the first page
      hasFetchedSamples.current = true;
    }
  }, []);
  const getDataToExport = async (arrayOfProducts) => {
    try {
      // Fetch samples and their starting_info
      const { data: samplesData, error: sampleDataError } = await supabase
        .from("sample_with_stones_export")
        .select("*")
        .in(
          "sample_id",
          arrayOfProducts.map((sample) => sample.id)
        );

      if (sampleDataError) {
        console.error("Error fetching samples:", sampleDataError);
        return [];
      }
      return samplesData; // Return samples with their stones
    } catch (error) {
      console.error("Error in getDataToExport:", error);
      return [];
    }
  };
  const getDropDownData = async ()=>{
    const { data, error } = await supabase.rpc('get_dropdown_options');

    if(error){
      showMessage('Issue with retriving dropdown options')
    }
    return data
  }
  const handleExport = async () => {
    const samplesToExport = samples.filter((p) => selectedSamples.has(p.id));
    let dataToExport = await getDataToExport(samplesToExport);
    let dropdowns = await getDropDownData();
    dropdowns={
      ...dropdowns,
      "color":options?.stonePropertiesForm?.color.map(option => ({name:option})),
      "type":options?.stonePropertiesForm?.type.map(option => ({name:option})),
      "backType":options?.formFields?.backType.map(option => ({name:option})),
      
    }
   

    exportData(dataToExport,dropdowns, "samples");
    setSelectedSamples(new Set());
    setIsSelectionMode(false);
  };

  const toggleSampleSelection = (sample) => {
    const newSelection = new Set(selectedSamples);
    if (newSelection.has(sample.id)) {
      newSelection.delete(sample.id);
    } else {
      newSelection.add(sample.id);
    }
    setSelectedSamples(newSelection);
  };

  return (
    <div>
      <ViewableListActionButtons
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        handleSelections={(selected) => setSelectedSamples(selected)}
        handleExport={handleExport}
        onDelete={(deletedSelectedItems) => 
          setSamples(designs.filter(s => !deletedSelectedItems.includes(s.id)))
        }
        allItems={samples}
        selectedItems={selectedSamples}
        type="Samples"
      />
      <div
        className="flex flex-col overflow-auto max-h-[600px]"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const nearBottom = scrollHeight - scrollTop <= clientHeight + 50;
          if (nearBottom && !loading && hasMore) {
            fetchSamples(page);
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              onClick={isSelectionMode ? toggleSampleSelection : onSampleClick}
              selected={selectedSamples.has(sample.id)}
              selectable={isSelectionMode}
            />
          ))}
        </div>
        <div className="flex justify-center items-center mt-6">
          {loading && <Loading />}
        </div>
      </div>
    </div>
  );
};

export default SampleList;
