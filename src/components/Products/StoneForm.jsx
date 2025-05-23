import React, { useState } from 'react';

const StoneForm = ({ onSubmit, onCancel }) => {

    const [stone, setStone] = useState({
        type: 'cz',
        color: 'white',
        customType: '',
        shape: 'round',
        size: '',
        quantity: 1,
        cost: 0,
        // notes: '',
      });
      const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(stone);
      };

      const limitInput = (e) =>{
        let value = e.target.value;
        console.log(value)
      if (value.includes('.') && value.split('.')[1].length > 2) {
          // console.log(value.slice(0, value.indexOf('.') + 3))
          setStone({...stone, [e.target.name]: parseFloat(value.slice(0, value.indexOf('.') + 3))})
        }else{
          setStone({...stone, [e.target.name]: parseFloat(value.slice(1))})
        }
      }
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={stone.type}
                onChange={(e) => setStone({ ...stone, type: e.target.value  })}
                className="mt-1 block w-full input rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
              >
                <option value="cz">CZ</option>
                <option value="other">Other</option>
              </select>
              {stone.type === 'other' && (
                  <input
                    type="text"
                    value={stone.customType || ''}
                    onChange={(e) => setStone({ ...stone, customType: e.target.value })}
                    placeholder="Enter stone type"
                    className="mt-2 block w-full input rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
                  />
                )}
            </div>
    
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <select
                value={stone.color}
                onChange={(e) => setStone({ ...stone, color: e.target.value  })}
                className="mt-1 block w-full input rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
              >
                <option value="white">White</option>
                <option value="red">Black</option>
                <option value="orange">Orange</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>    
                <option value="pink">Pink</option>
                <option value="yellow">Yellow</option>
                <option value="purple">Purple</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Size (mm)</label>
              <input
                type="text"
                value={stone.size}
                onChange={(e) => setStone({ ...stone, size: e.target.value })}
                placeholder="e.g. 6"
                className="mt-1 block w-full input rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
              />
            </div>
    
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={stone.quantity  }
                onChange={(e) => setStone({ ...stone, quantity: parseInt(e.target.value)  })}
                className="mt-1 block w-full input rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
              />
            </div>
    
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost (total)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="cost"
                  value={stone.cost || 0}
                  onChange={limitInput}
                  className="block w-full input pl-7 pr-3 py-2 rounded-md border-gray-300 focus:ring-chabot-gold focus:border-chabot-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shape</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div> */}
                <input
                  type="text"
                  value={stone.shape || ''}
                  onChange={(e) => setStone({ ...stone, shape:e.target.value })}
                  className="block w-full  rounded-md border-gray-300 input focus:ring-chabot-gold focus:border-chabot-gold"
                />
              </div>
            </div>
          </div>
    
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={stone.notes}
              onChange={(e) => setStone({ ...stone, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes about the stones"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-chabot-gold focus:border-chabot-gold"
            />
          </div> */}
    
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
            >
              Add Stone
            </button>
          </div>
        </div>
      );
    };
    
    export default StoneForm;