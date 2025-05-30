
const stoneHeaders = Array.from({ length: 10 }, (_, i) => {
  const index = i + 1;
  return [
    { key: `stone${index}_id`, label: `Stone ${index} ID` },
    { key: `stone${index}_type`, label: `Stone ${index} Type` },
    { key: `stone${index}_customType`, label: `Stone ${index} Custom Type` },
    { key: `stone${index}_color`, label: `Stone ${index} Color` },
    { key: `stone${index}_shape`, label: `Stone ${index} Shape` },
    { key: `stone${index}_size`, label: `Stone ${index} Size` },
    { key: `stone${index}_quantity`, label: `Stone ${index} Quantity` },
    { key: `stone${index}_cost`, label: `Stone ${index} Cost` },
    { key: `stone${index}_notes`, label: `Stone ${index} Notes` },
  ];
}).flat();
const headersExport = {
  designs: [
    { key: "id", label: "ID (Design)" },
    { key: "description", label: "Description" },
    { key: "link", label: "Link" },
    { key: "collection", label: "Collection" },
    { key: "category", label: "Category" },
    { key: "d_images", label: "Design Images" },
    { key: "status", label: "Status" },
    { key: "name", label: "Name" },

    { key: "manufacturerCode", label: "Manufacturer Code" },
    { key: "startinginfo_description", label: "Quote Description" },
    { key: "karat", label: "Karat" },
    { key: "metalType", label: "Metal Type" },
    { key: "color", label: "Color" },
    { key: "vendor", label: "Vendor" },
    { key: "platingCharge", label: "Plating Charge" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
    { key: "weight", label: "Weight" },
    { key: "plating", label: "Plating" },
    { key: "miscCost", label: "Misc Cost" },
    { key: "laborCost", label: "Labor Cost" },
    // { key: "designId", label: "Design ID" },
    { key: "totalCost", label: "Total Cost" },
    { key: "s_images", label: "Quote Images" },
  
    
    ...stoneHeaders
   ],
   samples:[
    {key:'id',label:'ID (Sample)'},
     { key: 'name', label: 'Name' },
     { key: 'styleNumber', label: 'Style Number' },
    { key: 'cad', label: 'CAD Files' },
    { key: 'category', label: 'Category' },
    { key: 'collection', label: 'Collection' },
    { key: 'salesWeight', label: 'Sales Weight' },
    { key: 'selling_pair', label: 'Selling Pair' },
    { key: 'back_type', label: 'Back Type' },
    { key: 'custom_back_type', label: 'Custom Back Type' },
    { key: 'back_type_quantity', label: 'Back Type Quantity' },
    { key: 's_status', label: 'Sample Status' },

    { key: "manufacturerCode", label: "Manufacturer Code" },
    { key: "startinginfo_description", label: "Quote Description" },
    { key: "karat", label: "Karat" },
    { key: "metalType", label: "Metal Type" },
    { key: "color", label: "Color" },
    { key: "vendor", label: "Vendor" },
    { key: "platingCharge", label: "Plating Charge" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
    { key: "weight", label: "Weight" },
    { key: "plating", label: "Plating" },
    { key: "miscCost", label: "Misc Cost" },
    { key: "laborCost", label: "Labor Cost" },
    // { key: "designId", label: "Design ID" },
    { key: "totalCost", label: "Total Cost" },
    { key: "s_images", label: "Quote Images" },
  
    
    ...stoneHeaders,
    { key: "designId", label: "Design Id" },
    
   ]
}
export const exportToCSV = (products,type) => {
    const dataToExport = products.map((product) => {
       switch(type){
        case 'samples': 
        return flattenSampleOnly(product);
        break;
        case 'designs':
          return flattenDesignOnly(product);
          break;
      }
    });
   const headers = headersExport[type];
  
    // const rows = products.map((product, index) => {
    //   const stone = product.stones?.[0];
    //   const stoneDesc = stone ? 
    //     `CZ/${stone.size.replace('mm', '')} * ${stone.quantity} PC` : '';
  
    //   const remarkParts = [
    //     `Thickness: ${product.metalProperties?.thickness || '0.96'}mm`,
    //     `Tube length: ${product.tubeLength || '7.85'}mm`,
    //     `Disc thickness: ${product.discThickness || '0.6'}mm`,
    //     `Disc diameter: ${product.discDiameter || '3.1'}mm`
    //   ];
  
    //   return [
    //     index + 1,
    //     product.itemNumber,
    //     product.itemCode,
    //     '',  // PHOTO placeholder
    //     stoneDesc,
    //     product.metalProperties?.karatType?.replace('k', ''),
    //     product.metalProperties?.color || 'YG',
    //     remarkParts.join('\n'),
    //     product.quantity,
    //     product.unit || 'PCS',
    //     product.totalWeight.toFixed(2),
    //     product.goldWeight.toFixed(2),
    //     product.goldAmount.toFixed(2),
    //     product.laborCost.toFixed(2),
    //     (product.stones?.[0]?.cost || 0).toFixed(2),
    //     product.unitPrice.toFixed(2),
    //     product.rhodiumCharge.toFixed(2),
    //     product.remarks
    //   ].map(value => 
    //     typeof value === 'string' && value.includes(',') ? 
    //       `"${value}"` : 
    //       value
    //   ).join(',');
    // });
    exportToCSVFile(headers, dataToExport, 'exported_designs.csv');
  
    // const csv = [headers.join(','), ...rows].join('\n');
    // const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    
    // link.setAttribute('href', url);
    // link.setAttribute('download', `jewelry_export_${new Date().toISOString().slice(0,10)}.csv`);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);
  };
  function flattenDesignOnly(design) {
    return {
      id: design.id ?? "",
      description: design.description ?? "",
      link: design.link ?? "",
      collection: design.collection ?? "",
      category: design.category ?? "",
      d_images: design.images?.join(" | ") ?? "",
      status: design.status ?? "",
      name: design.name ?? "",
      // designId: design.id ?? "",
      manufacturerCode: design.startingInfo.manufacturerCode ?? "",
      images: design.startingInfo.images?.join(" | ") ?? "",
      description: design.startingInfo.description ?? "",
      metalType: design.startingInfo.metalType ?? "",
      karat: design.startingInfo.karat ?? "",
      color: design.startingInfo.color ?? "",
      weight: design.startingInfo.weight ?? 0,
      height: design.startingInfo.height ?? 0,
      length: design.startingInfo.length ?? 0,
      width: design.startingInfo.width ?? 0,
      plating: design.startingInfo.plating ?? 0,
      platingCharge: design.startingInfo.platingCharge ?? 0,
      stones: design.startingInfo.stones ?? [],
      vendor: design.startingInfo.vendor ?? null,
      status: design.startingInfo.status ?? "Working_on_it:yellow",
      
      ...design.stones?.reduce((acc, stone, i) => {
        if (i >= 10) return acc; // limit to 10 stones
        acc[`stone${i + 1}_id`] = stone.id ?? "";
        acc[`stone${i + 1}_type`] = stone.type ?? "";
        acc[`stone${i + 1}_customType`] = stone.customType ?? "";
        acc[`stone${i + 1}_color`] = stone.color ?? "";
        acc[`stone${i + 1}_shape`] = stone.shape ?? "";
        acc[`stone${i + 1}_size`] = stone.size ?? "";
        acc[`stone${i + 1}_quantity`] = stone.quantity ?? 0;
        acc[`stone${i + 1}_cost`] = stone.cost ?? 0;
        acc[`stone${i + 1}_notes`] = stone.notes ?? "";
        return acc;
      }, {}),

      // designId: design.id

    };
  }
  function flattenSampleOnly(sample) {

    console.log(sample, 'sample data for export');
    return {
      id:sample.id,
      cad: sample.cad.join(' | ') ?? [],
    category: sample.category ?? "",
    collection: sample.collection ?? "",
    selling_pair: sample.selling_pair ?? "pair",
    back_type: sample.back_type ?? "none",
    custom_back_type: sample.custom_back_type ?? "",
    back_type_quantity: sample.back_type_quantity ?? 0,
    name: sample.name ?? "",
    styleNumber: sample.styleNumber ?? "",
    salesWeight: sample.salesWeight ?? 0,
    s_status: sample.status ?? "Working_on_it:yellow",

      // sampleId: sample.id ?? "",
      manufacturerCode: sample.startingInfo.manufacturerCode ?? "",
      s_images:sample.s_images,
      description: sample.startingInfo.description ?? "",
      metalType: sample.startingInfo.metalType ?? "",
      karat: sample.startingInfo.karat ?? "",
      color: sample.startingInfo.color ?? "",
      weight: sample.startingInfo.weight ?? 0,
      height: sample.startingInfo.height ?? 0,
      length: sample.startingInfo.length ?? 0,
      width: sample.startingInfo.width ?? 0,
      plating: sample.startingInfo.plating ?? 0,
      platingCharge: sample.startingInfo.platingCharge ?? 0,
      stones: sample.startingInfo.stones ?? [],
      vendor: sample.startingInfo.vendor ?? null,
      status: sample.startingInfo.status ?? "Working_on_it:yellow",
      designId: sample.startingInfo.designId,


     
      ...sample.stones?.reduce((acc, stone, i) => {
        if (i >= 10) return acc; // limit to 10 stones
        acc[`stone${i + 1}_id`] = stone.id ?? "";
        acc[`stone${i + 1}_type`] = stone.type ?? "";
        acc[`stone${i + 1}_customType`] = stone.customType ?? "";
        acc[`stone${i + 1}_color`] = stone.color ?? "";
        acc[`stone${i + 1}_shape`] = stone.shape ?? "";
        acc[`stone${i + 1}_size`] = stone.size ?? "";
        acc[`stone${i + 1}_quantity`] = stone.quantity ?? 0;
        acc[`stone${i + 1}_cost`] = stone.cost ?? 0;
        acc[`stone${i + 1}_notes`] = stone.notes ?? "";
        return acc;
      }, {})
    };
  }
  function exportToCSVFile(headers, data, filename = "export.csv") {
    console.log(data, "data to export in exportToCSVFile");
    const csvRows = [];
  
    // Create header row
    const headerRow = headers.map((h) => `"${h.label}"`).join(",");
    csvRows.push(headerRow);
  
    // Create data rows
    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h.key] ?? "";
        return val;
      });
      csvRows.push(values.join(","));
    }
    console.log(csvRows, "csvRows");  
    // Create Blob and trigger download
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  
  import * as XLSX from 'xlsx';

