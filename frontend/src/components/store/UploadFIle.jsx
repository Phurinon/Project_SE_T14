import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Resize from "react-image-file-resizer";
import { createShopImages, deleteShopImages } from "../../api/shop";
import { X, ImagePlus } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";

const UploadFile = ({ form, setForm }) => {
  const token = useDusthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (files) => {
    if (isLoading) return;

    setIsLoading(true);
    let allFiles = [...form.images];
    let uploadPromises = [];

    for (let file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} is not a valid image`);
        continue;
      }

      const uploadPromise = new Promise((resolve, reject) => {
        Resize.imageFileResizer(
          file,
          720,
          720,
          "JPEG",
          80,
          0,
          (data) => {
            createShopImages(data, token)
              .then((res) => resolve(res))
              .catch((err) => reject(err));
          },
          "base64"
        );
      });

      uploadPromises.push(uploadPromise);
    }

    Promise.all(uploadPromises)
      .then((uploadedImages) => {
        const newFiles = [...allFiles, ...uploadedImages];
        setForm({
          ...form,
          images: newFiles,
        });
        setIsLoading(false);
        toast.success("Images uploaded successfully!");
      })
      .catch((err) => {
        console.error("Upload error:", err);
        setIsLoading(false);
        toast.error("Error uploading images");
      });
  };

  const handleDelete = (public_id) => {
    deleteShopImages(public_id, token)
      .then((res) => {
        const filterImages = form.images.filter(
          (item) => item.public_id !== public_id
        );

        setForm({
          ...form,
          images: filterImages,
        });
        toast.success(res.message || "Image deleted successfully");
      })
      .catch((err) => {
        console.error("Delete error:", err);
        toast.error(
          err.response?.data?.message || err.message || "Failed to delete image"
        );
      });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {form.images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {form.images.map((item, index) => (
            <div
              key={index}
              className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md"
            >
              <img
                src={item.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(item.public_id)}
                className="absolute top-1 right-1 bg-red-500 text-white 
                                           rounded-full p-1 hover:bg-red-600 
                                           transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 
                           text-center cursor-pointer hover:border-blue-500 
                           transition-colors duration-300"
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isLoading ? "Uploading..." : "Upload Images"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
