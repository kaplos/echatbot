import { FileImage, CheckCircle } from 'lucide-react';
import React from 'react';
import { getStatusColor } from '../../utils/designUtils';


const SampleCard = ({ 
    sample, 
    onClick, 
    selected = false,
    selectable = false,
  }) => {
    const handleClick = (e) => {
      e.preventDefault();
      onClick(sample);
    };
   let images = Array.isArray(sample.images) ? sample.images : JSON.parse(sample.images);

   return (
           <div
             role="button"
             tabIndex={0}
             onClick={handleClick}
             onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
             className={`relative bg-white rounded-lg shadow-sm border ${
               selected ? 'border-chabot-gold' : 'border-gray-200'
             } hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-chabot-gold`}
           >
             {selectable && (
               <div className="absolute top-2 right-2 z-10">
                 <CheckCircle 
                   className={`w-6 h-6 ${
                     selected ? 'text-chabot-gold' : 'text-gray-300'
                   }`} 
                 />
               </div>
             )}
             
             <div className="relative object-contain aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
               {images && images.length > 0 && (
                 <>
                   <img
                     src={images[0]}
                     alt={sample.title}
                     className="w-full h-full object-contain"
                   />
                   {/* <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-2 py-1 text-center">
                     <span className="text-sm font-medium">hi</span>
                   </div> */}
                 </>
               ) 
              //  : (
              //    <div className="w-full h-full flex flex-col items-center justify-center">
              //      <FileImage className="w-12 h-12 text-gray-400" />
              //      <span className="mt-2 text-sm font-medium text-gray-500">{sample.name}</span>
              //    </div>
              //  )
               }
             </div>
       
             <div className="p-4">
               <div className="flex justify-between items-start">
                 <span className="text-sm font-medium text-gray-900">Style: {sample.styleNumber}</span>
                 <span
                   className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                     sample.status
                   )}`}
                 >
                   {sample.status.replace('_', ' ')}
                 </span>
               </div>
               {/* <label htmlFor="">name:</label> */}
               <p className="mt-2 text-sm text-gray-600 line-clamp-2">Name: {sample.name}</p>
             </div>
           </div>
         );
       };
   
       export default SampleCard;