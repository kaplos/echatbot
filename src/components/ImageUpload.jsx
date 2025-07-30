import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useSupabase } from "./SupaBaseProvider";

const ImageUpload = ({
  images: inital,
  onChange,
  collection ='image',
  onUpload,
  finalizeUpload,
  forDisplay,
}) => {

  console.log(inital, "images from ImageUpload");
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null); // for per-image delete loading

  const [imageToShow, setImageToShow] = useState(inital[0] || null);
  const [images, setImages] = useState(
    inital.filter((image) => image !== "") || []
  );
  // useEffect(() => {
  //   setImages(inital.filter((image) => image !== ""));
  //   setImageToShow(images[0] || null);
  // }, [inital]);
useEffect(() => {
  if (finalizeUpload) {
    finalizeUpload.current = linkImagesToEntity;
  }
}, [images]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = await  handleImageUpload(files);
    console.log(imageUrls, "imageUrls from upload");
    // console.log('Calling onChange with:', [...images, ...imageUrls]);
    // setImages([...images,...imageUrls])
    // setImageToShow(imageUrls[0]); // Show the first uploaded image
    setImages((prev)=> [... new Set([...inital,...prev, ...imageUrls])]);
  };

const handleImageUpload = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setUploading(true);

  try {
    const uploadedImages = [];

    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("echatbot")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const imageUrl = supabase.storage
        .from("echatbot")
        .getPublicUrl(fileName).data.publicUrl;

      // Save metadata to DB
      const { data: insertData, error: insertError } = await supabase
        .from("images")
        .insert([{ imageUrl, originalUrl: imageUrl }])
        .select("id, imageUrl")
        .single();

      if (insertError) {
        console.error("DB insert error:", insertError);
        continue;
      }

      uploadedImages.push(insertData);
    }

    // Add to local state
    const newImages = [...images, ...uploadedImages];
    setImages(newImages);
    onChange?.(newImages);
  } finally {
    setUploading(false);
  }
};





  const linkImagesToEntity = async (entity, entityId,styleNumber,images) => {
    console.log(images)

    if (!Array.isArray(images)) return;
    
    const imageIds = images.map((img) => img.id).filter(Boolean); 

    const { error } = await supabase.from("image_link").insert(
      imageIds.map((imageId) => {

        // if(imageId)
        console.log(imageId)
        
       return{
          imageId: imageId,
          styleNumber,
          entity,
          entityId,
          type:collection
        }
        
      }
    ))
    
    if (error) {
      console.error("Failed to link images:", error);
    } else {
      console.log("Images linked to entity successfully");
    }
    const uniqueSuffix = Date.now();

    const formatted = `${uniqueSuffix}`;
    console.log(formatted); // Example: "7_4_2025"
    
    await Promise.all(
      images.map(async (image) => {
        const decoded = decodeURIComponent(image.imageUrl);
        const oldPath = decoded.split('/echatbot/')[1]; // get the path inside bucket
        const extension = oldPath.split('.').pop(); // get file extension
    
        const newPath = `public/${styleNumber}_${formatted}.${extension}`;
    
        // Move the image in Supabase Storage
        const { error: moveError } = await supabase.storage
          .from('echatbot')
          .move(oldPath, `${newPath}`);
    
        if (moveError) {
          console.error(`Error moving ${oldPath}:`, moveError);
          return;
        }
    
        // Update the image metadata in the 'images' table
        const fullNewUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/echatbot/${newPath}`
        const {data, error: updateError } = await supabase
          .from('images')
          .update({ imageUrl: fullNewUrl, name: newPath })
          .eq('id', image.id)
          .select()
        
        if (updateError) {
          console.error(`Error updating image row for ${image.imageUrl}:`, updateError);
        }
        console.log(data[0])
      })
    );
    
      
    
      

  };
  
  const removeImage = async (index) => {
  const image = images[index];
  if (!image) return;

  if (!window.confirm("Delete this image?")) return;

  setDeletingIndex(index);

  try {
    const decoded = decodeURIComponent(image.imageUrl || image);
    const pathInBucket = decoded.split("/echatbot/")[1];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("echatbot")
      .remove([pathInBucket]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete from DB
    if (image.id) {
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("id", image.id);

      if (dbError) {
        console.error("DB delete error:", dbError);
      }
    }

    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onChange?.(newImages);

    if (imageToShow === image.imageUrl) {
      setImageToShow(newImages[0]?.imageUrl || null);
    }
  } finally {
    setDeletingIndex(null);
  }
};


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onChange([...images, ...files]);
  };

  // console.log('imageToShow', );

  return (
    <div className="space-y-4 flex flex-col">
      {/* Fixed size container for the big image with a max size */}
      <div className="flex flex-wrap gap-2 w-full mb-4">
        <div className="relative w-full max-w-md max-h-64 min-h-64 mx-auto overflow-hidden ">
          {" "}
          {/* Slightly wider container */}
          {imageToShow ? (
            <img
              src={imageToShow}
              alt="Selected Image"
              className="object-contain w-full h-full rounded-lg" // Ensures image fits without distortion, cropping if necessary
            />
          ) : (
            "No Images Uploaded Yet"
          )}
        </div>
      </div>

      {/* Thumbnails for preview */}
      <div className="flex flex-wrap gap-2 pt-4 pr-4">
        {uploading && (
          <div className="text-center text-sm text-gray-500 my-2">Uploading...</div>
        )}
        {Array.isArray(images) &&
          images.map((image, index) => (
            <div
              key={index}
              className="relative"
              onClick={() => setImageToShow(image)}
            >
              <img
                src={image}
                alt={`Upload Preview ${index}`}
                className="w-24 h-24 object-contain rounded-md border-2 border-gray-300 cursor-pointer"
              />
              {!forDisplay ? (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  &times;
                </button>
              ) : (
                ""
              )}
            </div>
          ))}
      </div>

      {/* Drag and drop area */}
      {!forDisplay ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 p-4 rounded-md"
        >
          <input
            type="file"
            multiple
            accept={
              collection === "image"
                ? "image/*"
                : "image/* , .dwg, .dxf, .step, .stp, .iges, .igs, .sat, .3dm, .stl"
            }
            onChange={handleImageChange}
            className="hidden"
            id={collection}
          />
          <label htmlFor={collection} className="cursor-pointer">
            <div className="flex justify-center items-center w-8 h-8 bg-gray-200 rounded-full mx-auto">
              <Upload className="text-gray-500 w-4 h-4" />
            </div>
            <p className="text-gray-700 text-sm font-medium mt-2">
              Choose a file or drag and drop it here
            </p>
            <p className="text-xs text-gray-500">
              We recommend using high quality .jpg files less than 20 MB or .mp4
              files less than 200 MB.
            </p>
          </label>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ImageUpload;
