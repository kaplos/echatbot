import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X , Tag as TagIcon} from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { useSupabase,handleImageUpload } from '../SupaBaseProvider';

const AddIdeaModal = ({ isOpen, onClose,onSave }) => {
  const supabase = useSupabase();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    tags: [],
    // comments: [],
  });
  const [tagInput, setTagInput] = useState('');


  const handleAddTag = (e) => {
    console.log(e,'e.target.value');
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    let newIdea = {
      title: formData.title,
      description: formData.description,
      tags: JSON.stringify(formData.tags),
      images: JSON.stringify(formData.images),
      comments: formData.comments,
    };

    const { data, error } = await supabase
    .from('Ideas')
    .insert([newIdea])
    .select();

    if (error) {
      console.error('Error inserting idea:', error);
    } else {
      console.log('Idea inserted:', data[0]);
    }

    // const imageRows = formData.images.map((imageUrl) => ({
    //   foreign_id: data[0].id, // Associate the image with the idea
    //   foreign_type: 'Idea', // Specify the module type
    //   image_url: imageUrl,
    // }));
    // // Handle image upload
    // const {error: imageError } = await supabase
    //   .from('ImageStorage')
    //   .insert(imageRows);
      
    //   if (imageError) {
    //     console.error('Error inserting images:', imageError);
    //     return;
    //   }
    // Handle form submission (e.g., save to database)
    newIdea={...newIdea,id:data[0].id , created_at:data[0].created_at}
    console.log(newIdea);
    onSave(data[0]);
  };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Add New Idea
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chabot-gold focus:ring-chabot-gold"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chabot-gold focus:ring-chabot-gold"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tags
                      </label>
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          // onSubmit={handleAddTag}
                          placeholder="Type a tag and press Enter"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-chabot-gold focus:ring-chabot-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Images
                      </label>
                      <ImageUpload
                        images={formData.images || []}
                        onChange={(images) => setFormData({ ...formData, images })}
                      />
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">
                          Comments 
                      </label>
                      <textarea
                          name="comments"
                          rows={4}
                          value={formData.comments}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
                    >
                      Add Idea
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddIdeaModal;