import apiClient from './client';

export const uploadApi = {
  /**
   * Upload hình ảnh (ảnh bìa sách, avatar...) lên Cloudinary
   * @param {File} file
   * @returns {Promise<string>} Secure URL của ảnh trên Cloudinary
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/ulms/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  /**
   * Upload file PDF sách điện tử (E-Book) lên Cloudinary
   * @param {File} file
   * @returns {Promise<string>} Secure URL của file PDF trên Cloudinary
   */
  uploadPdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/ulms/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },
};

export default uploadApi;
