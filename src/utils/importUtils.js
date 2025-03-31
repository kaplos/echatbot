export const parseCSV = async (file) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
  
    const products = [];
  
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const row = headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
        return obj;
      }, {});
  
      // Parse stone description
      const stoneMatch = row['STONE DESCRIPTION']?.match(/CZ\/(\d+(?:\.\d+)?)\s*\*\s*(\d+)/);
      const stones = stoneMatch ? [{
        id: crypto.randomUUID(),
        type: 'diamond-cz',
        shape: 'round',
        size: `${stoneMatch[1]}mm`,
        quantity: parseInt(stoneMatch[2]),
        cost: parseFloat(row['STONE ($/PC)']) || 0,
      }] : [];
  
      // Parse remarks for dimensions
      const remarkLines = row['REMARK']?.split('\n') || [];
      const dimensions = {
        width: remarkLines.find(l => l.includes('Disc diameter:'))?.match(/[\d.]+/)?.[0] || '',
        height: remarkLines.find(l => l.includes('Tube length:'))?.match(/[\d.]+/)?.[0] || '',
        depth: remarkLines.find(l => l.includes('Thickness:'))?.match(/[\d.]+/)?.[0] || '',
      };
  
      const product = {
        id: crypto.randomUUID(),
        itemNumber: row['Item#'] || '',
        manufacturerCode: row['ITEMS CODE'] || '',
        name: row['Item#'] || '',
        description: row['REMARK'] || '',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [],
        dimensions,
        metalProperties: {
          type: 'gold',
          karatType: `${row['GOLD (K)']}k` ,
          color: row['GOLD COLOR'] || 'YG',
          weightInGrams: parseFloat(row['TOTAL WEIGHT(GR)']) || 0,
        },
        stones,
        laborCost: parseFloat(row['LABOR ($/PC)']) || 0,
        quantity: parseInt(row['Q`ty']) || 1,
        unit: row['Unit'] ,
        isPair: false,
        totalWeight: parseFloat(row['TOTAL WEIGHT(GR)']) || 0,
        goldWeight: parseFloat(row['GOLD WEIGHT(GR)']) || 0,
        goldAmount: parseFloat(row['GOLD AMOUNT ($/PC)']) || 0,
        stoneAmount: parseFloat(row['STONE ($/PC)']) || 0,
        unitPrice: parseFloat(row['U/PRICE(U$)']) || 0,
        rhodiumCharge: parseFloat(row['Rhodium PlatingCharge']) || 0,
        miscCost: 0,
        remarks: row['REMARK'] || '',
      };
  
      products.push(product);
    }
  
    return products;
  };