export function exportData(data, type) {
  console.log(data)
  const headers = headersExport[type];
  const formatted = data.map((item) => {
    const {starting_info,stones, ...rest} = item;
    const {id,s_images,...startingInfo} = starting_info ?? {};
    return {
      ...rest,
      startingInfo:startingInfo,
      s_images: startingInfo.images?.length>1? startingInfo.images?.join(" | ") : startingInfo?.images?.[0] || "" ,
      stones: stones ?? [],
    };
  })
  console.log(formatted, "formatted")
  const flattenedData = formatted.map((product) => {
       switch(type){
        case 'samples': 
        return flattenSampleOnly(product);
        break;
        case 'designs':
          return flattenDesignOnly(product);
          break;
        
      }
    });
    const headersToExport = headersExport[type].map((header) => header.label); // Array, not .join(",")
    const makingSheet = [headersToExport]; // This is your sheet as an array of arrays
    
    // Step 2: Add data rows
    for (let row of flattenedData) {
      const makingRow = headersExport[type].map((header) => row[header.key] ?? "");
      makingSheet.push(makingRow);
    }
    
    // Step 3: Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(makingSheet);
    
    // Step 4: Build workbook and trigger download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    
    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
  a.href = url;
  a.download = `${type}_export_${Date.now()}.xlsx`;
  a.click();
}


