// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const { CohereClient } = require('cohere-ai');
const path = require('path'); // Built-in module for file path handling

// Initialize Express application
const app = express();

// Multer setup for handling file uploads
const upload = multer({ 
  dest: 'uploads/', // Uploaded files will be stored in the 'uploads/' folder
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Define allowed file types
    const mimetype = filetypes.test(file.mimetype); // Check MIME type
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension

    if (mimetype && extname) {
      return cb(null, true); // Allow file upload
    } else {
      cb('Error: File type not supported!'); // Reject unsupported file types
    }
  }
});

// Initialize Cohere AI client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // API key stored in .env
});

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON requests
app.use('/uploads', express.static('uploads')); // Serve uploaded images statically

// Function to generate prompt for AI
const CODE_PROMPT_TEMPLATE = (text) => `
You are a senior web developer. Create a responsive website based on this description:
${text}

Include:
1. Semantic HTML structure
2. Modern CSS (flexbox/grid)
3. Mobile-first approach
4. Clean, commented code
5. Implementation steps

Format response as JSON:
{
  "code": "full_html_code",
  "steps": ["step1", "step2"]
}
`;

// Chatbot API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Cohere AI to generate response
    const response = await cohere.chat({
      message: message,
      model: 'command',
      temperature: 0.7,
      maxTokens: 500
    });

    res.json({
      response: response.text // Send AI-generated response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// Image upload & processing API endpoint
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Extract text from image using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      req.file.path, // Path of uploaded image
      'eng', // Language set to English
      { logger: m => console.log(m) } // Log OCR progress
    );

    // Send extracted text to Cohere AI for website generation
    const response = await cohere.chat({
      message: CODE_PROMPT_TEMPLATE(text),
      model: 'command',
      temperature: 0.7,
      maxTokens: 500
    });

    // Parse AI response to extract code and steps
    const parsedResponse = JSON.parse(response.text);

    res.json({
      imageUrl: `/uploads/${req.file.filename}`, // URL of uploaded image
      code: parsedResponse.code, // AI-generated website code
      steps: parsedResponse.steps // Steps to implement the code
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
});

// Start the server on port 5000
app.listen(5000, () => console.log('Server running on port 5000'));
