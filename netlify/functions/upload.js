const createReadStream = require('fs').createReadStream;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');

// Downloaded from while creating credentials of service account
const pkey = require('../../config/servicekey.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 *
 */
async function authorize() {
  const jwtClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  )
  await jwtClient.authorize();
  return jwtClient;
}

/**
 * Create a new file on google drive.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function uploadFile(authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });

    const file = await drive.files.create({
      media: {
        body: createReadStream('filename')
      },
      fields: 'id',
      requestBody: {
        name: path.basename('filename'),
      },
    });
    console.log(file.data.id)
}