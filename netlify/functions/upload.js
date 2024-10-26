const { google } = require('googleapis');
const stream = require('stream');

// Google Drive Scopes
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with Google service account
 */
async function authorize() {
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
  return jwtClient;
}

/**
 * Parse multipart/form-data request manually
 */
async function parseMultipartFormData(event) {
  const contentType = event.headers['content-type'] || event.headers['Content-Type'];
  const boundary = contentType.split('; ')[1].replace('boundary=', '');
  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8');
  
  // Convert the Buffer to a string for splitting
  const bodyString = bodyBuffer.toString();

  const parts = bodyString.split(`--${boundary}`);

  // Extracting the file from the multipart body
  const filePart = parts.find((part) => part.includes('Content-Type: image'));
  if (!filePart) throw new Error('File not found in the request body');

  const fileStartIndex = filePart.indexOf('\r\n\r\n') + 4;
  const fileBuffer = Buffer.from(filePart.slice(fileStartIndex, filePart.lastIndexOf('\r\n--')));

  // Extract filename
  const filenameMatch = filePart.match(/filename="(.+?)"/);
  const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

  return { filename, fileBuffer };
}

/**
 * Upload file to Google Drive
 */
async function uploadFile(authClient, fileName, fileBuffer) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileStream = stream.Readable.from(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ['1-1MH0lRnqtN5X5EPlkAYN5ejZv-vyT3x'],
    },
    media: {
      mimeType: 'image/*', // Adjust mimeType as necessary
      body: fileStream,
    },
    fields: 'id, webViewLink',
  });

  // Make the file publicly accessible
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return response.data.webViewLink;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Parse the multipart form data
    const { filename, fileBuffer } = await parseMultipartFormData(event);

    // Google API authorization
    const authClient = await authorize();

    // Upload the file to Google Drive
    const viewLink = await uploadFile(authClient, filename, fileBuffer);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'File uploaded successfully',
        viewLink: viewLink,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'File upload failed',
        error: error.message,
      }),
    };
  }
};
