import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import ProductList from '../components/Products/ProductList';
import ProductDetails from '../components/Products/ProductDetails';
import AddProductModal from '../components/Products/AddProductModal';
import ImportModal from '../components/Products/ImportModal';


 const  Products = () => {
    const products = [{
        id: '1',
        itemNumber: '123',
        manufacturerCode: '0',
        name: 'test',
        description: 'another test',
        status: 'draft', // 'draft' | 'in_review' | 'approved' | 'in_production' | 'completed'
        created_at: '',
        updated_at: '',
        images: [],
        metalProperties: undefined,
        stones: undefined,
        laborCost: 0,
        totalCost: undefined,
        
        // Physical properties
        dimensions: {
          width: undefined,  // Previously discDiameter
          height: undefined, // Previously tubeLength
          depth: undefined,  // Previously thickness
        },
        
        // Product details
        quantity: 0,
        unit: 'PCS', // 'PCS' | 'SET'
        isPair: false,
        
        // Plating options
        platingType: undefined, // 'rhodium' | 'gold-vermeil' | 'gold-plated'
        platingKarat: undefined, // '14k' | '18k'
        platingMicrons: undefined,
        
        // Cost breakdown
        totalWeight: 0,
        goldWeight: 0,
        goldAmount: 0,
        stoneAmount: 0,
        unitPrice: 0,
        rhodiumCharge: 0,
        miscCost: 0,
        remarks: '',
        developmentNotes: undefined,
      }];
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);


    return(
        <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex space-x-3">
          <button 
            className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 border border-gray-300"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-5 h-5 mr-2" />
            Import
          </button>
          <button 
            className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Product
          </button>
        </div>
      </div>

      <ProductList
        products={products}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setIsDetailsOpen(true);
        }}
      />
      {selectedProduct && (
        <ProductDetails
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
        <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
        <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
        />

      </div>
    );

}

export default Products;