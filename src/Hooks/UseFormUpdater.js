import { useState } from "react";

const useFormUpdater = (initialFormData) => {
  const [formData, setFormData] = useState(initialFormData);

  // Function to update a specific product line by id (or another unique key)
  const updateProductLine = (productId, field, value) => {
    setFormData((prevFormData) =>
      prevFormData.map((item) =>
        item.productId === productId
          ? { ...item, [field]: value } // Create a new object with the updated field
          : item // Keep other items unchanged
      )
    );
  };

  // Function to update other form fields
  const updateFormField = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const resetForm = (newFormData) => {
    setFormData(newFormData);
  };

  return { formData, updateProductLine, updateFormField, resetForm };
};

export default useFormUpdater;