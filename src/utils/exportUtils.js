export const exportToCSV = (products) => {
    const headers = [
      'No', 'Item#', 'ITEMS CODE', 'PHOTO', 'STONE DESCRIPTION', 'GOLD (K)',
      'GOLD COLOR', 'REMARK', 'Q`ty', 'Unit', 'TOTAL WEIGHT(GR)', 'GOLD WEIGHT(GR)',
      'GOLD AMOUNT ($/PC)', 'LABOR ($/PC)', 'STONE ($/PC)', 'U/PRICE(U$)',
      'Rhodium PlatingCharge', 'REMARK'
    ];
  
    const rows = products.map((product, index) => {
      const stone = product.stones?.[0];
      const stoneDesc = stone ? 
        `CZ/${stone.size.replace('mm', '')} * ${stone.quantity} PC` : '';
  
      const remarkParts = [
        `Thickness: ${product.metalProperties?.thickness || '0.96'}mm`,
        `Tube length: ${product.tubeLength || '7.85'}mm`,
        `Disc thickness: ${product.discThickness || '0.6'}mm`,
        `Disc diameter: ${product.discDiameter || '3.1'}mm`
      ];
  
      return [
        index + 1,
        product.itemNumber,
        product.itemCode,
        '',  // PHOTO placeholder
        stoneDesc,
        product.metalProperties?.karatType?.replace('k', ''),
        product.metalProperties?.color || 'YG',
        remarkParts.join('\n'),
        product.quantity,
        product.unit || 'PCS',
        product.totalWeight.toFixed(2),
        product.goldWeight.toFixed(2),
        product.goldAmount.toFixed(2),
        product.laborCost.toFixed(2),
        (product.stones?.[0]?.cost || 0).toFixed(2),
        product.unitPrice.toFixed(2),
        product.rhodiumCharge.toFixed(2),
        product.remarks
      ].map(value => 
        typeof value === 'string' && value.includes(',') ? 
          `"${value}"` : 
          value
      ).join(',');
    });
  
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `jewelry_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };