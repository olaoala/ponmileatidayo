const { google } = require('googleapis');
const process = require('process');
const stream = require('stream');

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

  // Decode body if it's base64 encoded
  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8');
  
  // Extract boundary from the content-type header
  const contentType = event.headers['content-type'] || event.headers['Content-Type'];
  const boundary = contentType.split('; ')[1].replace('boundary=', '');

  // Use a multipart parser like `busboy` or `formidable` to parse the buffer manually
  // This part can be more complex, depending on how you handle multipart data

  // Assuming you manually parsed the form data
  const parsedFile = { 
    originalFilename: 'file.jpg', 
    mimetype: 'image/jpeg', 
    buffer: bodyBuffer 
  };

  try {
    const authClient = await authorize();
    const viewLink = await uploadFile(authClient, parsedFile);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'File uploaded successfully',
        viewLink: viewLink,
      }),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'File upload failed',
        error: error.message,
      }),
    };
  }
};
