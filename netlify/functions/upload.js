const { google } = require('googleapis');
const stream = require('stream');
const process = require('process');

// Scopes required for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 */
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

async function uploadFile(authClient, file) {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Store in a specific folder if provided
      },
      media: {
        mimeType: file.mimetype,
        body: file.stream, // Use the stream directly
      },
      fields: 'id, webViewLink', // Get file ID and view link
    });

    // Make the file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the view link
    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file.');
  }
}

/**
 * Netlify handler function
 */
exports.handler = async (event) => {
  try {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    // Parse the incoming file from the request body
    const formData = new FormData(); // Create new FormData instance
    const data = formData.parse(event.body); // Parse the incoming form data

    // Loop through the files
    const files = data.files; // Adjust based on how you parse the files
    const links = [];

    for (const file of files) {
      const fileData = {
        stream: file, // The file stream directly
        originalname: file.name,
        mimetype: file.mimetype,
      };

      // Authorize the Google API client
      const authClient = await authorize();

      // Upload the file
      const viewLink = await uploadFile(authClient, fileData);
      links.push(viewLink);
    }

    // Return success with the Google Drive link
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Files uploaded successfully',
        viewLinks: links,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'File upload failed',
        error: error.message,
      }),
    };
  }
};
