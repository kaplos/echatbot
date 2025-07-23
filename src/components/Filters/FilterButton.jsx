import {ListFilter}from 'lucide-react'
import { useState, useEffect } from 'react';
export default function FilterButton({ filter, onClick, isActive }) {
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    return(
        <div className="relative">
            <button className="px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={()=>setFilterModalOpen(true)}
                >
                <ListFilter/>
            </button>
            {filterModalOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <span></span>
                </div>
            )}
        </div>
    )
}