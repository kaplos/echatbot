export const metalTypes = [
    {
        type: 'Gold',
        karat: ['10K', '14K', '18K', '22K', '24K'],
        color: ['Yellow', 'White', 'Rose'],

    },
    {
        type: 'Silver',
        karat: [925],
        color: ['Silver'],
    }
]

export const getMetalType = (type) => {
    // console.log(type,'type from getMetalType')
    return metalTypes.find(metal => metal.type === type);
}

export const purity = {
    '10K': 0.417 ,
    '14K': 0.585, 
    '18K': 0.75, 
    '22K': 0.917, 
    '24K': 1.00,
    '925':.925
}
// export const goldFormula = (weight,pricePerOz,carats) => {
//     weight * pricePerOz * purity[carats] *
// }