import React, { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { exportData } from "../../utils/exportUtils";
import SampleCard from "../Samples/SampleCard";
import { useSupabase } from "../SupaBaseProvider";

const SampleList = ({ onSampleClick }) => {
  const [samples, setSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
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

  const handleExport = async () => {
    const samplesToExport = samples.filter((p) => selectedSamples.has(p.id));
    let dataToExport = await getDataToExport(samplesToExport);
    exportData(dataToExport, "samples");
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

  const handleButtonSelections = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    } else {
      setSelectedSamples(new Set());
      setIsSelectionMode(false);
    }
  };

  return (
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
      <div className="flex justify-end mb-4 space-x-3">
        <button
          onClick={handleButtonSelections}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isSelectionMode ? "Cancel Selection" : "Select Samples"}
        </button>
        {isSelectionMode && selectedSamples.size > 0 && (
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected ({selectedSamples.size})
          </button>
        )}
      </div>
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
      {loading && <div className="text-center py-4">Loading...</div>}
    </div>
  );
};

export default SampleList;