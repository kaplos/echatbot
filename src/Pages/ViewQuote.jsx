import { useSupabase } from '../components/SupaBaseProvider';
import React, { Fragment, useState,useEffect,useRef } from 'react';
import { ChevronDown, X,Upload } from 'lucide-react';
import { Dialog,  Transition } from '@headlessui/react';
import CustomSelect from '../components/CustomSelect';
import { Plus } from 'lucide-react';
import CustomSelectWithSelections from '../components/CustomSelectWithSelections';
import EditableCell from '../components/Qoutes/EditableCell';
import EditableCellWithGenerics from '../components/Qoutes/EditableCellWithGenerics';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useMessage } from '../components/Messages/MessageContext'


export default function newQuote(){
            const navigate = useNavigate()
            const supabase = useSupabase();
            const location = useLocation();
            const {showMessage} = useMessage()
            const quote = new URLSearchParams(location.search).get('quote') || null
            const [formData, setFormData] = useState(
                    { agent:'',buyer:'' ,tags:'',status:'',gold:2300,silver:32,items:[]})
                const [isOpen,setIsOpen] = useState(false)
                const [isLoading,setIsLoading] = useState(false)
                const [selectedProducts,setSelectedProducts] = useState([])
                const [editingCell, setEditingCell] = useState(null);
                




                useEffect(() => {   
                    
                    if(quote){
                        console.log(quote,'quote from params')
                        const fetchQuote = async () => {
                            setIsLoading(true);
                            const { data, error } = await supabase.from('quotes')
                            .select('*')
                            .eq('quoteNumber', quote)
                            .single();
                            
                            if (error) {
                              console.error('Error fetching samples:', error);
                              return;
                            }
                            setFormData(data);
                            // console.log(data);
                            setIsLoading(false);

                          };
                           fetchQuote();
                    }else{
                        console.log('not displaying a quote')
                    }
                }
                ,[quote])  

            const handleSubmit = async (e) =>{
                e.preventDefault()
                if(formData.items.length === 0){
                    showMessage('Please add items to the quote','error')
                    return
                }
                if(quote){
                    updateIfChanged()
                }
                // onSave(formData);
                const { data, error } = await supabase
                .from('quotes')
                .insert([formData])
                // .select();

                if(error) {
                    console.log(error);
                }
                setFormData({ agent:'',buyer:'' ,tags:'',status:'',gold:2300,silver:32,items:[]})
                navigate('/quotes')
            }

            const handleChange = (rowIndex, field, value) => {
                console.log(rowIndex, field, value, 'rowIndex, field, value')
                const updatedData = [...formData.items];
                updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
                console.log(updatedData,'updatedData')
                setFormData({...formData, items: updatedData});
            };
            const handleCustomSelect = (items)=>{
               const itemData =  items.map((item)=> ({id:item.id,name:item.name,styleNumber:item.styleNumber,images:item.images,description:item.description,salesWeight:item.salesWeight,internalNote:''}))
                console.log(itemData,'itemData')
              setFormData({...formData, items:[...formData.items,...itemData]})
            }
            const updateIfChanged = async () => {
                const { data: currentData, error: fetchError } = await supabase
                  .from('quotes')
                  .select('*')
                  .eq('quoteNumber', quote)
                  .single();
              
                if (fetchError) {
                  console.error('Error fetching current data:', fetchError);
                  return;
                }
              
                // Find only the changed fields
                const changedFields = Object.keys(formData).reduce((acc, key) => {
                  if (formData[key] !== currentData[key]) { // Updated reference to formData
                    acc[key] = formData[key]; // Only keep changed fields
                  }
                  return acc;
                }, {});
              
                if (Object.keys(changedFields).length === 0) {
                  console.log('No changes detected, skipping update.');
                  return;
                }
              
                // Update only if something changed
                const { data, error } = await supabase
                  .from('quotes')
                  .update(changedFields)
                  .eq('quoteNumber', quote)
                  .select();
              
                if (error) {
                  console.error('Error updating:', error);
                } else {
                  console.log('Updated row:', data);
                }
              };
              
            useEffect(()=>{

            },[])


            
            return (
                <div className="flex flex-col min-h-[80vh]">

                    <div className="p-6   flex-1 flex flex-col">
                        <div className="flex flex-row">
                            <h1 className="text-2xl font-bold text-gray-900">View Quote</h1>
                            <div className="flex space-x-3 justify-self-end flex-col w-48 ml-auto">
                            <button
                                className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
                                onClick={() => setIsOpen(true)}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Items
                            </button>
                            <CustomSelectWithSelections version={'samples'} selected={formData.items} close={()=> setIsOpen(false)} onSelect={handleCustomSelect} isOpen={isOpen} />
                            </div>
                        </div>
                        <div className="flex flex-col justify-between  items-center mb-6 flex-1 h-full">
                        <div className="flex flex-row gap-2 " >
                            <span className='self-center'>Metal Prices At:</span>
                            <div className="flex flex-col mb-1">
                                <label htmlFor="gold_price">Gold Price</label>
                                <input type="number" className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1" name="gold" id="gold_price" placeholder='2300' value={formData.gold} onChange={(e) => setFormData({...formData, gold: e.target.value})}/>
                            </div>
                            <div className="flex flex-col mb-1">
                                <label htmlFor="silver_price">Silver Price</label>
                                <input type="number" className=' block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1' name="silver" id="silver_price" placeholder='32' value={formData.silver} onChange={(e) => setFormData({...formData, silver: e.target.value})}/>
                            </div>
                        </div>
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col  flex-1 h-full">
                                <div className="flex flex-1 h-full ">
                                    <div className="overflow-auto h-full border border-gray-300 flex-1">
                                        <table className="w-full min-h-full border-collapse border border-gray-300 flex-1 table-fixed ">
                                            <thead className="bg-gray-200 sticky top-0 z-10">
                                                <tr className="bg-gray-200">
                                                    <th className="border border-gray-300 p-2 w-20">Item</th>
                                                    <th className="border border-gray-300 p-2 w-20">Image</th>
                                                    <th className="border border-gray-300 p-2 w-20">Description</th>
                                                    <th className="border border-gray-300 p-2 w-20">Sales Weight</th>
                                                    <th className="border border-gray-300 p-2 w-20">Price</th>
                                                    <th className="border border-gray-300 p-2 w-20">Buyer Remark</th>
                                                    <th className="border border-gray-300 p-2 w-20">Internal Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.items.map((product,index)=>{
                                                    console.log(product,'product')
                                                        return(

                                                        <tr key={index}>
                                                            <td className="border border-gray-300 p-2 text-center">
                                                                <span className="flex flex-col">
                                                                    {product.styleNumber}
                                                                </span>
                                                            </td>
                                                            <td className="border border-gray-300 p-2 text-center"><img src={product.images[0]} alt={product.styleNumber} /></td>
                                                            <td className="border border-gray-300 p-2 text-center">{product.description}</td>
                                                            <td className="border border-gray-300 p-2 text-center">{product.salesWeight}</td>
                                                            <td className="border border-gray-300 p-2 text-center">{product.price}</td>
                                                            <td className="border border-gray-300 p-2 text-center"></td>
                                                                <EditableCellWithGenerics 
                                                                    handleChange={handleChange} 
                                                                    setEditingCell={setEditingCell}
                                                                    editingCell={editingCell}
                                                                    row={index}
                                                                    cellType={'internalNote'}
                                                                    data={product.internalNote} // Placeholder for actual data
                                                                />
                                                        </tr>
                                                    )
                                                    
                                                })
                                                }
                                                
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className='flex flex-row w-full justify-between self-end ' >
                                    <div className="flex flex-row mb-1 gap-2 ">
                                        <div className="flex flex-col mb-1">
                                             <label htmlFor="">Reference</label>
                                            <input type="text" className=' block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1' name="reference" id="" placeholder='Customer Ref / Labels' value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})}/>
                                        </div>
                                        <div className="flex flex-col mb-1">
                                                <label htmlFor="">Prepared For</label>
                                                <input type="text" className=' block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1' name="buyer" id="" placeholder='Prepared By' value={formData.buyer} onChange={(e) => setFormData({...formData, buyer: e.target.value})}/>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-self-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                                            onClick={() => navigate('/quotes')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
                                        >
                                           {quote? 'Update Quote': 'Add Quote'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            );
            
}