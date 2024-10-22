const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');
const process = require('process');
const { createReadStream } = require('fs');

// Scopes required for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 */
async function authorize() {
  try {
    // Load the credentials from the environment variable
    const serviceAccountCredentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf8')
    );

    const jwtClient = new google.auth.JWT(
      serviceAccountCredentials.client_email,
      null,
      serviceAccountCredentials.private_key,
      SCOPES
    );

    // Authorize the client
    await jwtClient.authorize();
    console.log('Google API authorization successful');
    
    return jwtClient;
  } catch (error) {
    console.error('Error authorizing Google API:', error);
    throw new Error('Failed to authorize Google API.');
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadFile(authClient, file) {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    // Create a readable stream from the file buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    
 

    // Replace 'YOUR_FOLDER_ID' with the actual ID of the shared folder
const FOLDER_ID = '1-1MH0lRnqtN5X5EPlkAYN5ejZv-vyT3x';

// Use this ID in your file upload request
const response = await drive.files.create({
  requestBody: {
    name: originalname,
    parents: [FOLDER_ID],
  },
  media: {
    mimeType: mimetype,
    body: bufferStream,
  },
  fields: 'id, webViewLink',
});


    // Make the file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the view link
    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file.');
  }
}

/**
 * Netlify handler function
 */
exports.handler = async (event) => {
  try {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    // Parse the incoming file from the request body
    const data = JSON.parse(event.body);
    const file = {
      buffer: Buffer.from(data.fileContent, 'base64'), // assuming the file content is sent as base64
      originalname: data.fileName,
      mimetype: data.mimeType,
    };

    // Authorize the Google API client
    const authClient = await authorize();

    // Upload the file
    const viewLink = await uploadFile(authClient, file);

    // Return success with the Google Drive link
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'File uploaded successfully',
        viewLink: viewLink,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'File upload failed',
        error: error.message,
      }),
    };
  }
};
