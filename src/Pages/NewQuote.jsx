import { useSupabase } from '../components/SupaBaseProvider';
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CustomSelectWithSelections from '../components/CustomSelectWithSelections';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../components/Messages/MessageContext';
import useFormUpdater from '../Hooks/UseFormUpdater';
import { getMetalCost } from '../components/Samples/CalculatePrice';
import { useMetalPriceStore } from '../store/MetalPrices';
import { getTotalCost } from '../components/Samples/TotalCost';
import { useLocation } from 'react-router-dom';
import EditableCellWithGenerics from '../components/Qoutes/EditableCellWithGenerics';
import { useVendorStore } from '../store/VendorStore';
export default function NewQuote() {
  const navigate = useNavigate();
  const location = useLocation();

  const { prices } = useMetalPriceStore();
  const {supabase,session} = useSupabase();
  
  const { showMessage } = useMessage();
  const [productInfo, setProductInfo] = useState([]);
  const [lineItems, setlineItems] = useState([]);
  const [lineItemsToDelete, setlineItemsToDelete] = useState([]);
  // const {formData: lineItems, updateFormField: updateLineItem, resetForm: resetLineItems} =  useFormUpdater([]
  //   {
  //     productId:" ",
  //     retailPrice: 0,
  //     internalNote: '',
  //     margin: 0,
  //     totalCost: 0,
  //     salesPrice: 0
  // }
// );
  const quote = new URLSearchParams(location.search).get('quote') || null
  const userId = session?.user?.id; // User ID

  const { formData, updateFormField, resetForm } = useFormUpdater({
    agent: '',
    buyer: '',
    tags: '',
    status: "Created",
    agent: userId,
    gold: parseFloat(prices.gold.price),
    silver: parseFloat(prices.silver.price),
    quoteTotal: 0
  });
  const {getVendorById,vendors}= useVendorStore()

  const [isLoading,setIsLoading] = useState(false)
  const [editingCell, setEditingCell] = useState(null);

  const [isOpen, setIsOpen] = useState(false);

   useEffect(() => {   
                      
        if(quote){
            console.log(quote,'quote from params')
            const fetchQuote = async () => {
                setIsLoading(true);
                
                const { data, error } = await supabase
                  .from('quotes')
                  .select(`
                    *,
                    lineItems (
                      *,
                      product:productId ( 
                       *,
                       startingInfo: starting_info_id ( * )
                      )
                    )
                  `)
                  .eq('quoteNumber', quote)
                  .single();
                  const processedLineItems = data.lineItems.map((item) => {
                    const { startingInfo, ...productData } = item.product; // Extract startingInfo and product data
                    const { id,...startingInfoData } = startingInfo; // Extract id and other properties from startingInfo
                    return {
                        ...productData, // Spread the product data into the top-level object
                        ...startingInfoData, // Spread the startingInfo data into the top-level object
                    };
                });                // delete data.lineItems
                  console.log(processedLineItems)
                  setlineItems(data.lineItems)
                  setProductInfo(processedLineItems)
                console.log(data)

                if (error) {
                console.error('Error fetching samples:', error);
                return;
                }
                resetForm(data);
                // setProductInfo(data)
                // console.log(data);
                setIsLoading(false);

            };
                fetchQuote();
        }else{
            console.log('not displaying a quote')
        }
    }
    ,[quote]) 
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showMessage('Please add items to the quote', 'error');
      return;
    }
    // const submitData = formData.items.map(({ product, ...rest }) => rest);
    const quoteTotal = lineItems.reduce((acc, item) => acc + item.totalCost, 0);
    const {lineItems: dontUse,...rest} = formData
    const submitForm = {
      ...rest,
      updated_at: new Date().toISOString(),
      quoteTotal: quoteTotal,
    };
    if(quote){
      await updateIfChanged(submitForm)
      await updateIfLineItemsChanged()
      await handleLineItemsToDelete()
      showMessage('Quote Updated', 'success');
      navigate('/quotes')
      return
    }
    const { data, error } = await supabase
      .from('quotes')
      .insert([submitForm])
      .select();
    if (error) {
      console.error(error);
    }
    showMessage('Quote Created', 'success');
    const {error:lineItemError} = 
    await supabase
      .from('lineItems')
      .insert(
      lineItems.map(item => ({
        ...item,
        quoteNumber: data[0].quoteNumber,
      })))
    if(lineItemError){
      console.error(lineItemError)
    }
    resetForm({
      agent: '',
      buyer: '',
      tags: '',
      status: "Created",
      gold: parseFloat(prices.gold.price),
      silver: parseFloat(prices.silver.price),
      items: []
    });
    navigate('/quotes');
  };
  const updateIfChanged = async (submitForm) => {
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

    const changedFields = Object.keys(submitForm).reduce((acc, key) => {
      if (submitForm[key] !== currentData[key]) { // Updated reference to formData
        acc[key] = submitForm[key]; // Only keep changed fields
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
  // const handleChange=(id,field,value)=>{
  //   console.log(id,field,value)
  //   updateLineItem(id,field,value)
  // }
  const updateIfLineItemsChanged = async () => {
      let newLineItems = lineItems.filter(lineItem => !lineItem.id )
      console.log(newLineItems,'new line items')

      const {  error } = await supabase
        .from('lineItems')
        .insert(newLineItems.map(item => ({
              ...item,
              quoteNumber: quote,
            })))

        if(error){
          console.error(error)
        }

  }
  const handleLineItemsToDelete = async () => {
    if(lineItemsToDelete.length > 0){
      const { error } = await supabase
      .from('lineItems')
      .delete()
      .in('id', lineItemsToDelete);

      if (error) {
        console.error('Error deleting line items:', error);
      }

    }
  }

    const handleLineChange = (productId, field, value) => {
      setlineItems((prevItems) =>
        prevItems.map((item) => {
          if (item.productId !== productId) return item;
    
          const updatedItem = { ...item, [field]: value };
    
          // If margin was updated, calculate new salesPrice
          if (field === 'margin') {
            const weight = productInfo.find(item => item.productId === productId)?.weight || 0;
            const totalCost = parseFloat(item.totalCost) || 0;
            const margin = parseInt(value) || 0;
    
            updatedItem.salesPrice = parseFloat((totalCost + weight * margin).toFixed(2));
          }
          // If salesPrice was updated, optionally recalc margin? (Only if needed)
          return updatedItem;
        })
      );
    };
  const handleCustomSelect = (items) => {
    setProductInfo(prev=> [...prev,...items]);
    
    const itemData = items.map((item) => 
      

      
      ({
        productId: item.id,
        retailPrice: 0,
        internalNote: '',
        margin: 0,
        totalCost: parseFloat(totalCost(item, getVendorById( item.vendor).pricingsetting?.lossPercentage).toFixed(2)),
        salesPrice: totalCost(item, getVendorById( item.vendor).pricingsetting?.lossPercentage)
      })
      
    
  )
    setlineItems((prev) => [...prev, ...itemData]);
    // const quoteTotal = submitData.reduce((acc, item) => acc + item.totalCost, 0);

    // resetLineItems([...lineItems,...itemData]);
    // updateFormField('items', [...formData.items, ...itemData]);
  };
  const deleteLineItem = (event,product) => {
    console.log(product?.id?? "no id")
    event.preventDefault()
    product?.id ?
      setlineItemsToDelete((prevItems) => [...prevItems, product?.id])
    : ""
    setlineItems((prevItems) => prevItems.filter(item => item.productId !== product.productId));
  }
  const totalCost = (product, lossPercentage) => {
    const metalPrice = product.metalType === 'Gold' ? formData.gold : formData.silver;
    if (!metalPrice) {
      console.error('Metal price is missing!');
      return 0;
    }

    const metalCost = getMetalCost(metalPrice, product.weight, product.karat, lossPercentage);
    return getTotalCost(metalCost, product.miscCost, product.laborCost, product.stones);
  };
  console.log(productInfo,lineItems,'line items')


  return (
    <div className="flex flex-col min-h-[80vh]">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-row">
          <h1 className="text-2xl font-bold text-gray-900">{quote ? 'Update Quote' : 'Create Quote'}</h1>
          <div className="flex space-x-3 justify-self-end flex-col w-48 ml-auto">
            <button
              className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Items
            </button>
            <CustomSelectWithSelections
              version="samples"
              selected={lineItems}
              close={() => setIsOpen(false)}
              onSelect={handleCustomSelect}
              isOpen={isOpen}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between items-center mb-6 flex-1 h-full">
          <div className="flex flex-row gap-2">
            <span className="self-center">Metal Prices At:</span>
            <div className="flex flex-col mb-1">
              <label htmlFor="gold_price">Gold Price</label>
              <input
                type="number"
                className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                name="gold"
                id="gold_price"
                placeholder="2300"
                value={formData.gold}
                onChange={(e) => updateFormField('gold', e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-1">
              <label htmlFor="silver_price">Silver Price</label>
              <input
                type="number"
                className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                name="silver"
                id="silver_price"
                placeholder="32"
                value={formData.silver}
                onChange={(e) => updateFormField('silver', e.target.value)}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col flex-1 h-full">
            <div className="flex flex-1 h-full">
              <div className="overflow-auto h-full border border-gray-300 flex-1">
                <table className="w-full min-h-full border-collapse border border-gray-300 flex-1 table-fixed">
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2 w-20">Item</th>
                      <th className="border border-gray-300 p-2 w-20">Image</th>
                      <th className="border border-gray-300 p-2 w-20">Description</th>
                      <th className="border border-gray-300 p-2 w-20">Sales Weight</th>
                      <th className="border border-gray-300 p-2 w-20">Total Cost</th>
                      <th className="border border-gray-300 p-2 w-20">Margins</th>
                      <th className="border border-gray-300 p-2 w-20">Sales Price</th>
                      <th className="border border-gray-300 p-2 w-20">Retail Price</th>
                      <th className="border border-gray-300 p-2 w-20">Internal Note</th>
                      <th className="border border-gray-300 p-2 w-20">Buyer Comment</th>
                      <th className="border border-gray-300 p-2 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems && lineItems.map((product, index) => 
                    {

                      let productInfoObject = productInfo.find((item) => item.id === product.productId)  
                      console.log(productInfo,productInfoObject.styleNumber,'product info object')
                    return (
                        
                      <tr key={index}>
                        <td className="border border-gray-300 p-2 text-center">{productInfoObject.styleNumber}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <img src={productInfoObject.images[0]} alt={productInfoObject.styleNumber} />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{productInfoObject.description}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex flex-row items-center justify-center gap-2">
                            <div className="flex flex-col">
                              <span>{productInfoObject.weight}g</span> <span>w</span>
                            </div>
                            <div className="flex flex-col">
                              <span>{productInfoObject.salesWeight}g</span> <span>sw</span>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">${product.totalCost}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            value={product.margin || 0}
                            onChange={(e) => {
                              handleLineChange(product.productId, 'margin', parseInt(e.target.value))
                              // handleLineChange(product.productId, 'salesPrice', parseFloat((product.totalCost + (productInfoObject.weight * parseInt(e.target.value))).toFixed(2)))

                                // updateLineItem(product.productId, 'margin', e.target.value)
                                // updateLineItem(product.productId, 'salesPrice', parseFloat((product.totalCost + (productInfoObject.weight * parseInt(e.target.value))).toFixed(2)))

                            }}

                            className="input w-full text-center border-none outline-none"
                          />
                          <span className="ml-1">%</span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">${parseFloat((product.totalCost + (productInfoObject.weight * product.margin)).toFixed(2))}</td>
                        {/* <td className="border border-gray-300 p-2 text-center">{product.retailPrice}</td> */}
                        {/* <td className="border border-gray-300 p-2 text-center">{productInfoObject.styleNumber}</td> */}
                        <EditableCellWithGenerics 
                            handleChange={handleLineChange} 
                            setEditingCell={setEditingCell}
                            editingCell={editingCell}
                            id={productInfoObject.id}
                            cellType={'retailPrice'}
                            data={product.retailPrice} // Placeholder for actual data
                        />
                        <EditableCellWithGenerics 
                            handleChange={handleLineChange} 
                            setEditingCell={setEditingCell}
                            editingCell={editingCell}
                            id={productInfoObject.id}
                            cellType={'internalNote'}
                            data={product.internalNote} // Placeholder for actual data
                        />
                        <td className="border border-gray-300 p-2 text-center">{product.BuyerComment}</td>
                          <button  onClick={(event)=> deleteLineItem(event,product)} className="border border-gray-300 p-2 text-center">
                            Delete
                          </button>
                      </tr>
                    )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-row w-full justify-between self-end">
              <div className="flex flex-row mb-1 gap-2">
                <div className="flex flex-col mb-1">
                  <label htmlFor="reference">Reference</label>
                  <input
                    type="text"
                    className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                    name="reference"
                    id="reference"
                    placeholder="Customer Ref / Labels"
                    value={formData.tags}
                    onChange={(e) => updateFormField('tags', e.target.value)}
                  />
                </div>
                <div className="flex flex-col mb-1">
                  <label htmlFor="buyer">Prepared For</label>
                  <input
                    type="text"
                    className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                    name="buyer"
                    id="buyer"
                    placeholder="Prepared By"
                    value={formData.buyer}
                    onChange={(e) => updateFormField('buyer', e.target.value)}
                  />
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
                 {quote? 'Update Quote' : 'Create Quote'} 
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
