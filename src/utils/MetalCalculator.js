import { KARAT_PURITY, SILVER_PURITY } from '../components/Products/TempKarets';

const GRAMS_PER_OUNCE = 31.1035;

export const calculateMetalPrice = (
    weightInGrams,
    metalType,
    purityType,
    spotPricePerOunce
  )=> {
    let purity;
  
    if (metalType === 'gold') {
      purity = KARAT_PURITY[purityType];
    } else {
      purity = SILVER_PURITY[purityType];
    }
  
    // Calculate pure metal content
    const pureMetal = weightInGrams * purity;
    
    // Convert spot price per ounce to price per gram
    const pricePerGram = spotPricePerOunce / GRAMS_PER_OUNCE;
    
    // Calculate final price
    return pureMetal * pricePerGram;
  };