import { useState,useEffect } from "react";

export default function TotalCost({ metalCost, miscCost, laborCost, stones,updateTotalCost }) {
    // Calculate stone cost dynamically
    const stoneCost = stones.reduce((sum, stone) => 
        sum + (Number(stone.cost) * Number(stone.quantity) || 0), 0
    );
        const totalCost = (metalCost + (miscCost || 0) + (laborCost || 0) + stoneCost).toFixed(2);
    
    useEffect(()=>{
        if(updateTotalCost){
            updateTotalCost(totalCost)
        }
    },[totalCost])

    // Calculate total cost dynamically


    return (
        <div className="flex flex-col bg-gray-100 rounded-md p-2">
            <span>Metal Value: ${metalCost}</span>
            <span>Misc Charge: ${miscCost || 0}</span>
            <span>Labor Charge: ${laborCost || 0}</span>
            <span>Stone(s) Charge: ${stoneCost}</span>
            <hr className="border-t-1 border-gray-400 my-4"/>
            <strong>Total: ${totalCost}</strong>
        </div>
    );
}

const getTotalCost = (metalCost = 0, miscCost = 0, laborCost = 0, stones = []) => {
    const stoneCost = stones.reduce((sum, stone) => 
        sum + (Number(stone.cost) * Number(stone.quantity) || 0), 0
    );
        
    const totalCost = parseFloat(metalCost) + parseFloat(miscCost) + parseFloat(laborCost) + parseFloat(stoneCost);

    return totalCost;
};


export {getTotalCost}