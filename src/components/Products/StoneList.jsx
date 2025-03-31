import React from 'react';
import { X } from 'lucide-react';

const StoneList  = ({ stones, onRemoveStone }) => {
    
    if (stones.length === 0) {
        return (
          <div className="text-sm text-gray-500 italic">
            No stones added yet
          </div>
        );
      }
    
      return (
        <div className="space-y-3">
          {stones.map((stone) => (
            <div
              key={stone.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {stone.quantity} x {stone.size}mm {stone.type.replace('-cz', ' CZ')}
                    </span>
                    <p className="text-sm text-gray-500">
                      {stone.shape} cut
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${stone.cost.toFixed(2)}
                  </span>
                </div>
                {stone.notes && (
                  <p className="mt-1 text-sm text-gray-500">{stone.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveStone(stone)}
                className="ml-4 p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    };
    
    export default StoneList;