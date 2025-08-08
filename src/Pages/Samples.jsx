import { Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { getImages, useSupabase } from "../components/SupaBaseProvider";
import SampleList from "../components/Samples/SampleList";
import AddSampleModal from "../components/Samples/AddSampleModal";
import SampleInfoModal from "../components/Samples/SampleInfoModal";
import ImportModal from "../components/Products/ImportModal";
import { useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/MiscComponenets/Pagination";
import FilterButton from "../components/Filters/FilterButton";

export default function Samples() {
  const { supabase } = useSupabase();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sample, setSample] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [samples, setSamples] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const location = useLocation(); // Access the current URL
  const queryParams = new URLSearchParams(location.search); // Parse the query string
  const sampleId = queryParams.get("sampleId") || null;

  useEffect(() => {
    if (sampleId) {
      handleClick({ id: sampleId });
    }
  }, [sampleId]);
 
  const handleClick = async (sample) => {
    // Open the modal immediately
    setIsDetailsOpen(true);

    // Show a loading state in the modal
    setSample(null);

    // Fetch the sample data
    const { data, error } = await supabase
      .from("samples")
      .select("*, starting_info(*)")
      .eq("id", sample.sample_id)
      .single()
    // const { data:imageData,error:imageError} = await supabase
    // .from('sample_images')
    // .select('*')
    // .single()
    // .eq('sample_id',sample.sample_id)
    // console.log(data,data.starting_info?.id)
    const {images,cad} = await getImages('starting_info',data.starting_info?.id) 
    console.log(images,cad)

    if (error) {
      console.error("Error fetching sample:", error);
      setIsDetailsOpen(false); // Close the modal if there's an error
      return;
    }

    const { data: stones, error: stonesError } = await supabase
      .from("stones")
      .select("*")
      .eq("starting_info_id", data.starting_info.id);

    if (stonesError) {
      console.error("Error fetching stones:", stonesError);
      setIsDetailsOpen(false); // Close the modal if there's an error
      return;
    }

    const startingInfo = data.starting_info;
    delete data.starting_info;

    const restructuredData = {
      formData: data,
      starting_info: {
        images:images,
        cad:cad,
        ...startingInfo,
        stones: stones,
      },
    };

    // Update the sample data in the modal
    setSample(restructuredData);
  };
  const updateSample = (updatedSamples) => {
    console.log(updatedSamples)
    setIsDetailsOpen(false);
    setSamples((previousSample) =>
      previousSample.map((Sample) =>
        Sample.sample_id === updatedSamples.id ? updatedSamples : Sample
      )
    );
  };

  // if(isLoading){
  //     return <Loading />
  // }

  return (
    <div className=" h-full bg-gray-100">
      <div className="flex justify-between items-center ">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Samples</h1>
          <div className="flex gap-2">
            <SearchBar
              items={samples}
              type={'sample_with_stones_export'}
              onSearch={(filteredItems) => {
                setFilteredItems(filteredItems);
              }}
            />
            <FilterButton type={'samples'}/>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 border border-gray-300"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-5 h-5 mr-2" />
            Import
          </button>
          <button
            className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Sample
          </button>
        </div>
      </div>
      <Pagination loading={isLoading} hasMore={hasMore} >
      <div className="flex-grow overflow-auto px-4 pb-4"> 
        <SampleList
          samples={filteredItems}
          setSamples={setSamples}
          setIsLoading={setIsLoading}
          setHasMore={setHasMore}
          hasMore={hasMore}
          isLoading={isLoading}
          onSampleClick={handleClick}
          />
          </div>         
      </Pagination>
      <AddSampleModal
        isOpen={isAddModalOpen}
        onSave={(sample) => {
          setIsAddModalOpen(false);
          setSamples((prev) => [sample, ...prev]);
        }}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
      />
      {sample && (
        <SampleInfoModal
          isOpen={isDetailsOpen}
          sample={sample}
          onClose={() => setIsDetailsOpen(false)}
          updateSample={updateSample}
        />
      )}
      <ImportModal
  isOpen={isImportModalOpen}
  onClose={() => setIsImportModalOpen(false)}
  onImport={(importedSamples) => {
    setSamples((prev) => {
      // Create a map of existing samples for quick lookup
      const existingSamplesMap = new Map(prev.map((sample) => [sample.sample_id, sample]));

      // Merge or add imported samples
      importedSamples.forEach((importedSample) => {
        if (existingSamplesMap.has(importedSample.sample_id)) {
          // Update the existing sample
          existingSamplesMap.set(importedSample.sample_id, importedSample);
        } else {
          // Add the new sample
          existingSamplesMap.set(importedSample.sample_id, importedSample);
        }
      });

      // Return the updated list of samples
      return Array.from(existingSamplesMap.values());
    });
  }}
  type="samples"
/>
    </div>
  );
}
