const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const stream = require('stream');
const cors = require('cors');
const dotenv = require('dotenv'); // Import dotenv
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow specific origins
const allowedOrigins = ['http://localhost:3000', 'https://ponmile-ati-dayo.onrender.com', 'https://ayodayo.netlify.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Use Multer for file handling, storing files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB file size limit

// Google API Setup with credentials and scopes
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString()),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle POST request to upload files
app.post('/home', upload.array('photos', 3), async (req, res) => {
  try {
    const files = req.files;
    if (!files) return res.status(400).send('No files uploaded.');

    for (const file of files) {
      const { originalname, buffer, mimetype } = file;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      try {
        // Upload the file to Google Drive
        const response = await drive.files.create({
          requestBody: {
            name: originalname,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Optional: to store in a specific folder
          },
          media: {
            mimeType: mimetype,
            body: bufferStream,
          },
          fields: 'id, webViewLink', // Get the file ID and view link
        });
        console.log(`Uploaded file with ID: ${response.data.id}`);
        // Make the file publicly accessible
        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
        // Send back the view link to the frontend
        return res.status(200).json({ success: true, viewLink: response.data.webViewLink });
      } catch (uploadError) {
        console.error('Error uploading to Google Drive:', uploadError.message);
        return res.status(500).send(`Error uploading ${originalname}`);
      }
    }
    res.status(200).send('Files uploaded successfully.');
  } catch (error) {
    console.error('Error uploading files:', error.message);
    res.status(500).send('Error uploading files.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
