import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

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
      formData.append('files', file); // Append each file to the FormData
    });

    try {
      const response = await axios.post('../../.netlify/functions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for file uploads
        },
      });
      console.log('File uploaded successfully:', response.data);
      setMessage('Files uploaded successfully');

      // Show modal on successful upload
      setShowModal(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('File upload failed.');
    }
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal when the 'ok oo' button is clicked
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-sm">
            <h3 className="text-lg font-bold mb-4">Chill till Saturday, we can't wait to see you!</h3>
            <button
              onClick={closeModal}
              className="mt-4 px-6 py-2 bg-rose-gold text-white rounded-lg hover:bg-chocolate transition"
            >
              ok oo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
