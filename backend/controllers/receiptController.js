const asyncHandler = require("express-async-handler");
const { extractReceiptWithRetry } = require("../utils/extractReceipt");
const { uploadImageToCloudinary } = require("../utils/upload");

const scanReceipt = asyncHandler(async (req, res, next) => {
  const base64Image = req.file.buffer.toString("base64");
  const mimeType = req.file.mimetype;

  const extracted = await extractReceiptWithRetry(base64Image, mimeType);

  // Keep the photo even when extraction fails, so the user's evidence isn't
  // lost — they'll just fill the form in manually instead.
  let receiptUrl = null;
  try {
    receiptUrl = await uploadImageToCloudinary(
      req.file.buffer,
      `${req.user._id}-${Date.now()}`
    );
  } catch (error) {
    console.error("Receipt upload to Cloudinary failed:", error.message);
  }

  if (!extracted) {
    return res.status(200).json({
      success: false,
      message: "Couldn't read this receipt, please fill it in.",
      receiptUrl,
    });
  }

  res.status(200).json({
    success: true,
    extracted,
    receiptUrl,
  });
});

module.exports = { scanReceipt };
