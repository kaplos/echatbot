import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { calculateMetalPrice } from '../../utils/metalCalculator';
import {KARAT_PURITY,SILVER_PURITY} from '../Products/TempKarets'

const prices  = {
  gold: {
    price: 2051.20,
    change: 0.5,
    timestamp: new Date().toLocaleDateString()
  },
  silver: {
    price: 24.15,
    change: 0.3,
    timestamp: new Date().toLocaleDateString()
  }
}


const MetalPropertiesForm  = ({
    value,
    onChange,
  }) => {
    const [localValue, setLocalValue] = useState(() => 
        value || {
          type: 'gold',
          karatType: '10k',
          color: 'YG',
          weightInGrams: 0,
        }
      );
      useEffect(() => {
        if (value && JSON.stringify(value) !== JSON.stringify(localValue)) {
          setLocalValue(value);
        }
      }, [value]);
      const updateValue = (updates) => {
        const newValue = { ...localValue, ...updates };
        
        if (newValue.weightInGrams) {
          let price ;
          
          if (newValue.type === 'gold' && newValue.karatType) {
            price = calculateMetalPrice(
              newValue.weightInGrams,
              'gold',
              newValue.karatType,
              prices.gold.price
            );
          } else if (newValue.type === 'silver' && newValue.silverPurity) {
            price = calculateMetalPrice(
              newValue.weightInGrams,
              'silver',
              newValue.silverPurity,
              prices.silver.price
            );
          }
          
          if (price !== undefined) {
            newValue.currentPrice = price;
            newValue.lastUpdated = new Date().toISOString();
          }
        }
        
        setLocalValue(newValue);
        onChange(newValue);
      };
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Metal Type</label>
            <select
              value={localValue.type}
              onChange={(e) => {
                const type = e.target.value;
                updateValue({
                  type,
                  karatType: type === 'gold' ? '10k' : undefined,
                  silverPurity: type === 'silver' ? '925' : undefined,
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
    
          {localValue.type === 'gold' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Karat</label>
                <select
                  value={localValue.karatType}
                  onChange={(e) => updateValue({ karatType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
                >
                  {Object.entries(KARAT_PURITY).map(([karat, purity]) => (
                    <option key={karat} value={karat}>
                      {karat} ({(purity * 100).toFixed(1)}% pure)
                    </option>
                  ))}
                </select>
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <select
                  value={localValue.color}
                  onChange={(e) => updateValue({ color: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
                >
                  <option value="YG">Yellow Gold</option>
                  <option value="WG">White Gold</option>
                  <option value="RG">Rose Gold</option>
                </select>
              </div>
            </>
          )}
    
          {localValue.type === 'silver' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Silver Purity</label>
              <select
                value={localValue.silverPurity}
                onChange={(e) => updateValue({ silverPurity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
                disabled
              >
                {Object.entries(SILVER_PURITY).map(([purity, value]) => (
                  <option key={purity} value={purity}>
                    {purity} ({(value * 100).toFixed(1)}% pure)
                  </option>
                ))}
              </select>
            </div>
          )}
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Scale className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localValue.weightInGrams || ''}
                onChange={(e) => updateValue({ weightInGrams: parseFloat(e.target.value) || 0 })}
                placeholder="Enter weight"
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-chabot-gold focus:border-chabot-gold"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">grams</span>
              </div>
            </div>
          </div>
    
          {localValue.currentPrice && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Calculated Metal Value:</div>
              <div className="text-xl font-bold text-gray-900">
                ${localValue.currentPrice.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on current {localValue.type} price: ${localValue.type === 'gold' ? prices.gold.price : prices.silver.price}/oz
              </div>
              {localValue.lastUpdated && (
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(localValue.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    
    export default MetalPropertiesForm;