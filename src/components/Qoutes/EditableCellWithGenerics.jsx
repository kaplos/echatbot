import { useEffect,useState} from "react";

export default function EditableCellWithGeneric({ 
    handleChange, 
    setEditingCell, 
    editingCell, 
    cellType, 
    id, 
    data
}) {
    console.log(data,'in editable cell')

    const [customValue, setCustomValue] = useState(data);
    useEffect(() => {
        setCustomValue(data);
    }, [data]);
    useEffect(() => {
        // console.log('cell type',cellType,editingCell)
    }, [editingCell]);
    return (
        <td
            className=" border border-gray-300 p-2 text-center cursor-pointer"
            onClick={() => setEditingCell({ id, field: cellType })}
        >
            {editingCell?.field === cellType && editingCell?.id === id ? (
                    
                    <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onBlur={() => {
                            console.log("Saving data:", customValue); // Log the value before sending it back
                            handleChange(id, cellType, customValue);
                            setEditingCell(null);
                          }}
                        onKeyDown={(e) => { if(e.key === "Enter"){
                            console.log("Saving data:", customValue); // Log the value before sending it back
                            handleChange(id, cellType, customValue)
                                setEditingCell(null)}}

                        }
                        className="border border-gray-300 p-1 w-full text-center"
                        autoFocus
                    />
                
            ) : (
                !customValue || customValue ==='' ?  "Click to edit":customValue 
            )}
        </td>
    );
}
