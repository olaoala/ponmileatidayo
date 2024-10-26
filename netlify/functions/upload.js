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
 * Parse multipart/form-data request manually for multiple files
 */
async function parseMultipartFormData(event) {
  const contentType = event.headers['content-type'] || event.headers['Content-Type'];
  const boundary = contentType.split('; ')[1].replace('boundary=', '');
  const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8');
  
  // Convert the Buffer to a string for splitting
  const bodyString = bodyBuffer.toString();

  const parts = bodyString.split(`--${boundary}`).filter(part => part.includes('Content-Type: image'));

  const files = parts.map((filePart) => {
    const fileStartIndex = filePart.indexOf('\r\n\r\n') + 4;
    const fileBuffer = Buffer.from(filePart.slice(fileStartIndex, filePart.lastIndexOf('\r\n--')));

    // Extract filename
    const filenameMatch = filePart.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

    // Extract MIME type
    const mimeTypeMatch = filePart.match(/Content-Type: (.+?)\r\n/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

    return { filename, fileBuffer, mimeType };
  });

  return files;
}

/**
 * Upload file to Google Drive
 */
async function uploadFile(authClient, fileName, fileBuffer, mimeType) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileStream = stream.Readable.from(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ['1-1MH0lRnqtN5X5EPlkAYN5ejZv-vyT3x'], // Update with your Google Drive folder ID
    },
    media: {
      mimeType: mimeType, // Use the detected MIME type
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
    const files = await parseMultipartFormData(event);

    if (!files || files.length === 0) {
      throw new Error('No files found in the request');
    }

    // Google API authorization
    const authClient = await authorize();

    // Upload each file to Google Drive
    const uploadedFiles = [];
    for (const { filename, fileBuffer, mimeType } of files) {
      const viewLink = await uploadFile(authClient, filename, fileBuffer, mimeType);
      uploadedFiles.push({ filename, viewLink });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Files uploaded successfully',
        uploadedFiles: uploadedFiles,
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
