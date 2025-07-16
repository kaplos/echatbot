import { getTotalCost } from '../components/Samples/TotalCost';
import { getMetalCost } from '../components/Samples/CalculatePrice';

export const formatImportRow = (row, type, dropdown, prices) => {
  const stones = [];
  for (let i = 1; i <= 10; i++) {
    if (row[`Stone ${i} Type`] || row[`Stone ${i} Color`] || row[`Stone ${i} Size`]) {
      stones.push({
        id: row[`Stone ${i} ID`] || null,
        type: row[`Stone ${i} Type`] || '',
        color: row[`Stone ${i} Color`] || '',
        size: row[`Stone ${i} Size`] || '',
        shape: row[`Stone ${i} Shape`] || '',
        cost: parseFloat(row[`Stone ${i} Cost`] || 0),
        customType: row[`Stone ${i} Custom Type`] || '',
        quantity: parseInt(row[`Stone ${i} Quantity`] || 0),
        notes: row[`Stone ${i} Notes`] || '',
      });
    }
  }

  const mappedVendorId = dropdown.vendors.find(v => v.name === row['Vendor'])?.id ?? null;
  const mappedPlatingId = dropdown.plating.find(p => p.name === row['Plating'])?.id ?? null;
  const mappedCollectionId = dropdown.collection.find(c => c.name === row['Collection'])?.id ?? null;
  const mappedCategoryId = dropdown.category.find(c => c.name === row['Category'])?.id ?? null;

  const starting_info = {
    necklace: row['Necklace True Or False'] || false,
    necklaceCost: parseFloat(row['Necklace Cost'] || 0),
    description: row['Quote Description'] || '',
    images: (row['Quote Images'] || '').split('|').filter(image => image !== ''),
    color: row['Color'] || '',
    height: parseFloat(row['Height (in)'] || 0),
    length: parseFloat(row['Length (in)'] || 0),
    width: parseFloat(row['Width (in)'] || 0),
    weight: parseFloat(row['Weight (g)'] || 0),
    category: mappedCategoryId,
    collection: mappedCollectionId,
    manufacturerCode: row['Manufacturer Code'] || '',
    metalType: row['Metal Type'] || '',
    platingCharge: parseFloat(row['Plating Charge'] || 0),
    stones,
    vendor: mappedVendorId,
    plating: mappedPlatingId,
    karat: row['Karat'] || '',
    designId: row['ID (Design)'] || null,
    miscCost: parseFloat(row['Misc Cost'] || 0),
    laborCost: parseFloat(row['Labor Cost'] || 0),
    totalCost: parseFloat(
      row['Total Cost'] ||
        getTotalCost(
          getMetalCost(
            prices[row['Metal Type'].toLowerCase()]?.price || 0,
            row['Weight'] || 0,
            row['Karat'],
            dropdown.vendors.find(v => v.id === mappedVendorId)?.pricingsetting?.lossPercentage
          ),
          parseFloat(row['Misc Cost'] || 0),
          parseFloat(row['Labor Cost'] || 0),
          stones
        ) || 0
    ),
  };

  if (type === 'designs') {
    return {
      id: row['ID (Design)'] || '',
      name: row['Name'] || '',
      description: row['Design Description'] || '',
      link: row['Link'] || '',
      collection: mappedCollectionId,
      category: mappedCategoryId,
      images: (row['Design Images'] || '').split('|').filter(image => image !== ''),
      status: row['Status'] || 'Working_on_it:yellow',
      starting_info,
    };
  }

  if (type === 'samples') {
    return {
      id: row['ID (Sample)'].trim() === '' || row['ID (Sample)'] === null ? '' : row['ID (Sample)'],
      cad: (row['CAD Files'] || '').split('|').filter(image => image !== ''),
      selling_pair: row['Selling Pair'] || 'pair',
      back_type: row['Back Type'] || 'none',
      custom_back_type: row['Custom Back Type'] || '',
      back_type_quantity: parseInt(row['Back Type Quantity'] || 0),
      name: row['Sku'] || '',
      styleNumber: row['Style Number'] || '',
      salesWeight: parseFloat(row['Sales Weight'] || 0),
      starting_info_id: row['Starting Info ID'] || '',
      status: row['Sample Status'] || 'Working_on_it:yellow',
      starting_info,
      designId: row['Design Id'] || null,
    };
  }

  if (type === 'designQuote') {
    return {
      ...starting_info,
      id: row['ID (Design Quote)'] || null,
    };
  }
};
