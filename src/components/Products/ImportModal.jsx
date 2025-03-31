import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Upload, X, FileQuestion } from 'lucide-react';
import { parseCSV } from '../../utils/importUtils';

const ImportModal = ({ isOpen, onClose }) => {
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
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
        console.error('Import error:', err);
      }
    } else {
      setError('Please upload a CSV file.');
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const products = await parseCSV(file);
        for (const product of products) {
            console.log('Product to be added (in import modal):', product);
        }
        onClose();
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
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
                    Import Products
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
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={downloadSample}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <FileQuestion className="w-4 h-4 mr-2" />
                    Download sample CSV file
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p className="font-medium mb-1">CSV Format Requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>File must be in CSV format</li>
                    <li>First row must contain column headers</li>
                    <li>Required columns: Item#, ITEMS CODE, STONE DESCRIPTION, GOLD (K)</li>
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