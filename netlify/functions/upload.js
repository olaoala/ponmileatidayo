const { google } = require('googleapis');
const multer = require('multer');
const stream = require('stream');

// Set up Multer
const storage = multer.memoryStorage(); // Store files in memory buffer
const upload = multer({ storage }).single('file'); // Adjust as needed for multiple files

// Scopes required for accessing Google Drive
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

exports.handler = (event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Simulate req/res for multer
  const req = {
    body: Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'),
    headers: event.headers,
  };

  const res = {
    send: (response) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(response),
      });
    },
    status: (statusCode) => ({
      send: (response) => {
        callback(null, {
          statusCode,
          body: JSON.stringify(response),
        });
      },
    }),
  };

  // Use Multer to parse the incoming form data
  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).send({ message: 'File upload failed', error: err.message });
    }

    try {
      const authClient = await authorize();
      const file = req.file; // Multer attaches the file here

      const viewLink = await uploadFile(authClient, file);

      res.send({ message: 'File uploaded successfully', viewLink });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send({ message: 'Upload failed', error: error.message });
    }
  });
};
