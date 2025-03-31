import { useState } from "react";

const useFormUpdater = (initialFormData) => {
  const [formData, setFormData] = useState(initialFormData);

  // Function to update a specific product line by id (or another unique key)
  const updateProductLine = (styleNumber, field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: prevFormData.items.map((item) =>
        item.styleNumber === styleNumber ? { ...item, [field]: value } : item
      ),
    }));
  };
  

  // Function to update other form fields
  const updateFormField = (fieldName, value) => {
    
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  return { formData, updateProductLine, updateFormField };
};

export default useFormUpdater;
