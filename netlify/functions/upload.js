const { google } = require('googleapis');
const stream = require('stream');
const process = require('process');
const formidable = require('formidable');
require('fs'); // Import fs module


// Scopes required for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 */
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

async function uploadFile(authClient, file) {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: stream.Readable.from(file.buffer),
      },
      fields: 'id, webViewLink',
    });

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

/**
 * Netlify handler function
 */
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ message: 'File upload failed', error: err.message }),
        });
      }

      try {
        const authClient = await authorize();
        const file = files.files[0]; // Adjust this index if you're sending multiple files

        // Read file from the uploaded files
        const fileStream = stream.Readable.from(file.filepath); // Path to file from formidable

        const viewLink = await uploadFile(authClient, {
          originalname: file.originalFilename,
          mimetype: file.mimetype,
          buffer: fileStream,
        });

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
