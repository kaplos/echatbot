
import { Plus, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { useSupabase } from '../components/SupaBaseProvider';
import SampleList from '../components/Samples/SampleList'
import AddSampleModal from '../components/Samples/AddSampleModal'
import SampleInfoModal from '../components/Samples/SampleInfoModal'

export default function Samples(){
    const {supabase} = useSupabase();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sample,setSample] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [samples, setSamples] = useState(null);


    useEffect(()=>{
        const fetchSamples = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
            .from('samples')
            .select('*, starting_info(*)')
            .order('created_at', { ascending: false }) // Replace 'created_at' with your timestamp column
            .limit(12);
            console.log(data[0],'data from samples')
            if (error) {
              console.error('Error fetching samples:', error);
              return;
            }
            setSamples(data);
            // console.log(data);
            setIsLoading(false);
          };
           fetchSamples(); 
    },[])
    const handleClick = async (sample) => {
        const { data, error } = await supabase
      .from('samples')
      .select('*, starting_info(*)')
      .eq('id', sample.id);

      if (error) {
        console.error('Error fetching sample:', error);
        return;
      }
      console.log(data,'data from click');
        const startingInfo = data[0].starting_info;
        delete data[0].starting_info
        const restructuredData = {
            formData: data[0],
            starting_info: startingInfo

        }
        setSample(restructuredData);
        setIsDetailsOpen(true);
    }
    const updateSample = (updatedSamples) => {
        setIsDetailsOpen(false);
        setSamples((previousSample) =>
            previousSample.map((Sample) => (Sample.id === updatedSamples.id ? updatedSamples : Sample))
        );
      };
      
      
    if(isLoading){
        return <Loading />
    }
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Samples</h1>
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
                            New Sample
                        </button>
                    </div>
                </div>
                <SampleList
                    samples={samples}
                    // onDesignClick={(design) => {

                    // setIsDetailsOpen(true);
                    // setSelectedDesign(design);
                    // }}
                    onSampleClick={handleClick}
                />
                <AddSampleModal
                    isOpen={isAddModalOpen}
                    onSave={((sample)=>{
                        setIsAddModalOpen(false)
                        setSamples((prev)=> [...prev, sample])
                    })}
                    onClose={()=> {
                        setIsAddModalOpen(false)
                    }}
                />
                {sample && 
                    <SampleInfoModal 
                        isOpen={isDetailsOpen}
                        sample={sample} 
                        onClose={() => setIsDetailsOpen(false)} 
                        updateSample={updateSample}
                    />
                }


        </div>
    )

}