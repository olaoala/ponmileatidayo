const createReadStream = require('fs').createReadStream;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');

// Downloaded from while creating credentials of service account

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 *
 */
// async function authorize() {
//   const jwtClient = new google.auth.JWT(
//     pkey.client_email,
//     null,
//     pkey.private_key,
//     SCOPES
//   )
//   await jwtClient.authorize();
//   return jwtClient;
// }


// Scopes required for accessing Google Drive

async function authorize() {
  try {
    // Load the credentials from the environment variable
    const serviceAccountCredentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf8')
    );

    const jwtClient = new google.auth.JWT(
      serviceAccountCredentials.client_email,
      null,
      serviceAccountCredentials.private_key,
      SCOPES
    );

    // Authorize the client
    await jwtClient.authorize();
    console.log('Google API authorization successful');
    
    return jwtClient;
  } catch (error) {
    console.error('Error authorizing Google API:', error);
    throw new Error('Failed to authorize Google API.');
  }
}

module.exports = authorize;


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