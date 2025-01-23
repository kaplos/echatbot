import { Plus } from 'lucide-react';
import IdeaBoard from '../components/Ideas/IdeaBoard'
import AddIdeaModal from '../components/Ideas/AddIdeaModal'
import { useState,useEffect } from 'react';
import { useSupabase } from '../components/SupaBaseProvider';
import CardInfoModal from '../components/CardInfoModal';
// const ideas =[
//     {
//         id: 1,
//         title: 'New Idea',
//         description: 'This is a new idea that I have',
//         images:[""],
//         status: 'in_review',
//         tags: ['tag1', 'tag2'],
        
//         createdAt: new Date(),
        
//     }
// ]

export default function Ideas() {
  const supabase = useSupabase();
    let [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [ideas, setIdeas] = useState([]);
    const [idea, setIdea] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const handleClick = async (id) => {
      // console.log(id,'idea card');
      const { data, error } = await supabase
      .from('Ideas')
      .select('*')
      .eq('id', id);

      if (error) {
        console.error('Error fetching idea:', error);
        return;
      }
      console.log(data,'data from click');
      setIdea(data[0]);
      setCardModalOpen(true);
    };
    const handleAddIdea = (newIdea) => {
      console.log(newIdea,'newIdea in handleAddIdea');
      setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
      setIsAddModalOpen(false);
    };
    useEffect( () =>{

      const fetchIdeas = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('Ideas')
        .select('*')
        .order('created_at', { ascending: false }) // Replace 'created_at' with your timestamp column
        .limit(12);
        
        if (error) {
          console.error('Error fetching ideas:', error);
          return;
        }
        setIdeas(data);
        console.log(data);
        setIsLoading(false);
      };
       fetchIdeas(); 
    },[])
    const updateIdea = (updatedIdea) => {
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
      );
    };

    if(isLoading){
      return <div>Loading...</div>
    }
      return (
        <div className="p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Ideas Board</h1>
            <button 
              className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
              onClick={() => setIsAddModalOpen(true)}
            >
              
              <Plus className="w-5 h-5 mr-2 bg-chatbot-gold" />
              New Idea
            </button>
          </div>
          <IdeaBoard ideas={ideas} handleClick={handleClick}/>
          <AddIdeaModal
            isOpen={isAddModalOpen}
            onClose={handleAddIdea}
          />
          {idea &&
            <CardInfoModal 
            isOpen={cardModalOpen}
            onClose={() => setCardModalOpen(false)}
            card={idea}
            updateIdea={updateIdea}
          />
          }
        </div>
    );
}
