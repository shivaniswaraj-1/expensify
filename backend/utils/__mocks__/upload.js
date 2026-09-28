module.exports = {
  uploadToCloudinary: jest.fn().mockResolvedValue("https://mock-cloudinary.test/mock.csv"),
  uploadImageToCloudinary: jest.fn().mockResolvedValue("https://mock-cloudinary.test/mock-receipt.jpg"),
};
