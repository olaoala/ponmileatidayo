const { google } = require('googleapis');
const busboy = require('busboy');
const stream = require('stream');

// Scopes required for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

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
        name: file.filename,
        parents: ['your-folder-id-here'],
      },
      media: {
        mimeType: file.mimeType,
        body: file.stream,
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

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const bb = busboy({ headers: event.headers });
  const files = [];

  const authClient = await authorize();

  return new Promise((resolve, reject) => {
    bb.on('file', (fieldname, file, filename, encoding, mimeType) => {
      const fileData = {
        filename,
        mimeType,
        stream: file, // The file stream
      };
      files.push(fileData);
    });

    bb.on('finish', async () => {
      try {
        const viewLinks = [];
        for (const file of files) {
          const viewLink = await uploadFile(authClient, file);
          viewLinks.push(viewLink);
        }
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'Files uploaded successfully', viewLinks }),
        });
      } catch (error) {
        console.error('Error handling upload:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ message: 'File upload failed', error: error.message }),
        });
      }
    });

    bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
  });
};
