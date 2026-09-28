     const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

function uploadToCloudinary(csvContent, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "SpendWise", resource_type: "raw", public_id: filename },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = Buffer.from(csvContent, "utf-8");
    const readableStream = Readable.from([bufferStream]);

    readableStream.pipe(uploadStream);
  });
}

// Uploads a scanned receipt photo (as a Buffer, from multer's memory
// storage) so it can be linked to the expense it was scanned for.
function uploadImageToCloudinary(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "SpendWise/receipts", resource_type: "image", public_id: filename },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    Readable.from([imageBuffer]).pipe(uploadStream);
  });
}

module.exports = { uploadToCloudinary, uploadImageToCloudinary };
