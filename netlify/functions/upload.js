const { google } = require('googleapis');
const Busboy = require('busboy');  // Corrected import for Busboy
const stream = require('stream');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

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
  console.log('Google API authorization successful');
  return jwtClient;
}

async function uploadFile(authClient, file) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: ['1-1MH0lRnqtN5X5EPlkAYN5ejZv-vyT3x'],
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
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const busboy = new Busboy({ headers: event.headers });  // Correct Busboy usage
  const files = [];

  return new Promise((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      let fileBuffer = [];
      file.on('data', (data) => fileBuffer.push(data));
      file.on('end', () => {
        files.push({
          originalname: filename,
          buffer: Buffer.concat(fileBuffer),
          mimetype,
        });
      });
    });

    busboy.on('finish', async () => {
      if (files.length === 0) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ message: 'No files uploaded' }),
        });
      }

      try {
        const authClient = await authorize();
        const viewLink = await uploadFile(authClient, files[0]);

        resolve({
          statusCode: 200,
          body: JSON.stringify({
            message: 'File uploaded successfully',
            viewLink,
          }),
        });
      } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        reject({
          statusCode: 500,
          body: JSON.stringify({
            message: 'File upload failed',
            error: error.message,
          }),
        });
      }
    });

    busboy.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8'));
  });
};
