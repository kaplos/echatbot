import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import SampleCard from '../Samples/SampleCard'

const SampleList = ({ samples, onSampleClick }) => {
    const [selectedSamples, setSelectedSamples] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const handleExport = () => {
                const samplesToExport = samples.filter(p => selectedProducts.has(p.id));
                exportToCSV(samplesToExport);
                setSelectedSamples(new Set());
                setIsSelectionMode(false);
    };
    const toggleSampleSelection = (sample) => {
        const newSelection = new Set(selectedSamples);
        if (newSelection.has(sample.id)) {
          newSelection.delete(sample.id);
        } else {
          newSelection.add(sample.id);
        }
        setSelectedSamples(newSelection);
      };
      return (
        <div className='flex flex-col'>
          <div className="flex justify-end mb-4 space-x-3">
            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Samples'}
            </button>
            {isSelectionMode && selectedSamples.size > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedSamples.size})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample) => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  onClick={isSelectionMode ? toggleSampleSelection : onSampleClick}
                  selected={selectedSamples.has(sample.id)}
                  selectable={isSelectionMode}
                />
            ))}
        </div>
    </div>
     );
    
}

export default SampleList