import React, { useState, Fragment,useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X,TagIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';
import ConfirmationModal from './ConfirmationModal';
import { useSupabase,handleImageUpload } from './SupaBaseProvider';

const CardInfoModal = ({ isOpen, onClose, card,updateIdea}) => {
    const supabase = useSupabase();
    const [tagInput, setTagInput] = useState('');
    const [confirmationModal, setConfirmationModal] = useState(false);
    
    const [originalData, setOriginalData] = useState({
        id: card.id,
        title: card.title,
        description: card.description,
        tags: JSON.parse(card.tags),
        images: JSON.parse(card.images),
        status: card.status,
        comments: card.comments,
        created_at: card.created_at,  
      });
      const [formData, setFormData] = useState({ ...originalData });
    
      useEffect(() => {
        setOriginalData({
            id: card.id,
            title: card.title,
            description: card.description,
            tags: JSON.parse(card.tags),
            images: JSON.parse(card.images),
            status: card.status,
            comments: card.comments,
            created_at: card.created_at,  
        });
        setFormData({
            id: card.id,
            title: card.title,
            description: card.description,
            tags: JSON.parse(card.tags),
            images: JSON.parse(card.images),
            status: card.status,
            comments: card.comments,
            created_at: card.created_at,  

        });
      }, [card]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleImageChange = async(images) => {
    let imageUrls ;
        if (images.length > 0) {
          imageUrls = [ await handleImageUpload(images), ...formData.images];
        }
    setFormData({ ...formData, imageUrls });
    };

//   const handleTagChange = (index, value) => {
//     const newTags = [...formData.tags];
//     newTags[index] = value;
//     setFormData({ ...formData, tags: newTags });
//   };


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
  

  const getRemovedImages = (originalImages, currentImages) => {
    return originalImages.filter(image => !currentImages.includes(image));
  };

  const handleSubmit = async () => {
    const updates = {};
    if (formData.title !== originalData.title) updates.title = formData.title;
    if (formData.description !== originalData.description) updates.description = formData.description;
    if (JSON.stringify(formData.tags) !== JSON.stringify(originalData.tags)) updates.tags = JSON.stringify(formData.tags);
    if (JSON.stringify(formData.images) !== JSON.stringify(originalData.images)) updates.images = JSON.stringify(formData.images);
    if (formData.status!==originalData.status) updates.status = formData.status;
    if (formData.comments !== originalData.comments) updates.comments = formData.comments;
    const removedImages = getRemovedImages(originalData.images, formData.images);


    if (Object.keys(updates).length > 0) {
        console.log(updates, "updates");
      const { data, error } = await supabase
        .from('Ideas')
        .update(updates)
        .eq('id', card.id);

      if (error) {
        console.error('Error updating idea:', error);
      } else {
        console.log('Idea updated:', data);
        setOriginalData({ ...formData });
        
        // Call the update function to update the idea in the parent component
        updateIdea({ ...formData});
      }
    }

    onClose();
  };






  const handleOpenModal = () => {
    setConfirmationModal(true);
  };

  const handleCloseModal = () => {
    setConfirmationModal(false);
  };

  const handleConfirmAction = () => {
    console.log('Action confirmed');
    setConfirmationModal(false);
    setFormData({ ...formData, status: 'rejected' });
    console.log(formData.status,'formdata in reject'); 
    handleSubmit();
    // Perform the action here
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
                    Edit Card Information
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div>

                </div>

                <div className="p-6">
                  <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Images
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                      <ImageUpload
                        images={formData.images || []}
                        onChange={handleImageChange}
                      />
                        
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          <option value="in_review">In Review</option> 
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option> 
                        </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Images
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={image}
                              onChange={(e) => handleImageChange(index, e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Add Image
                        </button>
                      </div>
                    </div> */}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    {/* <button
                    type='button'
                    onClick={handleOpenModal}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                    >
                        Reject
                    </button> */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
                    >
                      Save
                    </button>
                    {/* <ConfirmationModal
                        isOpen={confirmationModal}
                        onClose={handleCloseModal}
                        onConfirm={handleConfirmAction}
                        title="Confirm Action"
                        message="Are you sure you want to perform this action?"
                    /> */}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CardInfoModal;