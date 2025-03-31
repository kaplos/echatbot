import React, { useState } from 'react';
import { Download } from 'lucide-react';
import ProductCard from './ProductCard';
import { exportToCSV } from '../../utils/exportUtils';


const ProductList = ({ products, onProductClick }) => {
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const handleExport = () => {
        const productsToExport = products.filter(p => selectedProducts.has(p.id));
        exportToCSV(productsToExport);
        setSelectedProducts(new Set());
        setIsSelectionMode(false);
    };
    const toggleProductSelection = (product) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(product.id)) {
          newSelection.delete(product.id);
        } else {
          newSelection.add(product.id);
        }
        setSelectedProducts(newSelection);
      };
    
      return (
        <div>
          <div className="flex justify-end mb-4 space-x-3">
            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Products'}
            </button>
            {isSelectionMode && selectedProducts.size > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold rounded-lg hover:bg-opacity-90 inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedProducts.size})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={isSelectionMode ? toggleProductSelection : onProductClick}
            selected={selectedProducts.has(product.id)}
            selectable={isSelectionMode}
          />
        ))}
      </div>
    </div>
     );
    };
export default ProductList;