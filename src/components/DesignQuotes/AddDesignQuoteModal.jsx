import DesignQuoteForm from "./DesignQuoteForm";
import { useLocation } from "react-router-dom";
import React, { useState, useEffect,useRef } from "react";
import { useGenericStore } from "../../store/VendorStore";
import { useSupabase } from "../SupaBaseProvider";
const AddDesignQuoteModal = ({ isOpen, onClose, onSave }) => {
  const {supabase} = useSupabase()
  const location = useLocation(); // Access the current URL
  const queryParams = new URLSearchParams(location.search); // Parse the query string
  const designId = queryParams.get("designId") || null;
  const { getEntityItemById, getEntity } = useGenericStore();
  const vendors = getEntity("vendors");
  const [uploadedImages,setUploadedImages]= useState([])
  const finalizeUploadRef = useRef(null)

  const [formData, setFormData] = useState({
    description: "",
    images: [],
    color: "Yellow",
    height: 0,
    length: 0,
    width: 0,
    weight: 0,
    necklace: false,
    necklaceCost: 0,
    manufacturerCode: "",
    metalType: "Gold",
    platingCharge: 0,
    stones: [],
    vendor: "",
    plating: 0,
    karat: "10K",
    designId: designId,
    collection: null,
    category: null,
    status: "Working_on_it:yellow",
  });
  const [lossPercent, setLossPercent] = useState(0);
  
  useEffect(() => {
    console.log(vendors, "vendors from store");

    setLossPercent(vendors[0].pricingsetting.lossPercentage);

    if (designId) {
      console.log("form with design id", designId);
      setFormData({
        ...formData,
        designId: parseInt(designId),
        vendor: vendors[0].id,
      });
    } else {
      setFormData({ ...formData, vendor: vendors[0].id });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { stones, ...rest } = formData;
    console.log(formData);
    const { data, error } = await supabase
      .from("starting_info")
      .insert([{ ...rest }])
      .select();
    const { error: stoneError } = await supabase.from("stones").insert(
      stones.map((stone) => ({
        ...stone,
        starting_info_id: data[0].id,
      }))
    );

    if (error || stoneError) {
      console.log("error inserting stones or starting info ", error);
    }

    console.log(data, "data from insert samples ");
    const { error: designIdError } = await supabase
      .from("designs")
      .update({ starting_info_id: data[0].id })
      .eq("id", designId)
      .select();

    if (designIdError) {
      console.log(designIdError);
    }
    finalizeUploadRef.current('starting_info',data[0].id,data[0].manufacturerCode,uploadedImages)

    onSave(data[0]);
    setFormData({
      description: "",
      images: [], 
      cad: [], 
      color: "Yellow",
      height: 0,
      length: 0,
      width: 0,
      weight: 0,
      manufacturerCode: "",
      metalType: "Gold",
      platingCharge: 0,
      stones: [],
      vendor: "",
      plating: "",
      karat: "10K",
      status: "Working_on_it:yellow",
    });
  };
  return (
    <DesignQuoteForm
      isOpen={isOpen}
      onClose={onClose}
      formData={formData}
      setFormData={setFormData}
      handleSubmit={handleSubmit}
      lossPercent={lossPercent}
      setLossPercent={setLossPercent}
      finalizeUploadRef={finalizeUploadRef}
      onUpload={(newImages)=> setUploadedImages([...uploadedImages,...newImages])}
    />
  );
};

export default AddDesignQuoteModal;
