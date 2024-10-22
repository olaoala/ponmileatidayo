const { google } = require('googleapis');
const stream = require('stream');
const multer = require('multer');
const process = require('process');

// Initialize Multer
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Scopes required for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize with service account and get jwt client
 */
async function authorize() {
  // (your existing authorize function)
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
        body: stream.Readable.from(file.buffer), // Convert buffer to readable stream
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
exports.handler = upload.single('files'), async (event, context) => {
  try {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    // The file is available in req.file
    const file = event.file; // Adjust this based on how the file is passed

    // Authorize the Google API client
    const authClient = await authorize();

    // Upload the file
    const viewLink = await uploadFile(authClient, file);

    // Return success with the Google Drive link
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
