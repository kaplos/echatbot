import { useEffect,useState} from "react";

export default function EditableCellWithGeneric({ 
    handleChange, 
    setEditingCell, 
    editingCell, 
    cellType, 
    styleNumber, 
    data
}) {
    const [customValue, setCustomValue] = useState(data);
    useEffect(() => {
        setCustomValue(data);
    }, [data]);
    useEffect(() => {
        console.log('cell type',cellType,editingCell)
    }, [editingCell]);
    return (
        <td
            className=" border border-gray-300 p-2 text-center cursor-pointer"
            onClick={() => setEditingCell({ styleNumber ,field: cellType })}
        >
            {editingCell?.field === cellType && editingCell?.styleNumber === styleNumber? (
                    
                    <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onBlur={() => {
                            // console.log(row,cellType, customValue);
                            handleChange(styleNumber,cellType,customValue);
                            setEditingCell(null)
                            // setCustomValue('');
                        }}
                        onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                        className="border border-gray-300 p-1 w-full text-center"
                        autoFocus
                    />
                
            ) : (
                customValue !== undefined ? customValue : "Click to edit"
            )}
        </td>
    );
}
