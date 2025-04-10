import React, { useState, useRef, useCallback } from 'react';
import { useSupabase } from '../SupaBaseProvider';
import SlideEditorWrapper from './SlideEditor';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

export default function AddIdeaModal({ isOpen, onClose, fetchIdeas }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [slideData, setSlideData] = useState(null);
  const supabase = useSupabase();
  const modalRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      // Add the idea with slides data included
      const newIdea = {
        id: uuidv4(),
        title,
        description,
        status,
        slides: slideData ? slideData.slides : [],
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('ideas').insert(newIdea);
      
      if (error) throw error;
      
      // Reset form and close modal
      setTitle('');
      setDescription('');
      setStatus('Active');
      setSlideData(null);
      onClose();
      
      // Refresh ideas list
      if (fetchIdeas) {
        fetchIdeas();
      }
    } catch (error) {
      console.error('Error adding idea:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle slide changes without saving to database
  const handleSlideChange = useCallback((slide, allSlides) => {
    // Only update if the data has actually changed
    setSlideData(prevData => {
      const newSlides = allSlides.map(s => ({
        ...s,
        elements: s.elements || []
      }));
      
      // Check if the data has actually changed
      if (prevData && 
          JSON.stringify(prevData.slides) === JSON.stringify(newSlides)) {
        return prevData;
      }
      
      return {
        slides: newSlides,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  // Handle design export when the design is saved
  const handleDesignExport = useCallback((designData) => {
    setSlideData(designData);
  }, []);

  // Close modal when clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Add New Idea</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design Your Idea
              </label>
              <div className="border border-gray-300 rounded-lg h-[500px] overflow-hidden">
                <SlideEditorWrapper 
                  onSlideChange={handleSlideChange}
                  onExport={handleDesignExport}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-chabot-gold text-white rounded-lg hover:bg-opacity-90"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Idea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}