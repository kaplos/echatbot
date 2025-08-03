import React, { useState, useEffect,useMemo } from "react";
import { useSupabase } from "../components/SupaBaseProvider";
import { useGenericStore } from "../store/VendorStore";
import { useMessage } from "../components/Messages/MessageContext";
import Loading from "../components/Loading";

export default function DynamicForm() {
  const options = useGenericStore(state => state.getEntity('settings'));
  const updateEntity = useGenericStore(state => state.updateEntity);
  const isLoading = useGenericStore(state => state.isLoading.settings);
  const errors = useGenericStore(state => state.errors.settings);



  const { supabase } = useSupabase();
  const { showMessage } = useMessage();

  const [formData, setFormData] = useState(options);

  // Initialize formData only once when data is loaded
// useEffect(() => {
//   if (!options) {
//     console.warn("No options available yet from getEntity('settings')");
//     return;
//   }

//   if (!formData) {
//     setFormData(options);
//   }
// }, [options]);

if(isLoading){
  return <Loading />
}
//   // Handle input changes
  const handleChange = (section, field, value) => {
    const newValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0); // Avoid empty strings

    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: newValue,
      },
    }));
  };

//   // Save to DB and update store
  const saveFormData = async () => {
    if (!formData) return;

    const { error } = await supabase
      .from("settings")
      .update({ options: formData })
      .eq("id", 1);

    if (error) {
      console.error("Error saving form data:", error);
    } else {
      showMessage("Settings Saved");
      await updateEntity("settings", formData);
    }
  };

//   // Prevent rendering until data is ready
//   if (isLoading || !formData) return <Loading />;

  const renderSection = (title, sectionKey) => {
    const sectionData = formData?.[sectionKey];
    if (!sectionData) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {Object.keys(sectionData).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type="text"
              value={sectionData[field]?.join(", ") ?? ""}
              onChange={(e) =>
                handleChange(sectionKey, field, e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder={`Enter ${field} (comma-separated)`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Settings</h1>

      {renderSection("Stone Properties", "stonePropertiesForm")}
      {renderSection("Form Fields", "formFields")}
      {/* Uncomment this if customers section should be editable */}
      {/* {renderSection("Customers", "customers")} */}

      <div className="mt-6">
        <button
          onClick={saveFormData}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

