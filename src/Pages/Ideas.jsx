import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import IdeaBoard from '../components/Ideas/IdeaBoard';
import AddIdeaModal from '../components/Ideas/AddIdeaModal';
import { useSupabase } from '../components/SupaBaseProvider';
import CardInfoModal from '../components/CardInfoModal';
import Loading from '../components/Loading';
import SlideEditor from '../components/Ideas/SlideEditor';

export default function Ideas() {
  const supabase = useSupabase();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [slideEditorOpen, setSlideEditorOpen] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlideData, setCurrentSlideData] = useState(null);
  
  // Handle opening the slide editor for a new design
  const openSlideEditor = () => {
    setSlideEditorOpen(true);
    setCurrentSlideData(null); // Start with a fresh design
  };

  // Handle opening the slide editor for an existing design
  const editIdeaDesign = (idea) => {
    setCurrentSlideData(idea.slideData); // Load the design data
    setSlideEditorOpen(true);
    setIdea(idea);
  };
  
  // Handle slide changes from the SlideEditor component
  const handleSlideChange = (currentSlide, allSlides) => {
    console.log('Current slide changed:', currentSlide);
    // You could persist this data if needed for auto-save functionality
  };
  
  // Handle saving the entire design
  const handleExportDesign = async (designData) => {
    console.log('Design exported:', designData);
    
    // Check if we're editing an existing idea or creating a new one
    if (idea) {
      // Update existing idea
      const updatedIdea = {
        ...idea,
        slideData: designData,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('Ideas')
        .update(updatedIdea)
        .eq('id', idea.id);
      
      if (error) {
        console.error('Error updating idea:', error);
        return;
      }
      
      // Update local state
      updateIdea(updatedIdea);
    } else {
      // Create a new idea
      const newIdea = {
        title: 'New Design ' + new Date().toLocaleString(),
        description: 'Created with Slide Editor',
        slideData: designData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('Ideas')
        .insert(newIdea)
        .select();
      
      if (error) {
        console.error('Error creating idea:', error);
        return;
      }
      
      // Add to local state
      if (data && data.length > 0) {
        handleAddIdea(data[0]);
      }
    }
    
    // Close the slide editor
    setSlideEditorOpen(false);
  };
  
  const handleClick = async (id) => {
    const { data, error } = await supabase
      .from('Ideas')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching idea:', error);
      return;
    }
    
    setIdea(data[0]);
    setCardModalOpen(true);
  };
  
  const handleAddIdea = (newIdea) => {
    console.log('New idea added:', newIdea);
    setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
    setIsAddModalOpen(false);
  };
  
  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) {
        console.error('Error fetching ideas:', error);
        return;
      }
      
      setIdeas(data);
      setIsLoading(false);
    };
    
    fetchIdeas();
  }, []);
  
  const updateIdea = (updatedIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (slideEditorOpen) {
    return (
      <div className="w-full h-screen">
        <div className="bg-gray-100 p-2 flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            {idea ? `Editing: ${idea.title}` : 'Creating New Design'}
          </h2>
          <button 
            onClick={() => setSlideEditorOpen(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
        <SlideEditor 
          initialData={currentSlideData} 
          onSlideChange={handleSlideChange}
          onExport={handleExportDesign}
        />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ideas Board</h1>
        <div className="flex space-x-2">
          <button 
            className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2 bg-chatbot-gold" />
            New Idea
          </button>
        </div>
      </div>
      
      <IdeaBoard 
        ideas={ideas} 
        handleClick={handleClick} 
        handleEdit={editIdeaDesign} 
      />
      
      <AddIdeaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddIdea}
      />
      
      {idea && (
        <CardInfoModal 
          isOpen={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
          idea={idea}
          updateIdea={updateIdea}
          onEdit={() => {
            setCardModalOpen(false);
            editIdeaDesign(idea);
          }}
        />
      )}
    </div>
  );
}
