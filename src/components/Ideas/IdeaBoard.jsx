import IdeaCard from "./IdeaCard";
// import { exportToCSV } from "../../utils/exportUtils";
import React, { useState } from "react";
import { Download } from "lucide-react";
import { useSupabase } from "../SupaBaseProvider";
// import IdeasExportButton from "../Pdf/IdeasExport";
import IdeasExportButton from "../Pdf/IdeasExportButton";
import ViewableListActionButtons from "../MiscComponenets/ViewableListActionButtons";

const IdeaBoard = ({ ideas,setIdeas, handleClick }) => {
  console.log(ideas)
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const {supabase} = useSupabase();

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
  
  return (
    <div>
   
      <ViewableListActionButtons
                      isSelectionMode={isSelectionMode}
                      setIsSelectionMode={setIsSelectionMode}
                      handleSelections={(selected)=> setSelectedIdeas(selected)}
                      handleExport={handleExport}
                      allItems={ideas}
                      selectedItems={selectedIdeas}
                      onDelete={(deletedSelectedItems) => 
                        setIdeas(ideas.filter(i => !deletedSelectedItems.includes(i.id)))
                      }
                      type="ideas"
                      customComponent={ <IdeasExportButton
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
                      </IdeasExportButton>}
                    />
      <div className="flex flex-col">
      
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
    </div>
  );
};

export default IdeaBoard;
