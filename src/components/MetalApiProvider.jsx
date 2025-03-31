import React, { createContext, useState, useEffect, useContext } from 'react';

const MetalApiContext = createContext();

// export const MetalApiProvider = ({ children }) => {
//   const [metalData, setMetalData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchMetalData = async () => {
//     const response = await fetch(METAL_API_URL);
//       const data = await response.json();
//       setMetalData(data);
//       setIsLoading(false);
//     };

//     fetchMetalData();
//   }, []);

//   return (
//     <MetalApiContext.Provider value={{ metalData, isLoading }}>
//       {children}
//     </MetalApiContext.Provider>
//   );
// }

export const useMetalApi = () => useContext(MetalApiContext);