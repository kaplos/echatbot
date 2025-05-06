import { Plus, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import DesignQuoteList from '../components/DesignQuotes/DesignQuoteList';
import AddDesignQuoteModal from '../components/DesignQuotes/AddDesignQuoteModal';
import Loading from '../components/Loading';
import DesignQuoteInfoModal from '../components/DesignQuotes/DesignQuoteInfoModal';
import DesignApprovalForm from '../components/DesignQuotes/DesignApprovalForm';
import { useSupabase } from '../components/SupaBaseProvider';
import { useLocation } from 'react-router-dom';

const DesignQuote = () =>{
    const {supabase} = useSupabase();
    const location = useLocation(); // Access the current URL
    const queryParams = new URLSearchParams(location.search); // Parse the query string
    const designId = queryParams.get('designId'); 

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [design,setDesign] = useState(null);
    const [designToShow, setDesignToShow] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [designs, setDesigns] = useState(null);

    // console.log(selectedDesign, 'designs');    
    useEffect(()=>{
        const fetchDesignQuote = async () => {
            setIsLoading(true);
            console.log(designId,'designId from params')
            let query = supabase.from('starting_info').select('*');
            if (designId) {
                query = query.eq('id', designId);
            }else{
                query = query.order('created_at', { ascending: false }).limit(12); // Replace 'created_at' with your timestamp column
            }
            const { data, error } = await query; // Use the modified query here

            console.log(data, 'data from supabase');
            if (error) {
              console.error('Error fetching design quotes:', error);
              setIsLoading(false);
              return;
            }
            setDesigns(data);
            setIsLoading(false); // Moved this line up for clarity
          };
          fetchDesignQuote(); 
    },[])
            
    
    const handleClick = async (design) => {
        const { data, error } = await supabase
      .from('starting_info')
      .select('*')
      .eq('id', design.id);

      if (error) {
        console.error('Error fetching design:', error);
        return;
      }
      console.log(data,'data from click');
        setDesign(data[0]);
        setIsDetailsOpen(true);
    }
    const updateDesign = (updatedDesigns) => {
        setDesigns((previousDesign) =>
            previousDesign.map((design) => (design.id === updatedDesigns.id ? updatedDesigns : design))
        );
      };

    if(isLoading){
        return <Loading />
    }
    // if(designs.length === 0){
    //     return <div className="flex justify-center items-center h-screen">No Design Quotes Found</div>
    // }
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Design Quotes</h1>
                <div className="flex space-x-3">
                        {/* <button 
                            className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 border border-gray-300"
                            onClick={() => setIsImportModalOpen(true)}
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Import
                        </button> */}
                        <button 
                            className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Design Quote
                        </button>
                    </div>
                </div>
                {designs.length === 0 ? (
                    <div className="flex justify-center items-center h-screen">No Design Quotes Found For This Design</div>
                ) : 
                <DesignQuoteList
                    designs={designs}
                    // onDesignClick={(design) => {

                    // setIsDetailsOpen(true);
                    // setSelectedDesign(design);
                    // }}
                    onDesignClick={handleClick}
                />
                } 


                <AddDesignQuoteModal
                    isOpen={isAddModalOpen}
                    onSave={(design) => {
                        setIsAddModalOpen(false)
                        setDesigns((prev)=> [...prev, design])
                    }}
                    onClose={() => setIsAddModalOpen(false)}
                />
                {design &&
                    <DesignApprovalForm 
                        isOpen={isDetailsOpen}
                        updateDesign={updateDesign}
                        onClose={() =>{ setIsDetailsOpen(false);
                            setDesign(null)
                        }}
                        design={design}
                        openEditModal={() => {setIsAddModalOpen(true)

                        }} 
                    />
                }
                {design&&

                    <DesignQuoteInfoModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    design={design}
                    updateDesign={updateDesign}
                    />
                }
        </div>
    )
}
export default DesignQuote;