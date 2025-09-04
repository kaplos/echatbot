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
  
  import ExcelJS from "exceljs";

export const exportToExcel = async (data, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // 1. Define headers
  worksheet.columns = [
    { header: "Style Code", key: "styleNumber", width: 20 },
    { header: "Image URL", key: "imageUrl", width: 40 },
    { header: "Image", key: "embeddedImage", width: 15 },
    { header: "Weight (g)", key: "salesWeight", width: 15 },
    { header: "Price", key: "totalCost", width: 15 },
    { header: "Buyer Remark", key: "notes", width: 30 },
    // { header: "Metal Weight Price", key: "platingCharge", width: 20 },
  ];
  // 2. Add data rows (excluding embedded images for now)
  data.forEach((row) => {
    // console.log(row.product.weight, "data for excel export");
    worksheet.addRow({
      styleNumber: row.product.styleNumber,
      imageUrl: row.product.images && row.product.images[0] ? row.product.images[0] : "No Image",
      embeddedImage: "", // Placeholder for the embedded image
      salesWeight: row.product.weight,
      totalCost: row.totalCost,
      notes: row.product.notes,
      platingCharge: row.product.platingCharge,
    });
  });

  // 3. Embed images
  for (const [index, row] of data.entries()) {
    if (row.images && row.images[0]) {
      try {
        // Fetch the image as a Blob
        const response = await fetch(row.images[0]);
        const blob = await response.blob();

        // Convert Blob to Base64
        const base64 = await blobToBase64(blob);

        // Add the image to the workbook
        const imageId = workbook.addImage({
          base64: base64, // Use Base64 string
          extension: row.images[0].split(".").pop(), // Extract file extension (e.g., png, jpg)
        });

        // Calculate the correct row index (adjust for header row)
        const rowIndex = index + 2; // Data starts from row 2 (after header)

        // Add the image to the worksheet in the "Image" column
        worksheet.addImage(imageId, {
          tl: { col: 2, row: rowIndex - 1 }, // Top-left corner (Image column)
          ext: { width: 100, height: 100 }, // Image dimensions
        });

        // Adjust the row height dynamically based on the image height
        const imageHeightInPoints = 120 * 0.75; // Convert pixels to points (1px = 0.75pt)
        worksheet.getRow(rowIndex).height = imageHeightInPoints;
      } catch (error) {
        console.error(`Error embedding image for row ${index + 1}:`, error);
      }
    }
  }

  // 4. Write the workbook to a Blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  // 5. Trigger download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${fileName}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to convert Blob to Base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};