import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import StoneList from './StoneList';
import StoneForm from './StoneForm';

const StonePropertiesForm = ({ stones, onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [price, setPrice] = useState(0)
   
    const handleRemoveStone = (stone) => {
        stones = stones.filter((s) => s.id !== stone.id); 
        onChange(stones);
    }
    const handleAddStone = (newStone) => {
        // const stone = {
        //     id: stones.length + 1,
        //     ...newStone,
        // };
        stones = [...stones, newStone];

        setPrice((price) => price+newStone.cost)
        onChange(stones);
        
        console.log('new stone to be added',' in stonePropertiesForm', stones);
        setIsAdding(false);

    }
    return (
            <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-900">Stones</h4>
                <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-sm text-chabot-gold hover:text-opacity-80 flex items-center"
                >
                <Plus className="w-4 h-4 mr-1" />
                Add Stone
                </button>
            </div>
            {isAdding && (
                <div className="border rounded-lg p-4 bg-gray-50">
                <StoneForm
                    onSubmit={handleAddStone}
                    onCancel={() => setIsAdding(false)}
                />
                </div>
            )}
            <StoneList
                stones={stones}
                onRemoveStone={handleRemoveStone}
            />
          </div>
          );
        };
        
        export default StonePropertiesForm;