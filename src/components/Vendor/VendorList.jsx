import React from 'react';
import { Building2, Mail, Phone } from 'lucide-react';

export default function VendorList ({ vendors, onSelectVendor }) {
  // console.log(vendors[0].pricingsetting )
return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          onClick={() => onSelectVendor(vendor)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {vendor.email}
            </div>
            {vendor.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {vendor.phone}
              </div>
            )}
            {vendor.address && (
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-4 h-4 mr-2" />
                {vendor.address}
              </div>
            )}
          </div>
            {console.log(vendor.pricingsetting)}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Loss: {vendor.pricingsetting?.lossPercentage}% | 
              Markup: {vendor.pricingsetting?.markupPercentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}