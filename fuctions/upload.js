// functions/upload.js
const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const formData = new FormData(); 
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully!' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error uploading file', error: error.message }),
    };
  }
};
