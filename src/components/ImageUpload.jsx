import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { useSupabase } from './SupaBaseProvider';

const ImageUpload = ({ images, onChange, type = "image" }) => {
  const supabase = useSupabase();

  const [imageToShow, setImageToShow] = useState(images[0] || null);
  useEffect(() => {
    setImageToShow(images[0] || null);
  }, [images]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = await handleImageUpload(files);
    console.log(imageUrls, 'imageUrls from upload');
    onChange([...images, ...imageUrls]);
  };

  const handleImageUpload = async (files) => {
    const imageUrls = [];
    for (const file of files) {
      console.log(file, 'file name');
      const { data, error } = await supabase.storage
        .from('echatbot') // Replace with your bucket name
        .upload(`public/${file.name}`, file);

      const { data: publicURL } = supabase.storage
        .from('echatbot') // Replace with your bucket name
        .getPublicUrl(`public/${file.name}`);
      console.log(publicURL, 'publicURL');

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }
      console.log(data, 'data from upload');
      imageUrls.push(publicURL.publicUrl);
      console.log(imageUrls, 'imageUrls');
    }
    return imageUrls;
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onChange([...images, ...files]);
  };

  console.log('imageToShow', Array.isArray(images));

  return (
    <div className="space-y-4 flex flex-col">
      {/* Fixed size container for the big image with a max size */}
      <div className="flex flex-wrap gap-2 w-full mb-4">
        <div className="relative w-full max-w-md max-h-64 min-h-64 mx-auto overflow-hidden"> {/* Slightly wider container */}
          <img
            src={imageToShow}
            alt="Selected Image"
            className="object-contain w-full h-full rounded-lg" // Ensures image fits without distortion, cropping if necessary
          />
        </div>
      </div>

      {/* Thumbnails for preview */}
      <div className="flex flex-wrap gap-2 pt-4 pr-4">
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
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                &times;
              </button>
            </div>
          ))}
      </div>

      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 p-4 rounded-md"
      >
        <input
          type="file"
          multiple
          accept={
            type === 'image'
              ? 'image/*'
              : 'image/* , .dwg, .dxf, .step, .stp, .iges, .igs, .sat, .3dm, .stl'
          }
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex justify-center items-center w-8 h-8 bg-gray-200 rounded-full mx-auto">
            <Upload className="text-gray-500 w-4 h-4" />
          </div>
          <p className="text-gray-700 text-sm font-medium mt-2">
            Choose a file or drag and drop it here
          </p>
          <p className="text-xs text-gray-500">
            We recommend using high quality .jpg files less than 20 MB or .mp4 files less than 200 MB.
          </p>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
