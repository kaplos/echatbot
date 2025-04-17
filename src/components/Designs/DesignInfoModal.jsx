import React, { useState, Fragment,useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ImageUpload from '../ImageUpload';
import { useSupabase } from '../SupaBaseProvider';
import { ChevronDown, X,Upload } from 'lucide-react';
import { getStatusColor } from '../../utils/designUtils';
import CustomSelect from '../CustomSelect';

const DesignInfoModal = ({ isOpen, onClose, design,updateDesign }) => {
    console.log(design, 'design in modal');
    const supabase = useSupabase();
    const [originalData, setOriginalData] = useState({
        id: design.id ,
        title: design.title ,
        description: design.description ,
        link: design.link,
        collection: design.collection,
        category: design.category,
        images: design.images,
        status: design.status,
    });
    const [formData, setFormData] = useState({ ...originalData });

        useEffect(() => {
                setOriginalData({
                    id: design.id,
                    title: design.title,
                    description: design.description,
                    link: design.link,
                    collection: design.collection,
                    category: design.category,
                    images:  design.images,
                    status: design.status,  
                });
                setFormData({
                    id: design.id,
                    title: design.title,
                    description: design.description,
                    link: design.link,
                    collection: design.collection,
                    category: design.category,
                    images:  design.images,
                    status: design.status,  
                });
        }, [design]);

              const handleInputChange = (e) => {
                const { name, value } = e.target;
                setFormData({ ...formData, [name]: value });
              };
              const handleCustomSelect = (option) => {
              // console.log(option,'from handle select in edit')
                const {categories,value} =option
                setFormData({...formData, [categories]:value})
                // console.log(formData,'formdata')
              }

              const getRemovedImages = (originalImages, currentImages) => {
                return originalImages.filter(image => !currentImages.includes(image));
              };

              const handleSubmit = async (e) => {
                e.preventDefault();
                const updates = {};
                if (formData.title !== originalData.title) updates.title = formData.title;
                if (formData.description !== originalData.description) updates.description = formData.description;
                if (formData.images !== originalData.images) updates.images =formData.images;
                if (formData.status!==originalData.status) updates.status = formData.status;
                if (formData.link !== originalData.link) updates.link = formData.link;
                if (formData.collection !== originalData.collection) updates.collection = formData.collection;
                if (formData.category !== originalData.category) updates.category = formData.category;

                
                const removedImages = getRemovedImages(originalData.images, formData.images);
                
                // need to remove any photos that are deleted from an edited idea
                // ^ This is the function that will get the image urls that are removed 
            
                if (Object.keys(updates).length > 0) {
                    console.log(updates, "updates");
                  const { data, error } = await supabase
                    .from('designs')
                    .update(updates)
                    .eq('id', design.id);
            
                  if (error) {
                    console.error('Error updating design:', error);
                  } else {
                    console.log('design updated:', data);
                    setOriginalData({ ...formData });
                    
                    // Call the update function to update the idea in the parent component
                    updateDesign({ ...formData});
                  }
                }
            
                onClose();
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
                          <Dialog.Panel className="w-full  transform overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="flex justify-between items-center p-6 border-b">
                              <Dialog.Title className="text-xl font-semibold text-gray-900">
                                Edit Design
                              </Dialog.Title>
                              <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
            
                            <form onSubmit={handleSubmit } className="p-6">
                              
                              <div className="flex flex-row">
                                <div className=" pr-6 ">
                                    <div className="flex justify-between items-start flex flex-col min-h-[70vh] overflow-y-auto">
                                        {/* this is the image upload  */}
                                        <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Images
                                  </label>
                                  <ImageUpload
                                    images={formData.images || []}
                                    onChange={(images) => setFormData({ ...formData, images })}
                                  />
                                </div>
                                        {/* this is the status function */}
                                        <div className="mt-6 mb-2 flex justify-center w-full ">
                                            <div className='flex flex-col '>
                                                <label htmlFor="status" className='self-start'>Status:</label>
                                                <select name="status" onChange={(e) => setFormData({...formData,status:e.target.value})} value={formData.status} className={`${getStatusColor(formData.status)} mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                                    <option value="working_on_it">Working on it</option>
                                                    <option value="waiting_on_cads">Waiting on cads</option>
                                                    <option value="sample_created">Sample created</option>
                                                    <option value="received_quote">Receieved quote</option>
                                                    <option value="dead">Dead</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
            
                                  <div className=" flex-1 space-y-6">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Title
                                      </label>
                                      <input
                                        required
                                        type="text"
                                        className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Description
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Link
                                      </label>
                                      <input
                                        type="url"
                                        className="mt-1 block input  shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                      />
                                    </div>
                                  
                                    <div className=' mb-10'>
                                        <label htmlFor="board" className=" text-sm font-medium text-gray-700">Board</label>
                                        <CustomSelect  onSelect={handleCustomSelect} version={'collection'} informationFromDataBase={originalData.collection}/>
                                    </div>
            
                                    <div className=' mb-10'>
                                        <label htmlFor="category" className=" text-sm font-medium text-gray-700">Category</label>
                                        <CustomSelect  onSelect={handleCustomSelect} version={'category'} informationFromDataBase={originalData.category} />
                                    </div>
                                  </div>
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
                                  Edit Design
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
}

export default DesignInfoModal;