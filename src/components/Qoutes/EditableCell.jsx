import { getStatusColor } from "../../utils/designUtils";
import { useSupabase } from "../SupaBaseProvider";
import { useEffect, useState } from "react";
export default function EditableCell({
  handleChange,
  setEditingCell,
  editingCell,
  row,
  index,
  cellType,
}) {
  // console.log('Row:', row, 'Index:', index,'editable cell');
  // console.log(row,cellType,cellType.replace(/['"]/g, ''),index)
  const { supabase } = useSupabase();
  const [customValue, setCustomValue] = useState(row.tags);

  const handleStatusChange = async (quoteNumber, status) => {
    const { data, error } = await supabase
      .from("quotes")
      .update({ status })
      .eq("quoteNumber", quoteNumber);

    if (error) {
      console.error("Error updating status:", error);
    } else {
      console.log("Status updated successfully:", data);
    }
  };
  const handleTagsChange = async (quoteNumber, tags) => {
    const { data, error } = await supabase
      .from("quotes")
      .update({ tags })
      .eq("quoteNumber", quoteNumber);

    if (error) {
      console.error("Error updating tags:", error);
    } else {
      console.log("Tags updated successfully:", data);
    }
  };

  const saveChanges = () => {
    setEditingCell(null);

    if (cellType === "status") {
      handleStatusChange(row.quoteNumber, customValue);
    } else if (cellType === "tags") {
      handleTagsChange(row.quoteNumber, customValue);
    }

    handleChange(row.id, cellType, customValue);
  };

  return (
    <td
      className={`border border-gray-300 p-2 text-center cursor-pointer ${
        cellType === "status" ? `${getStatusColor(row.status)}` : ""
      }`}
      onClick={() => setEditingCell({ index: index, field: cellType })}
    >
      {editingCell?.index === index && editingCell.field === cellType ? (
        cellType === "status" ? (
          //    console.log(row.status === 'Viewed:yellow' )
          <select
            value={row.status}
            onChange={(e) => {
              handleStatusChange(row.quoteNumber, e.target.value);
              handleChange(row.id, "status", e.target.value);
            }}
            onBlur={() => setEditingCell(null)}
            className={`border border-gray-300 p-1 w-full text-center `}
            autoFocus
          >
            <option value="Created:grey">Created</option>
            <option value="Sent:orange">Sent</option>
            <option value="Viewed:yellow">Viewed</option>
            {/* <option value="pending:">Pending</option> */}
            {/* <option value="approved:">Approved</option> */}
            {/* <option value="rejected:">Rejected</option> */}
            <option value="Paid:green">Paid</option>
          </select>
        ) : (
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onBlur={saveChanges}
            onKeyDown={(e) => e.key === "Enter" && saveChanges()}
            className="border border-gray-300 p-1 w-full text-center"
            autoFocus
          />
        )
      ) : (
        cellType === "status"
            ? (row.status?.split(":")[0] || "Click to edit")
            : (row[cellType.replace(/['"]/g, "")] || "Click to edit")
      )}
    </td>
  );
}
