export const parseCSV = async (file, type) => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');

  switch (type) {
    case 'design':
      return extractDesignData(lines, headers);
    case 'product':
      return extractProductData(lines, headers);
    case 'designQuote':
      return extractDesignQuote(lines, headers);
    default:
      return new Error('Unknown Error');
  }
};




import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseFileToJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      if (!data) return reject('No file data');

      if (file.name.endsWith('.csv')) {
        const parsed = Papa.parse(data, { header: true });
        resolve(parsed.data);
      } else {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        resolve(json);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

// import { supabase } from './supabaseClient'; // Uncomment when ready

export async function handleImportFile(file, type) {
  
  const rows = await parseFileToJSON(file);
  if (!rows || rows.length === 0) {
    throw new Error('No data found in the file');
  }

  // Extract headers from the first row
  const headers = Object.keys(rows[0]);
  console.log(headers,type)
  // Determine the type based on headers
  if (headers.includes('Style Number') && type === 'samples') {
    return rows
  } else if (headers.includes('ID (Design)') && type==='designs') {
    return rows
  } else {
    throw new Error('Wrong File Type');
  }

 

  
  // return new Error();
}
