import { Plus, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import DesignList from '../components/Designs/DesignList';
import AddDesignModal from '../components/Designs/AddDesignModal';
import Loading from '../components/Loading';
import DesignInfoModal from '../components/Designs/DesignInfoModal';
import { useSupabase } from '../components/SupaBaseProvider';
import ImportModal from '../components/Products/ImportModal';
import { useLocation } from 'react-router-dom';

const Designs = () =>{
    const {supabase} = useSupabase();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [design,setDesign] = useState(null);
    const [designToShow, setDesignToShow] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [designs, setDesigns] = useState(null);
    const location = useLocation(); // Access the current URL
    const queryParams = new URLSearchParams(location.search); // Parse the query string
    const designId = queryParams.get('designId') || null;
    // console.log(selectedDesign, 'designs');    
    useEffect(()=>{
        const fetchIdeas = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('designs')
            .select('*')
            .order('created_at', { ascending: false }) // Replace 'created_at' with your timestamp column
            .limit(12);
            
            if (error) {
              console.error('Error fetching designs:', error);
              return;
            }
            setDesigns(data);
            // console.log(data);
            setIsLoading(false);
          };
           fetchIdeas(); 
    },[])
    useEffect(()=>{
        if(designId){
            handleClick({id:designId})
        }
    },[designId])
    
    // const handleClick = async (design) => {
    //     const { data, error } = await supabase
    //   .from('designs')
    //   .select('*')
    //   .eq('id', design.id);

    //   if (error) {
    //     console.error('Error fetching design:', error);
    //     return;
    //   }
    //   console.log(data,'data from click');
    //     setDesign(data[0]);
    //     setIsDetailsOpen(true);
    // }
    const handleClick = async (design) => {
        // Open the modal immediately
        setIsDetailsOpen(true);
      
        // Show a loading state in the modal
        setDesign(null);
      
        // Fetch the design data
        const { data, error } = await supabase
          .from('designs')
          .select('*')
          .eq('id', design.id);
      
        if (error) {
          console.error('Error fetching design:', error);
          setIsDetailsOpen(false); // Close the modal if there's an error
          return;
        }
      
        // Update the design data in the modal
        setDesign(data[0]);
      };
    const updateDesign = (updatedDesigns) => {
        setDesigns((previousDesign) =>
            previousDesign.map((design) => (design.id === updatedDesigns.id ? updatedDesigns : design))
        );
      };

    if(isLoading){
        return <Loading />
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Designs</h1>
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
                            New Design
                        </button>
                    </div>
                </div>
                <DesignList
                    designs={designs}
                    onDesignClick={handleClick}
                />



                <AddDesignModal
                    isOpen={isAddModalOpen}
                    onSave={(design) => {
                        setIsAddModalOpen(false)
                        setDesigns((prev)=> [...prev, design])
                    }}
                    onClose={() => setIsAddModalOpen(false)}
                />
                {design &&
                    <DesignInfoModal 
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        design={design}
                        updateDesign={updateDesign}
                    />
                }
                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    type="designs"

                />
        </div>
    )
}
export default Designs;