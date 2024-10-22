import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setMessage('You can upload a maximum of 3 pictures.');
    } else {
      setFiles(selectedFiles);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please upload at least one file.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file); // 'photos' matches the backend field name
    });

    try {
      const response = await axios.post('/.netlify/functions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      setMessage('Pictures uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error uploading pictures. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-2/4 text-rose-dark-tint bg-gray-100 mb-10 p-4 shadow-lg rounded-lg">
      <h2 className="font-cardo text-xl font-bold m-1">Upload Your Wedding Pictures</h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="m-4"
        />
        <p className="text-sm text-gray-600">Max 3 pictures allowed</p>
        <button
          type="submit"
          className="inline-block mt-4 px-6 py-2 bg-rose-gold text-white rounded-lg hover:bg-chocolate transition"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
};

export default UploadPage;
