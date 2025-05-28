import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Upload, X, FileQuestion } from 'lucide-react';
import { parseCSV,handleImportFile } from '../../utils/importUtils';
import { useSupabase } from '../SupaBaseProvider';
import { useMetalPriceStore } from '../../store/MetalPrices';
import { useVendorStore } from '../../store/VendorStore';
import { getTotalCost } from '../Samples/TotalCost';
import { getMetalCost } from '../Samples/CalculatePrice';
// import headers from '../../utils/exportUtils';

const ImportModal = ({ isOpen, onClose,type }) => {
const {supabase} = useSupabase();
const {getVendorByName,getVendorById} = useVendorStore();
  const {prices} = useMetalPriceStore();
const [isDragging, setIsDragging] = useState(false);
const [error, setError] = useState(null);

const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      try {
        const products = await parseCSV(file);
        for (const product of products) {
            // Save product to database
            console.log('Product to be added (in import modal):', product);
        }
        onClose();
        setError('')
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
        console.error('Import error:', err);
      }
    } else {
      setError('Please upload a CSV file.');
    }
  };
  
  const handleFileChange = async (e) => {
    setError('')
    const file = e.target.files?.[0];
    if (file) {
      try {
        const products = await handleImportFile(file,type);
        const formatted = products.map( (row, index) => {
          const vendor = Number.isInteger(row['Vendor'])? getVendorById(row['Vendor']):getVendorByName(row['Vendor'])
        console.log(getVendorByName(row['Vendor']))
          const stones = [];
            for (let i = 1; i <= 10; i++) {
              if (row[`Stone ${i} Type`] || row[`Stone ${i} Color`] || row[`Stone ${i} Size`]) {
                stones.push({
                  id: row[`Stone ${i} ID`],
                  type: row[`Stone ${i} Type`] || '',
                  color: row[`Stone ${i} Color`] || '',
                  size: row[`Stone ${i} Size`] || '',
                  shape: row[`Stone ${i} Shape`] || '',
                  cost: parseFloat(row[`Stone ${i} Cost`] || 0),
                  customType: row[`Stone ${i} Custom Type`] || '',
                  quantity: parseInt(row[`Stone ${i} Quantity`] || 0),
                  notes: row[`Stone ${i} Notes`] || '',
                });
              }
            }
            console.log(stones)
            const starting_info = {
              description: row['Quote Description'] || '',
              images: (row['Sample Images'] || '').split('|') || [row['Sample Images']],
              color: row['Color'] || 'Yellow',
              height: parseFloat(row['Height'] || 0),
              length: parseFloat(row['Length'] || 0),
              width: parseFloat(row['Width'] || 0),
              weight: parseFloat(row['Weight'] || 0),
              manufacturerCode: row['Manufacturer Code'] || '',
              metalType: row['Metal Type'] || 'Gold',
              platingCharge: parseFloat(row['Plating Charge'] || 0),
              stones:stones || [],
              vendor: vendor.id|| null,
              plating: parseFloat(row['Plating']) || 0,
              karat: row['Karat'] || '10K',
              designId: row['ID (Design)'] || null,
              miscCost: parseFloat(row['Misc Cost'] || 0),
              laborCost: parseFloat(row['Labor Cost'] || 0),
              totalCost: parseFloat(row['Total Cost'] ||  getTotalCost(getMetalCost(prices[row['Metal Type'].toLowerCase()].price,row['Weight']||0,row['Karat'],vendor.pricingsetting.lossPercentage),parseFloat(row['Misc Cost'] || 0),parseFloat(row['Labor Cost'] || 0),stones)||0)
            };
          if (type === 'designs') {
            return {
              id: row["ID (Design)"] || null,
              title: row['Title'] || '',
              description: row['Description'] || '',
              link: row['Link'] || '',
              collection: row['Collection'] || '',
              category: row['Category'] || '',
              images: (row['Design Images'] || '').split('|') ||[row['Design Images']] ,
              status: row['Status'] || 'Working_on_it:yellow',
              starting_info:{...starting_info}
            };
          }
          if (type === 'samples') {
            
      
            return {
              id: row['ID (Sample)'] || null,
              cad: (row['CAD Files'] || '').split('|'),
              category: row['Category'] || '',
              collection: row['Collection'] || '',
              selling_pair: row['Selling Pair'] || 'pair',
              back_type: row['Back Type'] || 'none',
              custom_back_type: row['Custom Back Type'] || '',
              back_type_quantity: parseInt(row['Back Type Quantity'] || 0),
              name: row['Name'] || '',
              styleNumber: row['Style Number'] || '',
              salesWeight: parseFloat(row['Sales Weight'] || 0),
              starting_info_id: row['Starting Info ID'] || '',
              status: row['Sample Status'] || 'Working_on_it:yellow',
              starting_info:{...starting_info} ,
              designId:row['Design Id'] || null
            };
          }
          if(type === 'designQuote'){
            return{
              ...starting_info,
              id: row['ID (Design Quote)'] || null,
            }
          }
      
        });
        const uploadedItems = []
        // console.log(formatted,'products to upload')
        for (const item of formatted) {
      
          try {
            const {starting_info, ...formData} = item;
            const {stones, ...restStartingInfo} = starting_info;
           if(type === 'designs'){
             const { data: formData_database } = await supabase
             .from(type)
             .insert([formData])
             .select();
             const { data: starting_info_database } = await supabase
             .from(type)
             .insert([restStartingInfo])
             .select();
             const { data: stones_database } = await supabase
             .from('stones')
             .insert(stones.map(stone => ({ ...stone, starting_info_id: starting_info_database[0].id })))
             .select();
             uploadedItems.push({
              formData: {...formData_database, starting_info:{...starting_info_database, stones: stones_database}},
             })
            }
           if(type === 'samples'){
            const {data:starting_info_id } = await supabase
            .from('samples')
            .select('starting_info_id')
            .eq('id',formData.id)
            .single()
            if(starting_info_id){
              restStartingInfo.id = starting_info_id.starting_info_id
            }
             const { data: starting_info_database } = await supabase
              .from('starting_info')
              .upsert([restStartingInfo], { onConflict: ['id'] })
              .eq('id',restStartingInfo.id)
              .select();
             const { data: formData_database } = await supabase
              .from(type)
              .upsert([{...formData, starting_info_id: starting_info_database[0].id}], { onConflict: ['id'] })
              .select();
             const { data: stones_database } = await supabase
              .from('stones')
              .upsert(stones.map(stone => ({ ...stone, starting_info_id: starting_info_database[0].id })), { onConflict: ['id'] })
              .select();
             uploadedItems.push({
               formData: {...formData_database, starting_info:{...starting_info_database, stones: stones_database}},
              })
            }
            if(type==='designQuote'){
              const { data: starting_info_database } = await supabase
              .from('starting_info')
              .upsert([restStartingInfo], { onConflict: ['id'] })
              .eq('id',restStartingInfo.id)
              .select();
              const { data: stones_database } = await supabase
              .from('stones')
              .upsert(stones.map(stone => ({ ...stone, starting_info_id: starting_info_database[0].id })), { onConflict: ['id'] })
              .select();

            }
              
          } catch (err) {
            console.error(`Upload failed for item at index :`, err);
          }
        }
        
        onClose();
        window.location.reload();
      } catch (err) {
        
        setError('Error parsing file. Please check the format.');
        console.error('Import error:', err);
      }
    }
  };

  const downloadSample = () => {
    const sampleCSV = `No,Item#,ITEMS CODE,PHOTO,STONE DESCRIPTION,GOLD (K),GOLD COLOR,REMARK,Q\`ty,Unit,TOTAL WEIGHT(GR),GOLD WEIGHT(GR),GOLD AMOUNT ($/PC),LABOR ($/PC),STONE ($/PC),U/PRICE(U$),Rhodium Plating Charge,REMARK
1,BJ7317,GPFB108-10KYG,,CZ/3.0 * 1 PC,10K,YG,Thickness: 0.95mm,1,PCS,0.21,0.169,5.86,2.60,0.05,9.51,0,Sample Item
2,BJ7318,GPFB109-14KYG,,CZ/4.0 * 2 PC,14K,YG,Thickness: 1.05mm,1,PCS,0.25,0.198,7.92,3.20,0.10,12.22,0,Sample Item`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Import {`${type[0].toUpperCase()}${type.slice(1)}`}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    Drag and drop your CSV file here, or{' '}
                    <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv, .xlsx"
                        multiple={false}
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                {/* <div className="mt-4">
                  <button
                    type="button"
                    onClick={downloadSample}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <FileQuestion className="w-4 h-4 mr-2" />
                    Download sample CSV file
                  </button>
                </div> */}

                <div className="mt-4 text-xs text-gray-500">
                  <p className="font-medium mb-1">CSV/Excel Format Requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>File must be in CSV or Xlxs format</li>
                    <li>First row must contain column headers (Do Not Modify)</li>
                    <li>Weights should be in grams</li>
                    <li>Prices should be in USD</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImportModal;