import { useState,useEffect } from 'react'
import { Plus, Upload } from 'lucide-react';
import GridComponenet from '../components/Qoutes/GridComponent'
import AddQuoteModal from '../components/Qoutes/AddQuoteModal'
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../components/SupaBaseProvider';

export default function Quote (){
    const navigate = useNavigate()
    const {supabase} = useSupabase();
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen,setIsAddModalOpen]= useState(false)
    const [quotes,setQuotes ]=useState([])
//     useEffect(()=>{
//     const fetchSamples = async () => {
//         setIsLoading(true);
//         const { data, error } = await supabase.from('quotes')
//         .select('*')
//         .order('created_at', { ascending: false }) // Replace 'created_at' with your timestamp column
//         .limit(12);
        
//         if (error) {
//           console.error('Error fetching samples:', error);
//           return;
//         }
//         setQuotes(data);
//         // console.log(data);
//         setIsLoading(false);
//       };
//        fetchSamples(); 
//       },[])

   return(
    <div className="p-6">
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
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
                    onClick={() => navigate('/newQuote')}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Quote
                </button>
            </div>
        </div>
        
        <div>
            <span>
                filter goes here
            </span>
        </div>
        <GridComponenet 
            quotes={quotes}
            setQuotes={setQuotes}
        />
        <AddQuoteModal 
            isOpen={isAddModalOpen}
            onClose={()=> setIsAddModalOpen(false)}
            onSave={(newQuote)=> setQuotes([...quotes,newQuote])}
        />


        


    </div>
    
   ) 
}