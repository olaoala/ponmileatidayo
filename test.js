const { google } = require('googleapis');
const key = require('./config/servicekey.json');


// Path to your service account key file
const KEYFILEPATH = key; // Adjust the path as necessary
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Create a JWT client
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Initialize the Google Drive API
const drive = google.drive({ version: 'v3', auth });

// Test API call: List files in Google Drive
async function listFiles() {
  try {
    const res = await drive.files.list({
      pageSize: 10, // Number of files to retrieve
      fields: 'files(id, name)', // Fields to return
    });
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.forEach((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  } catch (error) {
    console.error('Error listing files:', error);
  }
}

// Run the test
listFiles();
