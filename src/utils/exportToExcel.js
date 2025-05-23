export const exportToCsv = (data, fileName) => {
    console.log(data, "data from exportToCsv");
    // 1. Define the headers and their corresponding keys in the data
    const headers = [
      { label: 'Style Code', key: 'styleNumber' },
      { label: 'Image', key: 'images' },
      { label: 'Weight (g)', key: 'weight' },
      { label: 'Price', key: 'totalCost' },
      { label: 'Buyer Remark', key: 'notes' },
      { label: 'Metal Weight Price', key: 'platingCharge' },
      { label: 'Images', key: 'images' },
    ];
  
    // 2. Create CSV header row
    const csvHeaders = headers.map(h => h.label).join(",");
  
    // 3. Create CSV data rows
    const csvRows = data.map(row => {
      return headers.map(h => {
        const value = h.label==='Image' ? row[h.key][0]:row[h.key];
        if (Array.isArray(value)) {
          return `"${value.join(" | ")}"`; // Handle arrays like images
        }
        return value !== null && value !== undefined ? `"${value}"` : "";
      }).join(",");
    });
  
    // 4. Combine header and rows
    const csvContent = [csvHeaders, ...csvRows].join("\n");
  
    // 5. Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  