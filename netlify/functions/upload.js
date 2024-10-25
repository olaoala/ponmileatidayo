const { google } = require('googleapis');
const stream = require('stream');
const formidable = require('formidable');

// Google Drive Scopes
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Authorize with service account
async function authorize() {
  try {
    const serviceAccountCredentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf8')
    );

    const jwtClient = new google.auth.JWT(
      serviceAccountCredentials.client_email,
      null,
      serviceAccountCredentials.private_key,
      SCOPES
    );

    await jwtClient.authorize();
    console.log('Google API authorization successful');
    return jwtClient;
  } catch (error) {
    console.error('Error authorizing Google API:', error);
    throw new Error('Failed to authorize Google API.');
  }
}

// Upload file to Google Drive
async function uploadFile(authClient, file) {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.create({
      requestBody: {
        name: file.originalFilename, // Correctly pass file name
        parents: ['1-1MH0lRnqtN5X5EPlkAYN5ejZv-vyT3x'], // Folder ID
      },
      media: {
        mimeType: file.mimetype, // Correct file type
        body: stream.Readable.from(file.buffer), // Correctly pass file buffer
      },
      fields: 'id, webViewLink',
    });

    // Log the uploaded file details
    console.log('File uploaded:', response.data);

    // Set permissions to make file publicly viewable
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file.');
  }
}

// Netlify handler function
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Create a Formidable instance to parse the form data
  const form = new formidable.IncomingForm();

  // Parse the form data
  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ message: 'File upload failed', error: err.message }),
        });
      }

      // Access the first file uploaded
      const file = files.files[0]; 

      try {
        // Authorize Google Drive
        const authClient = await authorize();

        // Upload file to Google Drive
        const viewLink = await uploadFile(authClient, {
          originalFilename: file.originalFilename,
          mimetype: file.mimetype,
          buffer: file.filepath, // Use the correct file path provided by Formidable
        });

        // Return success response with view link
        return resolve({
          statusCode: 200,
          body: JSON.stringify({
            message: 'File uploaded successfully',
            viewLink: viewLink,
          }),
        });
      } catch (error) {
        console.error('Error in handler:', error);
        return resolve({
          statusCode: 500,
          body: JSON.stringify({
            message: 'File upload failed',
            error: error.message,
          }),
        });
      }
    });
  });
};
