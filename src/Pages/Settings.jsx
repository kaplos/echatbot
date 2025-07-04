import React, { useState, useEffect } from "react";
import { useSupabase } from "../components/SupaBaseProvider";
import { useGenericStore } from "../store/VendorStore";
import { useMessage } from "../components/Messages/MessageContext";

export default function DynamicForm() {
    const {getEntity,updateEntity} = useGenericStore()
    const {options} = getEntity('settings')
  const {showMessage} = useMessage()
    console.log(options)
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState(options);

  // Fetch the initial data from the database
//   useEffect(() => {
//     const fetchFormData = async () => {
//       const { data, error } = await supabase
//         .from("settings")
//         .select("options")
//         .single(); // Assuming the table has a single row for settings
//       if (error) {
//         console.error("Error fetching form data:", error);
//       } else {
//         setFormData(data.options || formData);
//       }
//     };
//     fetchFormData();
//   }, [supabase]);
  useEffect(()=>{
    console.log(formData)
  },[formData])

  // Handle input changes
  const handleChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value.split(",").map((item) => item.trim()), // Convert comma-separated values to an array
      },
    });
  };

  // Save the updated data to the database
  const saveFormData = async () => {
    const { error } = await supabase
      .from("settings")
      .update({ options: formData })
      .eq("id", 1); // Assuming the settings row has an ID of 1
    if (error) {
      console.error("Error saving form data:", error);
    } else {
        showMessage('Settings Saved')
    }
    updateEntity('settings', formData)
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Settings</h1>

      {/* Render stonePropertiesForm */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Stone Properties</h2>
        {Object.keys(formData.stonePropertiesForm).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type="text"
              value={formData.stonePropertiesForm[field].join(", ")} // Convert array to comma-separated string
              onChange={(e) =>
                handleChange("stonePropertiesForm", field, e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={`Enter ${field} (comma-separated)`}
            />
          </div>
        ))}
      </div>

      

      {/* Render formFields */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Form Fields</h2>
        {Object.keys(formData.formFields).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type="text"
              value={formData.formFields[field].join(", ")} // Convert array to comma-separated string
              onChange={(e) =>
                handleChange("formFields", field, e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={`Enter ${field} (comma-separated)`}
            />
          </div>
        ))}
      </div>
      {/* render Customer fields */}
      {/* <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Customers</h2>
        {Object.keys(formData.customers).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type="text"
              value={formData.customers[field].join(", ")} // Convert array to comma-separated string
              onChange={(e) =>
                handleChange("customers", field, e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={`Enter ${field} (comma-separated)`}
            />
          </div>
        ))}
      </div> */}

      <button
        onClick={saveFormData}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Save Changes
      </button>
    </div>
  );
}