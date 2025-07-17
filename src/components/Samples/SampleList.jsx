import React, { useState, useEffect, useRef } from "react";
import { CornerDownLeft, Download } from "lucide-react";
import { exportData } from "../../utils/exportUtils";
import SampleCard from "../Samples/SampleCard";
import { useSupabase } from "../SupaBaseProvider";
import Loading from "../Loading";
import ViewableListActionButtons from "../MiscComponenets/ViewableListActionButtons";
import { useMessage } from "../Messages/MessageContext";
import { useGenericStore } from "../../store/VendorStore";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import React Router hooks

const SampleList = ({ samples, setSamples, setIsLoading, onSampleClick }) => {
  const { getEntity } = useGenericStore();
  const { options } = getEntity("settings");

  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
  const { showMessage } = useMessage();
  const PAGE_SIZE = 20;

  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for query params
  const navigate = useNavigate(); // React Router hook for navigation
  const page = parseInt(searchParams.get("page") || "0", 10);
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

    setSamples(data); // Replace samples with the current page's data
    setHasMore(data.length === PAGE_SIZE); // Check if there are more pages
    setLoading(false);
  };

  // Fetch the first page on component mount
  // useEffect(() => {
  //   fetchSamples(0);
  // }, []);
  useEffect(() => {
    fetchSamples(page); // Fetch samples whenever the page changes
  }, [page]);

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
  const getDropDownData = async () => {
    const { data, error } = await supabase.rpc("get_dropdown_options");

    if (error) {
      showMessage("Issue with retriving dropdown options");
    }
    return data;
  };
  const handleExport = async () => {
    const samplesToExport = samples.filter((p) => selectedSamples.has(p.id));
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
    if (newSelection.has(sample.id)) {
      newSelection.delete(sample.id);
    } else {
      newSelection.add(sample.id);
    }
    setSelectedSamples(newSelection);
  };
  if(loading){
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
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
      <div className="flex flex-col overflow-auto max-h-[600px]">
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
        <div className="flex justify-between items-center mt-6">
          <button
            className={`btn p-2 rounded  ${page === 0 || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : " bg-blue-500 text-white hover:bg-blue-600"}`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </button>
          <span>Page {page + 1}</span>
          <button
            className={`btn p-2 rounded hover:bg-blue-600 ${!hasMore || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : " bg-blue-500 text-white"}`}
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || loading}
          >
            Next
          </button>
        </div>
        {loading && (
          <div className="flex justify-center items-center mt-6">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleList;
