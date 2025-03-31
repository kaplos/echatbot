import React from 'react';
import { DollarSign } from 'lucide-react';

const LaborCostForm  = ({
    laborCost,
    onChange,
  }) => {
    const handleSaveLaborCost = (e) => {
        let cost = parseFloat(e.target.value);
        if (isNaN(cost)) {
          cost = 0;
        }
        console.log('cost (laborcostform)', cost);
      }
    return (
       
      <div>
        <label className="block text-sm font-medium text-gray-700">Labor Cost</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={laborCost || ''}
            onChange={handleSaveLaborCost }
            className="block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  };
  
  export default LaborCostForm;