const { google } = require('googleapis');
const stream = require('stream');
const process = require('process');
const multer = require('multer');

// Initialize Multer
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

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

  return new Promise((resolve, reject) => {
    // Use multer to handle the file upload
    upload.single('files')(event, context, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ message: 'File upload failed', error: err.message }),
        });
      }

      try {
        const authClient = await authorize();

        // The file is available in req.file
        const file = context.file; // This will be set by multer

        // Upload the file
        const viewLink = await uploadFile(authClient, file);

        // Return success with the Google Drive link
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
