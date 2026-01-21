import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data?.error || 'Failed to upload file';
  }
};

export const getFileUrl = (filename) => {
  return `${API_URL}/uploads/${filename}`;
};
