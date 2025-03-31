
import React from 'react';

const TotalCostDisplay = ({
    metalCost,
  stoneCost,
  laborCost,
}) => {
    const totalCost = metalCost + stoneCost + laborCost;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Breakdown</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Metal Cost:</span>
          <span className="font-medium">${metalCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Stone Cost:</span>
          <span className="font-medium">${stoneCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Labor Cost:</span>
          <span className="font-medium">${laborCost.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Total Cost:</span>
            <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCostDisplay;