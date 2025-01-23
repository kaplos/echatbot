import React from 'react';
import { MessageSquare, Calendar, Tag } from 'lucide-react';
import {formatDate} from '../../utils/dateUtils'

export default function IdeaCard ({idea,handleClick}){
  
  console.log(idea)
      
  const parseArray = (input) => {
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch (e) {
        console.error('Error parsing JSON string:', e);
        return [];
      }
    }
    return Array.isArray(input) ? input : [];
  };

    return (
        <div
          onClick={()=>handleClick(idea.id)}
          key={idea.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
            {idea.images.length > 0 && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={idea.images[0]}
            alt={idea.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              idea.status === 'approved' ? 'bg-green-100 text-green-800' :
              idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
              idea.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {idea.status.replace('_', ' ')}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {parseArray(idea.tags).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            {/* <span>{idea.comments.length}</span> */}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(idea.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};