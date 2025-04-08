import { useState } from "react";

const useFormUpdater = (initialFormData) => {
  const [formData, setFormData] = useState(initialFormData);

  // Function to update a specific product line by id (or another unique key)
  const updateProductLine = (productId, field, value) => {
    console.log(formData)
    let lineItemToChange = formData.find((item) => item.productId === productId);
    lineItemToChange[field] = value;
    setFormData([...formData, lineItemToChange]);
    console.log(typeof formData,formData)
    

  };
  

  

  // Function to update other form fields
  const updateFormField = (fieldName, value) => {
    
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const resetForm = (formData) =>{
    setFormData(formData)
  }

  return { formData, updateProductLine, updateFormField,resetForm };
  // return { formData, updateProductLine, updateFormField,resetForm };
};

export default useFormUpdater;
