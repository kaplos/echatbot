import React from 'react';
import MetalPriceEditor from '../components/MetalPrices/MetalPriceEditor';
// import KitcoWidget from '../components/Calculator/KitcoWidget';

const MetalPrices = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Metal Prices</h1>
      <div className="max-w-2xl space-y-6">
        <MetalPriceEditor />
        {/* <KitcoWidget /> */}
      </div>
    </div>
  );
};

export default MetalPrices;