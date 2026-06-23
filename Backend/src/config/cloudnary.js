import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an in-memory file buffer (from multer) directly to Cloudinary.
 * Returns the secure URL and public id so the public id can be stored for
 * later deletion.
 */
export const uploadToCloudinary = (buffer, folder = "ecom") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    uploadStream.end(buffer);
  });
};

/** Remove an image from Cloudinary by its public id. */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Deletion failures should not break the request; log and move on.
    console.error("Cloudinary delete failed:", error.message);
  }
};

export default cloudinary;
