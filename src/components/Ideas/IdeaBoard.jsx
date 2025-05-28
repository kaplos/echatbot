import IdeaCard from "./IdeaCard";
// import { exportToCSV } from "../../utils/exportUtils";
import React, { useState } from "react";
import { Download } from "lucide-react";
import { useSupabase } from "../SupaBaseProvider";
// import IdeasExportButton from "../Pdf/IdeasExport";
import IdeasExportButton from "../Pdf/IdeasExportButton";

const IdeaBoard = ({ ideas, handleClick }) => {
  // console.log(ideas)
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const {supabase} = useSupabase();

  const handleExport = async () => {
    const ideasToExport = ideas.filter((p) => selectedIdeas.has(p.id));
    const { data: ideasData, error: ideasDataError } = await supabase
      .from("Ideas")
      .select("*")
      .in("id", ideasToExport.map((idea) => idea.id));

    if (ideasDataError) {
      console.error("Error exporting ideas:", ideasDataError);
      return;
    }


    // exportToCSV(ideasData);
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
  const handleButtonSelections = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }else{
      setSelectedIdeas(new Set());
      setIsSelectionMode(false);
    }
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-4 space-x-3">
        <button
          onClick={handleButtonSelections}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isSelectionMode ? "Cancel Selection" : "Select Samples"}
        </button>
        {isSelectionMode && selectedIdeas.size > 0 && (
          <IdeasExportButton
            ideas={selectedIdeas}
            fetchIdeas={async () => {
              const ideasToExport = ideas.filter((p) => selectedIdeas.has(p.id));
              const { data: ideasData, error: ideasDataError } = await supabase
                .from("Ideas")
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
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...ideas].sort((a, b) => b.id - a.id).map((idea) => (          
        <IdeaCard
            key={idea.id}
            idea={idea}
            // handleClick={handleClick}
            onClick={isSelectionMode ? toggleIdeaSelection : handleClick}
            selected={selectedIdeas.has(idea.id)}
            selectable={isSelectionMode}
          />
        ))}
      </div>
    </div>
  );
};

export default IdeaBoard;
