import React, { useState, useEffect } from "react";
import Loading from "../Loading";

import { Download } from "lucide-react";
import { useSupabase } from "../SupaBaseProvider";
import ViewableListActionButtons from "../MiscComponenets/ViewableListActionButtons";
import IdeasExportButton from "../Pdf/IdeasExportButton";
import IdeaCard from "./IdeaCard";
import { useSearchParams } from "react-router-dom";

const IdeaBoard = ({ ideas, setIdeas, handleClick }) => {
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { supabase } = useSupabase();
  const PAGE_SIZE = 20;

  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for query params
  const page = parseInt(searchParams.get("page") || "0", 10); // Get the current page from the URL

  // Fetch ideas from Supabase
  const fetchIdeas = async (pageNumber) => {
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching ideas:", error);
      setLoading(false);
      return;
    }

    setIdeas(data); // Replace ideas with the current page's data
    setHasMore(data.length === PAGE_SIZE); // Check if there are more pages
    setLoading(false);
  };

  // Fetch the current page on component mount or when the page changes
  useEffect(() => {
    fetchIdeas(page);
  }, [page]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 0 || (newPage > page && !hasMore)) return; // Prevent invalid page navigation
    setSearchParams({ page: newPage }); // Update the URL with the new page number
  };

  const handleExport = async () => {
    const ideasToExport = ideas.filter((p) => selectedIdeas.has(p.id));
    const { data: ideasData, error: ideasDataError } = await supabase
      .from("ideas")
      .select("*")
      .in("id", ideasToExport.map((idea) => idea.id));

    if (ideasDataError) {
      console.error("Error exporting ideas:", ideasDataError);
      return;
    }

    setSelectedIdeas(new Set());
    setIsSelectionMode(false);
  };

  const toggleIdeaSelection = (idea) => {
    const newSelection = new Set(selectedIdeas);
    if (newSelection.has(idea.id)) {
      newSelection.delete(idea.id);
    } else {
      newSelection.add(idea.id);
    }
    setSelectedIdeas(newSelection);
  };

  return (
    <div>
      <ViewableListActionButtons
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        handleSelections={(selected) => setSelectedIdeas(selected)}
        handleExport={handleExport}
        allItems={ideas}
        selectedItems={selectedIdeas}
        onDelete={(deletedSelectedItems) =>
          setIdeas(ideas.filter((i) => !deletedSelectedItems.includes(i.id)))
        }
        type="ideas"
        customComponent={
          <IdeasExportButton
            ideas={selectedIdeas}
            fetchIdeas={async () => {
              const ideasToExport = ideas.filter((p) => selectedIdeas.has(p.id));
              const { data: ideasData, error: ideasDataError } = await supabase
                .from("ideas")
                .select("*")
                .in("id", ideasToExport.map((idea) => idea.id));

              if (ideasDataError) {
                console.error("Error exporting ideas:", ideasDataError);
                return [];
              }

              return ideasData; // Return the fetched data
            }}
            setSelectedIdeas={setSelectedIdeas}
            setIsSelectionMode={setIsSelectionMode}
          >
            {(handleExport) => (
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedIdeas.size})
              </button>
            )}
          </IdeasExportButton>
        }
      />
      <div className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...ideas]
            .sort((a, b) => b.id - a.id)
            .map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={isSelectionMode ? toggleIdeaSelection : handleClick}
                selected={selectedIdeas.has(idea.id)}
                selectable={isSelectionMode}
              />
            ))}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            className={`btn p-2 rounded ${
              page === 0 || loading
                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </button>
          <span>Page {page + 1}</span>
          <button
            className={`btn p-2 rounded ${
              !hasMore || loading
                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
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

export default IdeaBoard;
