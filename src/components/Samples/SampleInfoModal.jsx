import React, { useState, Fragment,useEffect,useRef,useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ImageUpload from '../ImageUpload';
import { useSupabase } from '../SupaBaseProvider';
import { ChevronDown, X,Upload } from 'lucide-react';
import { getStatusColor } from '../../utils/designUtils';
import CustomSelect from '../CustomSelect';
import { metalTypes ,getMetalType} from '../../utils/MetalTypeUtil';
import StonePropertiesForm from '../Products/StonePropertiesForm';
import CalculatePrice from './CalculatePrice';
import TotalCost from './TotalCost';
// import {limitInput} from '../../utils/inputUtils.js'

const SampleInfoModal = ({ isOpen, onClose, sample,updateSample }) => {
    console.log(sample,'sample from design info modal')
    const supabase = useSupabase();
    
    const [lossPercent,setLossPercent] = useState(0)
    const [originalData, setOriginalData] = useState(
        // {
        //         styleNumber:'',
        //         manufacturerCode:'',
        //         name: '',
        //         description: '',
        //         collection: '',
        //         category: '',
        //         karat: '10K',
        //         metalType: 'Gold',
        //         color: 'Yellow',
        //         vendor: 1,
        //         platingCharge: 0.00,
        //         stones: null,
        //         cost: 0.00,
        //         laborCost:0,
        //         miscCost: 0,
        //         length: 0,
        //         width: 0,
        //         height: 0,
        //         weight: 0,
        //         salesWeight: 0,
        //         notes: '',
        //         images: sample.images,
        //         cad: sample.cad,
        //         status: 'working_on_it',
        // }
          {
            ...sample,
              images: sample.images ? sample.images : [],
              cad:  sample.cad ? sample.cad:[],
          }
        );
        const [formData, setFormData] = useState(
          {
            ...sample,
            images: sample.images ? sample.images : [],
            cad: sample.cad ? sample.cad : [],
          }
        );
        const [metalCost,setMetalCost] = useState()
        const [vendors, setVendors] = useState([]);
        const vendorLossRef = useRef(null);

        useEffect(() => {
            if (!sample) return; // Ensure sample is defined
            console.log(sample.images,'sample images from useeffect')
            setOriginalData({
                ...sample,
                  images: sample.images ? sample.images : [],
                  cad:  sample.cad ? sample.cad:[],
            });
        
            setFormData({
                ...sample,
                images: sample.images ? sample.images : [],
                cad: sample.cad ? sample.cad : [],
            });
            // setCosts([ 
            //   {name:"Metal Value:",value: formData.cost},
            //   {name:'Misc Charge:',value: formData.miscCost },
            //   {name:'Labor Charge:',value: formData.laborCost },
            //   {name:"stone(s) Charge:",value: 0}
            // ])

            console.log(formData,'formdata from use effect upon click ')
        }, [sample,isOpen]);

        useEffect(()=>{
            const  fetchVendors = async() =>{
            const {data,error} = await supabase
            .from('vendors')
            .select('*')

            if(error){
                console.log(e)
            }
            console.log('data of vendors',data)
            setVendors(data)
            setLossPercent(data[0].pricingsetting.lossPercentage)
            // vendorLossRef.current.textContent = data[0].pricingsetting.lossPercentage

            }

            fetchVendors()
        },[isOpen])
       

          const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
          };
          const handleCustomSelect = (option) => {
          // console.log(option,'from handle select in edit')
            const {categories,value} = option
            setFormData({...formData, [categories]:value})
            // console.log(formData,'formdata')
          }
          const limitInput = (e) =>{
            let value = e.target.value;
            
          if (value.includes('.') && value.split('.')[1].length > 2) {
              console.log(value.slice(0, value.indexOf('.') + 3))
              setFormData({...formData, [e.target.name]: parseFloat(value.slice(0, value.indexOf('.') + 3))})
            }else{
              setFormData({...formData, [e.target.name]: parseFloat(value)})
            }
          }
          

          const getRemovedImages = (originalImages, currentImages) => {
            return originalImages.filter(image => !currentImages.includes(image));
          };
          const getObjectDifferences = (formData, originalData) => {
            const changes = {};
            
            Object.keys(formData).forEach(key => {
                if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) { // updated to use originalData
                    changes[key] =  formData[key]
                    };
                
            });
        
            return changes;
        };
          const areObjectsEqual = (obj1, obj2) => {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
          };
        
          const handleSubmit = async (e) => {
            e.preventDefault();
            if (areObjectsEqual(formData, originalData)) {
              console.log('No changes detected');
              onClose();
              return;
            }
            console.log('Changes detected');
            const updates = getObjectDifferences(formData, originalData);
            console.log('updates:', updates);
            // Proceed with the update logic'


            const removedImages = getRemovedImages(originalData.images, formData.images);

            const { data, error } = await supabase
                .from('samples')
                .update(updates)
                .eq('id', sample.id)
                .select();

                if (error) {
                    console.error('Error updating sample:', error);
                } else {
                    console.log('sample updated:', data);
                    updateSample({ ...formData});
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
                            Edit Sample
                          </Dialog.Title>
                          <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
        
                        <form onSubmit={handleSubmit} className="p-6">
                          
                          <div className="flex flex-row">
                            <div className=" pr-6 ">
                                <div className="flex justify-between items-start flex flex-col min-h-[70vh] overflow-y-auto">
                                    {/* this is the image upload  */}
                                    <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Images
                              </label>
                              <ImageUpload
                                // images={formData.images || []}
                                images={formData.images || []}
                                onChange={async (images) =>{
                                  setFormData({ ...formData, images:images })
                                  // await updateDataBaseWithImages(images, sample.id)
                                }} 
                              />
                              <ImageUpload
                                images={formData.cad || []}
                                onChange={(cad) => setFormData({ ...formData, cad: cad })}
                              />
                            </div>
                                    {/* this is the status function */}
                                    
                                </div>
                            </div>
        
                              <div className=" flex-1 space-y-6">
                                <div className="flex flex-row gap-2 w-full">
                                  
                                  <div className='w-full '>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Style Number
                                      </label>
                                      <input
                                        required
                                        type="text"
                                        className="mt-1 block input shadow-sm "
                                        value={formData.styleNumber}
                                        onChange={(e) => setFormData({ ...formData, styleNumber: e.target.value })}
                                      />
                                    </div>

                                    <div className='w-full '>
                                      <label className="block text-sm font-medium text-gray-700">
                                      Manufacturer Code
                                      </label>
                                      <input
                                        required
                                        type="text"
                                        className="mt-1 block input shadow-sm  "
                                        value={formData.manufacturerCode}
                                        onChange={(e) => setFormData({ ...formData, manufacturerCode: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-row gap-2 w-full">
                                    <div className='w-full'>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Product Name
                                      </label>
                                      <input
                                        required
                                        type="text"
                                        className="mt-1 block input shadow-sm  flex-1" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      />
                                    </div>
                                    <div className='w-full'>
                                      <label className="block  text-sm font-medium text-gray-700">
                                        Vendor
                                      </label>
                                        <div className="relative w-full">
                                          <select 
                                            name="vendor"  
                                            onChange={(e) => {
                                              setFormData({...formData,vendor:e.target.value})
                                              const vendor = vendors.filter(vendor=> vendor.id === Number(e.target.value))
                                              console.log(vendor[0].pricingsetting.lossPercentage,'filtered vendor',e.target.value)
                                              vendorLossRef.current.textContent= vendor[0].pricingsetting.lossPercentage
                                              setLossPercent(vendor[0].pricingsetting.lossPercentage)
                                              }} 
                                              value={formData.vendor} 
                                              className={` mt-1 border input  p-2 appearance-none `} 
                                          >
                                            
                                            {vendors.map((vendor,index)=>{
                                              return(
                                                <option key={index} value={vendor.id}>{vendor.name}</option>
                                              )
                                            })}
                                          </select>
                                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Description
                                    </label>
                                    <textarea
                                      rows={2}
                                      className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                  </div>

                                  {/* this is metal properties div */}
                                  <div>
                                    
                                    <label htmlFor=""> Metal Propeties</label>
                                    <br className='border-2 border-gray-300 w-full'/>
                                    
                                    <div className='flex flex-col'>
                                          <label htmlFor=""> Metal Type</label>
                                          <select name="metalType" id="" onChange={(e) => setFormData({...formData,metalType:e.target.value})} value={formData.metalType} className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                            {metalTypes.map((metalType,index)=>{
                                              return(
                                                <option key={index} value={metalType.type}>{metalType.type}</option>
                                              )
                                            })}
                                          </select>
                                    </div>
                                    <div className='flex flex-col'> 
                                          <label htmlFor=""> Karat</label>
                                          <select name="karat" id="" onChange={(e) => setFormData({...formData,karat:e.target.value})} value={formData.karat} className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                            {getMetalType(formData.metalType).karat.map((karat,index)=>{
                                              return(
                                                <option key={index} value={karat}>{karat}</option>
                                              )
                                            }
                                            )}
                                          </select>
                                    </div>
                                    <div className='flex flex-col'> 
                                          <label htmlFor=""> Color</label>
                                          <select name="color" id="" onChange={(e) => setFormData({...formData, color:e.target.value})} value={formData.color} className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                            {getMetalType(formData.metalType).color.map((color,index)=>{
                                              return(
                                                <option key={index} value={color}>{color}</option>
                                              )
                                            }
                                            )}
                                          </select>
                                    </div>

                                    </div>
                                    {/*this is weight sectiion  */}
                                    
                                    <div className='w-full'>
                                      <label htmlFor="">Weight</label>
                                      <div className='flex items-center gap-1 '>
                                        <span className='w-full relative'>
                                          <input type="text"
                                            placeholder='Enter Weight'
                                            className='mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full '
                                            value={formData.weight}
                                            onChange={(e)=> setFormData({...formData,weight: e.target.value})}
                                          />
                                        </span>
                                        <span className='absolute right-10 text-gray-500 pointer-events-none'>grams</span>
                                      </div>
                                    </div>

                                    <div className='w-full'>
                                      <CalculatePrice type={formData.metalType} weight={formData.weight} karat={formData.karat} lossPercent={lossPercent}  onMetalCostChange={setMetalCost} />
                                    </div>

                                  
                                    {/* this is loss section */}
                                    <div className='flex flex-row w-full flex-1 justify-between'>
                                        <div className='w-md'>
                                          <label htmlFor="loss">Loss Percent</label>
                                          <div className="flex items-center gap-1 flex-1">
                                            <span
                                              ref={vendorLossRef}
                                              className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                              {lossPercent}
                                            </span>
                                            <span>%</span>
                                          </div>
                                        </div>


                                        {/* this is the separation between loss and plating input fields */}
                                        <div className='flex flex-row gap-2 justify-center'>
                                          <div className='flex flex-col justify-center flex-1'>
                                            <label htmlFor="plating">Plating</label>
                                            <CustomSelect onSelect={handleCustomSelect} version={"plating"} informationFromDataBase={formData.plating}/>
                                          </div>
                                          <div className='flex-1'>
                                            <label htmlFor="plating_charge">Plating Charge</label>
                                            <input type="number" value={formData.platingCharge} name="platingCharge" onChange={limitInput} className='mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1' />
                                          </div>
                                        </div>

                                    </div>
                                    
                                    {/* this is the stone properties */}
                                    <div>
                                      <StonePropertiesForm 
                                      stones={formData.stones || [] }
                                      onChange={(stones) => {
                                        setFormData({...formData,stones})
                                      }}
                                      />
                                    </div>

                                    <div className='flex flex-row gap-2'>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Labor Cost</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                          </div>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          name="laborCost"
                                          value={formData.laborCost || 0}
                                          onChange={limitInput}
                                          className="w-full input pl-7 pr-3 py-2"
                                        />
                                            </div>
                                          </div>
                                      <div>
                                          <label className="block text-sm font-medium text-gray-700">Misc Cost</label>
                                          <div className="mt-1 relative rounded-md shadow-sm">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                      </div>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="miscCost"
                                        value={formData.miscCost || 0}
                                        onChange={limitInput}
                                        className="w-full input pl-7 pr-3 py-2"
                                      />
                                        </div>
                                      </div>
                                    </div>
                                

                                <div>
                                  <label htmlFor="dims">Dimensions</label>
                                  <div className='flex flex-row gap-2 '>
                                    <div className=' relative rounded-md shadow-sm w-full'>
                                      <label htmlFor="length">Length</label>
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">mm</span>
                                      </div>
                                      <input type="number" className='mt-1  input pr-7 pl-3 py-2'  value={formData.length} onChange={(e)=>{setFormData({...formData, length:e.target.value})}} />
                                    </div>
                                    <div className=' relative rounded-md shadow-sm w-full'>
                                      <label htmlFor="width">Width</label>
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">mm</span>
                                      </div>
                                      <input type="number" className='mt-1  input pr-7 pl-3 py-2' value={formData.width} onChange={(e)=>{setFormData({...formData, width:e.target.value})}} />
                                    </div>
                                    <div className=' relative rounded-md shadow-sm w-full'>
                                      <label htmlFor="height">Height</label>
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">mm</span>
                                      </div>
                                      <input type="number" className='mt-1  input pr-7 pl-3 py-2' value={formData.height} onChange={(e)=>{setFormData({...formData, height:e.target.value})}} />
                                    </div>
                                  </div>
                                </div>
                                
                                  
                                  <div className='flex flex-col w-full'>
                                    <label htmlFor="notes">Notes</label>
                                  <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Optional notes"
                                    className="mt-1 input w-full "
                                  />
                                  </div>
                                      <TotalCost 
                                        metalCost={metalCost} 
                                        miscCost={formData.miscCost}
                                        laborCost={formData.laborCost}
                                        stones={formData.stones}
                                        updateTotalCost={(cost)=> setFormData({...formData,totalCost:cost})}
                                      />
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
                              Update Sample
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

export default SampleInfoModal;